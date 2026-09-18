import { Prisma } from '@prisma/client';

/**
 * Product test fixture factory.
 * Extracted from test files to avoid repetition and keep tests focused.
 */
export const createMockProduct = (overrides: Record<string, unknown> = {}) => ({
  id: 'prod-1',
  name: 'WHEY PROTEIN',
  slug: 'whey-protein',
  shortExplanation: 'Top-tier protein powder',
  usage: 'Mix 1 scoop (30g) with cold water or milk.',
  features: 'High protein\nLow fat',
  description: 'Full product description text.',
  nutritionalContent: {
    ingredients: [{ aroma: 'Chocolate', value: 'Cocoa, whey protein' }],
    nutrition_facts: {
      ingredients: [{ name: 'Protein', amounts: ['24g'] }],
      portion_sizes: ['30g'],
    },
    amino_acid_facts: {
      ingredients: [{ name: 'BCAA', amounts: ['5.5g'] }],
      portion_sizes: ['30g'],
    },
  },
  tags: ['PROTEIN', 'WHEY'],
  mainCategoryId: 'cat-1',
  subCategoryId: 'sub-1',
  isBestSeller: true,
  bestSellerRank: 1,
  commentCount: 150,
  averageStar: 4.8,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  variants: [createMockVariant()],
  ...overrides,
});

export const createMockVariant = (overrides: Record<string, unknown> = {}) => ({
  id: 'var-1',
  productId: 'prod-1',
  gram: 400,
  pieces: 1,
  totalServings: 16,
  aroma: 'Chocolate',
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
