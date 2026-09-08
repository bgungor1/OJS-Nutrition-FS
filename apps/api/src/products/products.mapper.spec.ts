import { Prisma, ProductVariant } from '@prisma/client';
import { ProductsMapper, ProductWithVariants } from './products.mapper';
import { createMockProduct } from './test/products.fixture';

describe('ProductsMapper', () => {
  const createMockVariant = (
    overrides: Partial<ProductVariant> = {},
  ): ProductVariant => ({
    id: 'var-1',
    productId: 'prod-1',
    gram: 400,
    pieces: 1,
    totalServings: 16,
    aroma: 'Çikolata',
    totalPrice: new Prisma.Decimal(549),
    discountedPrice: new Prisma.Decimal(499),
    pricePerServing: new Prisma.Decimal(31.18),
    photoSrc: 'media/products/whey-protein.jpg',
    isAvailable: true,
    stockQuantity: 25,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  });

  describe('toPriceInfo', () => {
    it('boş varyant listesinde güvenli varsayılan değerleri dönmeli', () => {
      const result = ProductsMapper.toPriceInfo([]);

      expect(result).toEqual({
        profit: null,
        total_price: 0,
        discounted_price: null,
        price_per_servings: null,
        discount_percentage: null,
      });
    });

    it('indirimli varyant için kâr ve indirim yüzdesini doğru hesaplamalı', () => {
      const variant = createMockVariant({
        totalPrice: new Prisma.Decimal(1000),
        discountedPrice: new Prisma.Decimal(800),
        pricePerServing: new Prisma.Decimal(50),
      });

      const result = ProductsMapper.toPriceInfo([variant]);

      expect(result).toEqual({
        total_price: 1000,
        discounted_price: 800,
        profit: 200,
        discount_percentage: 20,
        price_per_servings: 50,
      });
    });

    it('ondalıklı indirimde kârı iki basamağa yuvarlamalı', () => {
      const variant = createMockVariant({
        totalPrice: new Prisma.Decimal(549.9),
        discountedPrice: new Prisma.Decimal(499.95),
        pricePerServing: new Prisma.Decimal(31.18),
      });

      const result = ProductsMapper.toPriceInfo([variant]);

      expect(result.profit).toBe(49.95);
      expect(result.discount_percentage).toBe(9);
    });

    it('indirimsiz varyantta profit ve discount_percentage null dönmeli', () => {
      const variant = createMockVariant({
        totalPrice: new Prisma.Decimal(750),
        discountedPrice: null,
        pricePerServing: new Prisma.Decimal(25),
      });

      const result = ProductsMapper.toPriceInfo([variant]);

      expect(result).toEqual({
        total_price: 750,
        discounted_price: null,
        profit: null,
        discount_percentage: null,
        price_per_servings: 25,
      });
    });

    it('totalPrice 0 veya negatif olduğunda discount_percentage null olmalı', () => {
      const variant = createMockVariant({
        totalPrice: new Prisma.Decimal(0),
        discountedPrice: new Prisma.Decimal(0),
        pricePerServing: new Prisma.Decimal(0),
      });

      const result = ProductsMapper.toPriceInfo([variant]);

      expect(result.profit).toBe(0);
      expect(result.discount_percentage).toBeNull();
    });

    it('birden fazla varyant olduğunda ilk varyantı (primary) referans almalı', () => {
      const variant1 = createMockVariant({
        id: 'var-1',
        totalPrice: new Prisma.Decimal(300),
        discountedPrice: null,
      });
      const variant2 = createMockVariant({
        id: 'var-2',
        totalPrice: new Prisma.Decimal(500),
        discountedPrice: new Prisma.Decimal(450),
      });

      const result = ProductsMapper.toPriceInfo([variant1, variant2]);

      expect(result.total_price).toBe(300);
      expect(result.discounted_price).toBeNull();
    });
  });

  describe('toVariant', () => {
    it('varyantı API formatına eksiksiz dönüştürmeli', () => {
      const variant = createMockVariant();

      const result = ProductsMapper.toVariant(variant);

      expect(result).toEqual({
        id: 'var-1',
        size: {
          gram: 400,
          pieces: 1,
          total_services: 16,
        },
        aroma: 'Çikolata',
        price: {
          profit: 50,
          total_price: 549,
          discounted_price: 499,
          price_per_servings: 31.18,
          discount_percentage: 9,
        },
        photo_src: 'media/products/whey-protein.jpg',
        is_available: true,
      });
    });

    it('is_available: isAvailable: true VE stockQuantity > 0 iken true dönmeli', () => {
      const variant = createMockVariant({
        isAvailable: true,
        stockQuantity: 10,
      });

      const result = ProductsMapper.toVariant(variant);
      expect(result.is_available).toBe(true);
    });

    it('is_available: stockQuantity === 0 iken isAvailable true olsa bile false dönmeli', () => {
      const variant = createMockVariant({
        isAvailable: true,
        stockQuantity: 0,
      });

      const result = ProductsMapper.toVariant(variant);
      expect(result.is_available).toBe(false);
    });

    it('is_available: isAvailable: false iken stok olsa dahi false dönmeli', () => {
      const variant = createMockVariant({
        isAvailable: false,
        stockQuantity: 100,
      });

      const result = ProductsMapper.toVariant(variant);
      expect(result.is_available).toBe(false);
    });

    it('indirimsiz varyantta price alanlarının doğru oluşması', () => {
      const variant = createMockVariant({
        totalPrice: new Prisma.Decimal(600),
        discountedPrice: null,
      });

      const result = ProductsMapper.toVariant(variant);

      expect(result.price.profit).toBeNull();
      expect(result.price.discounted_price).toBeNull();
      expect(result.price.discount_percentage).toBeNull();
      expect(result.price.total_price).toBe(600);
    });
  });

  describe('toProduct', () => {
    it('ürün modelini ApiProduct formatına dönüştürmeli', () => {
      const product = createMockProduct() as unknown as ProductWithVariants;

      const result = ProductsMapper.toProduct(product);

      expect(result).toEqual({
        id: 'prod-1',
        name: 'WHEY PROTEIN',
        short_explanation: 'En popüler protein tozu',
        slug: 'whey-protein',
        price_info: {
          profit: 50,
          total_price: 549,
          discounted_price: 499,
          price_per_servings: 31.18,
          discount_percentage: 9,
        },
        photo_src: 'media/products/whey-protein.jpg',
        comment_count: 150,
        average_star: 4.8,
      });
    });

    it('varyantı olmayan üründe photo_src boş string dönmeli', () => {
      const product = createMockProduct({
        variants: [],
      }) as unknown as ProductWithVariants;

      const result = ProductsMapper.toProduct(product);

      expect(result.photo_src).toBe('');
      expect(result.price_info.total_price).toBe(0);
    });
  });

  describe('toBestSeller', () => {
    it('ürün modelini ApiBestSellerProduct formatına (id içermez) dönüştürmeli', () => {
      const product = createMockProduct() as unknown as ProductWithVariants;

      const result = ProductsMapper.toBestSeller(product);

      expect(result).toEqual({
        name: 'WHEY PROTEIN',
        short_explanation: 'En popüler protein tozu',
        slug: 'whey-protein',
        price_info: {
          profit: 50,
          total_price: 549,
          discounted_price: 499,
          price_per_servings: 31.18,
          discount_percentage: 9,
        },
        photo_src: 'media/products/whey-protein.jpg',
        comment_count: 150,
        average_star: 4.8,
      });
      expect('id' in result).toBe(false);
    });
  });

  describe('toProductDetail', () => {
    it('ürün detayını varyantları ve besin değerleriyle birlikte dönüştürmeli', () => {
      const product = createMockProduct() as unknown as ProductWithVariants;

      const result = ProductsMapper.toProductDetail(product);

      expect(result.id).toBe('prod-1');
      expect(result.name).toBe('WHEY PROTEIN');
      expect(result.slug).toBe('whey-protein');
      expect(result.explanation.usage).toBe('1 ölçek su ile karıştırılır');
      expect(result.explanation.features).toBe('Yüksek protein\nDüşük yağ');
      expect(result.explanation.description).toBe('Açıklama metni');
      expect(result.explanation.nutritional_content).toEqual(
        product.nutritionalContent,
      );
      expect(result.main_category_id).toBe('cat-1');
      expect(result.sub_category_id).toBe('sub-1');
      expect(result.tags).toEqual(['PROTEİN', 'WHEY']);
      expect(result.variants).toHaveLength(1);
      expect(result.variants[0].id).toBe('var-1');
      expect(result.comment_count).toBe(150);
      expect(result.average_star).toBe(4.8);
    });

    it('nutritionalContent null olduğunda güvenli boş şablona fallback yapmalı', () => {
      const product = createMockProduct({
        nutritionalContent: null,
      }) as unknown as ProductWithVariants;

      const result = ProductsMapper.toProductDetail(product);

      expect(result.explanation.nutritional_content).toEqual({
        ingredients: [],
        nutrition_facts: { ingredients: [], portion_sizes: [] },
        amino_acid_facts: { ingredients: [], portion_sizes: [] },
      });
    });
  });

  describe('getLowestPrice', () => {
    it('boş listede 0 dönmeli', () => {
      expect(ProductsMapper.getLowestPrice([])).toBe(0);
    });

    it('tek varyantta fiyatı dönmeli', () => {
      const variant = createMockVariant({
        totalPrice: new Prisma.Decimal(500),
        discountedPrice: null,
      });

      expect(ProductsMapper.getLowestPrice([variant])).toBe(500);
    });

    it('indirimli ve indirimsiz birden fazla varyant arasından en düşüğü seçmeli', () => {
      const v1 = createMockVariant({
        id: 'v1',
        totalPrice: new Prisma.Decimal(600),
        discountedPrice: new Prisma.Decimal(550),
      });
      const v2 = createMockVariant({
        id: 'v2',
        totalPrice: new Prisma.Decimal(400),
        discountedPrice: null,
      });
      const v3 = createMockVariant({
        id: 'v3',
        totalPrice: new Prisma.Decimal(700),
        discountedPrice: new Prisma.Decimal(350),
      });

      expect(ProductsMapper.getLowestPrice([v1, v2, v3])).toBe(350);
    });
  });

  describe('buildPaginationQuery', () => {
    it('sadece limit ve offset ile query string üretmeli', () => {
      const query = ProductsMapper.buildPaginationQuery(10, 20);
      expect(query).toBe('?limit=10&offset=20');
    });

    it('kategori eklendiğinde category parametresini içermeli', () => {
      const query = ProductsMapper.buildPaginationQuery(10, 0, 'protein');
      expect(query).toBe('?limit=10&offset=0&category=protein');
    });

    it('sıralama eklendiğinde sort parametresini içermeli', () => {
      const query = ProductsMapper.buildPaginationQuery(
        20,
        40,
        'creatine',
        'price',
      );
      expect(query).toBe('?limit=20&offset=40&category=creatine&sort=price');
    });

    it('kategori olmadan sadece sort eklendiğinde düzgün biçimlendirilmeli', () => {
      const query = ProductsMapper.buildPaginationQuery(
        20,
        0,
        undefined,
        'createdAt',
      );
      expect(query).toBe('?limit=20&offset=0&sort=createdAt');
    });
  });
});
