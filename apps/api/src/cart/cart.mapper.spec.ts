import { Prisma, Product, ProductVariant } from '@prisma/client';
import { CartItemWithRelations, CartMapper } from './cart.mapper';

describe('CartMapper', () => {
  const createMockProduct = (overrides: Partial<Product> = {}): Product => ({
    id: 'prod-1',
    name: 'Whey Protein',
    slug: 'whey-protein',
    shortExplanation: 'En popüler protein tozu',
    usage: 'Günde 1 ölçek',
    features: 'Yüksek BCAA',
    description: 'Açıklama',
    nutritionalContent: {},
    tags: ['protein'],
    mainCategoryId: 'cat-1',
    subCategoryId: 'subcat-1',
    isBestSeller: true,
    bestSellerRank: 1,
    commentCount: 5,
    averageStar: 4.8,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  });

  const createMockVariant = (
    overrides: Partial<ProductVariant> = {},
  ): ProductVariant => ({
    id: 'var-1',
    productId: 'prod-1',
    gram: 1000,
    pieces: 1,
    totalServings: 33,
    aroma: 'Çikolata',
    totalPrice: new Prisma.Decimal(549),
    discountedPrice: new Prisma.Decimal(499),
    pricePerServing: new Prisma.Decimal(15.12),
    photoSrc: 'media/products/whey-protein-cikolata.jpg',
    isAvailable: true,
    stockQuantity: 50,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  });

  const createMockCartItem = (
    overrides: Partial<CartItemWithRelations> = {},
  ): CartItemWithRelations => {
    const product = overrides.product ?? createMockProduct();
    const productVariant = overrides.productVariant ?? createMockVariant();

    return {
      id: 'cart-item-1',
      userId: 'user-1',
      guestSessionId: null,
      productId: product.id,
      productVariantId: productVariant.id,
      pieces: 2,
      createdAt: new Date('2026-02-01T10:00:00.000Z'),
      updatedAt: new Date('2026-02-01T10:00:00.000Z'),
      product,
      productVariant,
      ...overrides,
    };
  };

  describe('toVariantSummary', () => {
    it('indirimli varyantta kâr, indirim yüzdesi ve fiyatları doğru hesaplamalı', () => {
      const variant = createMockVariant({
        totalPrice: new Prisma.Decimal(1000),
        discountedPrice: new Prisma.Decimal(800),
        pricePerServing: new Prisma.Decimal(24.24),
        stockQuantity: 20,
        isAvailable: true,
      });

      const result = CartMapper.toVariantSummary(variant);

      expect(result).toEqual({
        id: 'var-1',
        aroma: 'Çikolata',
        size: {
          gram: 1000,
          pieces: 1,
          total_services: 33,
        },
        price: {
          total_price: 1000,
          discounted_price: 800,
          profit: 200,
          discount_percentage: 20,
          price_per_servings: 24.24,
        },
        photo_src: 'media/products/whey-protein-cikolata.jpg',
        is_available: true,
        stock_quantity: 20,
      });
    });

    it('indirimsiz varyantta indirim alanlarını null dönmeli', () => {
      const variant = createMockVariant({
        totalPrice: new Prisma.Decimal(600),
        discountedPrice: null,
        pricePerServing: new Prisma.Decimal(18.18),
      });

      const result = CartMapper.toVariantSummary(variant);

      expect(result.price).toEqual({
        total_price: 600,
        discounted_price: null,
        profit: null,
        discount_percentage: null,
        price_per_servings: 18.18,
      });
    });

    it('stok 0 olduğunda is_available false dönmeli', () => {
      const variant = createMockVariant({
        isAvailable: true,
        stockQuantity: 0,
      });

      const result = CartMapper.toVariantSummary(variant);
      expect(result.is_available).toBe(false);
    });

    it('admin satışa kapattığında (isAvailable=false) is_available false dönmeli', () => {
      const variant = createMockVariant({
        isAvailable: false,
        stockQuantity: 100,
      });

      const result = CartMapper.toVariantSummary(variant);
      expect(result.is_available).toBe(false);
    });
  });

  describe('toProductSummary', () => {
    it('ürün bilgilerini ve varyant görselini doğru eşlemeli, geriye dönük photo alanını doldurmalı', () => {
      const product = createMockProduct({
        id: 'p-10',
        name: 'Kreatin Monohidrat',
        slug: 'kreatin-monohidrat',
      });
      const variant = createMockVariant({
        photoSrc: 'media/products/kreatin.jpg',
      });

      const result = CartMapper.toProductSummary(product, variant);

      expect(result).toEqual({
        id: 'p-10',
        name: 'Kreatin Monohidrat',
        slug: 'kreatin-monohidrat',
        photo_src: 'media/products/kreatin.jpg',
        photo: 'media/products/kreatin.jpg',
      });
    });
  });

  describe('toCartItemResponse', () => {
    it('sepet kalemini zenginleştirilmiş formatta dönmeli', () => {
      const item = createMockCartItem({
        id: 'cart-item-99',
        pieces: 3,
        createdAt: new Date('2026-03-01T12:30:00.000Z'),
        updatedAt: new Date('2026-03-01T12:30:00.000Z'),
      });

      const result = CartMapper.toCartItemResponse(item);

      expect(result.id).toBe('cart-item-99');
      expect(result.product_id).toBe('prod-1');
      expect(result.product_variant_id).toBe('var-1');
      expect(result.pieces).toBe(3);
      expect(result.created_at).toBe('2026-03-01T12:30:00.000Z');
      expect(result.updated_at).toBe('2026-03-01T12:30:00.000Z');
      expect(result.product.name).toBe('Whey Protein');
      expect(result.variant.aroma).toBe('Çikolata');
      expect(result.variant.price.total_price).toBe(549);
    });
  });

  describe('toCartResponseList', () => {
    it('boş dizi için boş dizi dönmeli', () => {
      expect(CartMapper.toCartResponseList([])).toEqual([]);
    });

    it('birden fazla kalemi başarıyla haritalamalı', () => {
      const item1 = createMockCartItem({ id: 'item-1' });
      const item2 = createMockCartItem({ id: 'item-2', pieces: 5 });

      const result = CartMapper.toCartResponseList([item1, item2]);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('item-1');
      expect(result[1].id).toBe('item-2');
      expect(result[1].pieces).toBe(5);
    });
  });
});
