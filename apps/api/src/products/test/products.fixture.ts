import { Prisma } from '@prisma/client';

/**
 * Ürün testleri için sahte veri üreticisi (Test Fixture).
 * Test dosyalarının gereksiz uzamasını önlemek ve tekrar kullanılabilirliği artırmak için ayrılmıştır.
 */
export const createMockProduct = (overrides = {}) => ({
  id: 'prod-1',
  name: 'WHEY PROTEIN',
  slug: 'whey-protein',
  shortExplanation: 'En popüler protein tozu',
  usage: '1 ölçek su ile karıştırılır',
  features: 'Yüksek protein\nDüşük yağ',
  description: 'Açıklama metni',
  nutritionalContent: {
    ingredients: [{ aroma: 'Çikolata', value: 'Kakao, whey' }],
    nutrition_facts: {
      ingredients: [{ name: 'Protein', amounts: ['24g'] }],
      portion_sizes: ['30g'],
    },
    amino_acid_facts: {
      ingredients: [{ name: 'BCAA', amounts: ['5.5g'] }],
      portion_sizes: ['30g'],
    },
  },
  tags: ['PROTEİN', 'WHEY'],
  mainCategoryId: 'cat-1',
  subCategoryId: 'sub-1',
  isBestSeller: true,
  bestSellerRank: 1,
  commentCount: 150,
  averageStar: 4.8,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  variants: [
    {
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
    },
  ],
  ...overrides,
});
