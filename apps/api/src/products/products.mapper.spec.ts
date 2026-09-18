import { Prisma, ProductVariant } from '@prisma/client';
import { ProductsMapper, ProductWithVariants } from './products.mapper';
import { createMockProduct, createMockVariant } from './test/products.fixture';

describe('ProductsMapper', () => {
  describe('toPriceInfo', () => {
    it('should return safe default values for an empty variant list', () => {
      expect(ProductsMapper.toPriceInfo([])).toEqual({
        profit: null,
        total_price: 0,
        discounted_price: null,
        price_per_servings: null,
        discount_percentage: null,
      });
    });

    it.each([
      {
        total: 1000,
        discounted: 800,
        expectedProfit: 200,
        expectedDiscountPct: 20,
      },
      {
        total: 549.9,
        discounted: 499.95,
        expectedProfit: 49.95,
        expectedDiscountPct: 9,
      },
      {
        total: 750,
        discounted: null,
        expectedProfit: null,
        expectedDiscountPct: null,
      },
      {
        total: 0,
        discounted: 0,
        expectedProfit: 0,
        expectedDiscountPct: null,
      },
    ])(
      'should compute profit=$expectedProfit and discountPct=$expectedDiscountPct for total=$total, discounted=$discounted',
      ({ total, discounted, expectedProfit, expectedDiscountPct }) => {
        const variant = createMockVariant({
          totalPrice: new Prisma.Decimal(total),
          discountedPrice:
            discounted !== null ? new Prisma.Decimal(discounted) : null,
          pricePerServing: new Prisma.Decimal(25),
        }) as unknown as ProductVariant;

        const result = ProductsMapper.toPriceInfo([variant]);

        expect(result.total_price).toBe(total);
        expect(result.discounted_price).toBe(discounted);
        expect(result.profit).toBe(expectedProfit);
        expect(result.discount_percentage).toBe(expectedDiscountPct);
      },
    );

    it('should reference the first (primary) variant when multiple variants exist', () => {
      const v1 = createMockVariant({
        id: 'v1',
        totalPrice: new Prisma.Decimal(300),
        discountedPrice: null,
      }) as unknown as ProductVariant;
      const v2 = createMockVariant({
        id: 'v2',
        totalPrice: new Prisma.Decimal(500),
        discountedPrice: new Prisma.Decimal(450),
      }) as unknown as ProductVariant;

      const result = ProductsMapper.toPriceInfo([v1, v2]);
      expect(result.total_price).toBe(300);
      expect(result.discounted_price).toBeNull();
    });
  });

  describe('toVariant', () => {
    it('should map a variant to API format correctly', () => {
      const variant = createMockVariant() as unknown as ProductVariant;
      const result = ProductsMapper.toVariant(variant);

      expect(result).toMatchObject({
        id: 'var-1',
        size: { gram: 400, pieces: 1, total_services: 16 },
        aroma: 'Chocolate',
        price: {
          total_price: 549,
          discounted_price: 499,
          profit: 50,
          discount_percentage: 9,
          price_per_servings: 31.18,
        },
        photo_src: 'media/products/whey-protein.jpg',
        is_available: true,
      });
    });

    it.each([
      { isAvailable: true, stock: 10, expected: true },
      { isAvailable: true, stock: 0, expected: false },
      { isAvailable: false, stock: 100, expected: false },
      { isAvailable: false, stock: 0, expected: false },
    ])(
      'should set is_available=$expected when isAvailable=$isAvailable and stockQuantity=$stock',
      ({ isAvailable, stock, expected }) => {
        const variant = createMockVariant({
          isAvailable,
          stockQuantity: stock,
        }) as unknown as ProductVariant;

        expect(ProductsMapper.toVariant(variant).is_available).toBe(expected);
      },
    );
  });

  describe('toProduct and toBestSeller', () => {
    it('should map product model to ApiProduct and ApiBestSellerProduct format', () => {
      const product = createMockProduct() as unknown as ProductWithVariants;

      const apiProduct = ProductsMapper.toProduct(product);
      expect(apiProduct.id).toBe('prod-1');
      expect(apiProduct.name).toBe('WHEY PROTEIN');
      expect(apiProduct.price_info.total_price).toBe(549);
      expect(apiProduct.photo_src).toBe('media/products/whey-protein.jpg');

      const bestSeller = ProductsMapper.toBestSeller(product);
      expect(bestSeller.name).toBe('WHEY PROTEIN');
      expect('id' in bestSeller).toBe(false);
    });

    it('should fallback photo_src to empty string when product has no variants', () => {
      const product = createMockProduct({
        variants: [],
      }) as unknown as ProductWithVariants;

      expect(ProductsMapper.toProduct(product).photo_src).toBe('');
    });
  });

  describe('toProductDetail', () => {
    it('should map product detail with explanation and nested nutrition content', () => {
      const product = createMockProduct() as unknown as ProductWithVariants;
      const result = ProductsMapper.toProductDetail(product);

      expect(result.id).toBe('prod-1');
      expect(result.slug).toBe('whey-protein');
      expect(result.explanation.usage).toBe(
        'Mix 1 scoop (30g) with cold water or milk.',
      );
      expect(result.explanation.nutritional_content).toEqual(
        product.nutritionalContent,
      );
      expect(result.variants).toHaveLength(1);
    });

    it('should fallback to safe empty template when nutritionalContent is null', () => {
      const product = createMockProduct({
        nutritionalContent: null,
      }) as unknown as ProductWithVariants;

      expect(
        ProductsMapper.toProductDetail(product).explanation.nutritional_content,
      ).toEqual({
        ingredients: [],
        nutrition_facts: { ingredients: [], portion_sizes: [] },
        amino_acid_facts: { ingredients: [], portion_sizes: [] },
      });
    });
  });

  describe('getLowestPrice', () => {
    it('should return 0 for empty list and minimum price among variants', () => {
      expect(ProductsMapper.getLowestPrice([])).toBe(0);

      const variants = [
        createMockVariant({
          totalPrice: new Prisma.Decimal(600),
          discountedPrice: new Prisma.Decimal(550),
        }),
        createMockVariant({
          totalPrice: new Prisma.Decimal(400),
          discountedPrice: null,
        }),
        createMockVariant({
          totalPrice: new Prisma.Decimal(700),
          discountedPrice: new Prisma.Decimal(350),
        }),
      ] as unknown as ProductVariant[];

      expect(ProductsMapper.getLowestPrice(variants)).toBe(350);
    });
  });

  describe('buildPaginationQuery', () => {
    it.each([
      {
        limit: 10,
        offset: 20,
        cat: undefined,
        sort: undefined,
        expected: '?limit=10&offset=20',
      },
      {
        limit: 10,
        offset: 0,
        cat: 'protein',
        sort: undefined,
        expected: '?limit=10&offset=0&category=protein',
      },
      {
        limit: 20,
        offset: 40,
        cat: 'creatine',
        sort: 'price',
        expected: '?limit=20&offset=40&category=creatine&sort=price',
      },
      {
        limit: 20,
        offset: 0,
        cat: undefined,
        sort: 'createdAt',
        expected: '?limit=20&offset=0&sort=createdAt',
      },
    ])(
      'should build query $expected for limit=$limit, offset=$offset, cat=$cat, sort=$sort',
      ({ limit, offset, cat, sort, expected }) => {
        expect(
          ProductsMapper.buildPaginationQuery(limit, offset, cat, sort),
        ).toBe(expected);
      },
    );
  });
});
