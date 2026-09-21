import { Prisma } from '@prisma/client';

export const mockProduct = {
  id: 'prod-1',
  name: 'Whey Protein',
  slug: 'whey-protein',
};

export const mockVariant = {
  id: 'var-1',
  productId: 'prod-1',
  gram: 1000,
  pieces: 1,
  totalServings: 33,
  aroma: 'Çikolata',
  totalPrice: new Prisma.Decimal(549),
  discountedPrice: null,
  pricePerServing: new Prisma.Decimal(15.12),
  photoSrc: 'media/test.jpg',
  isAvailable: true,
  stockQuantity: 10,
};

export const mockVariant1 = mockVariant;

export const mockVariant2 = {
  id: 'var-2',
  productId: 'prod-1',
  gram: 1000,
  pieces: 1,
  totalServings: 33,
  aroma: 'Çilek',
  totalPrice: new Prisma.Decimal(549),
  discountedPrice: null,
  pricePerServing: new Prisma.Decimal(15.12),
  photoSrc: 'media/test2.jpg',
  isAvailable: true,
  stockQuantity: 10,
};

export const mockCartItem = {
  id: 'cart-1',
  userId: 'user-1',
  guestSessionId: null,
  productId: 'prod-1',
  productVariantId: 'var-1',
  pieces: 2,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  product: mockProduct,
  productVariant: mockVariant,
};

export const createMockGuestItem = (overrides = {}) => ({
  id: 'guest-item-1',
  userId: null,
  guestSessionId: 'guest-123',
  productId: 'prod-1',
  productVariantId: 'var-1',
  pieces: 2,
  ...overrides,
});

export const createMockUserItem = (overrides = {}) => ({
  id: 'user-item-1',
  userId: 'user-1',
  guestSessionId: null,
  productId: 'prod-1',
  productVariantId: 'var-1',
  pieces: 3,
  ...overrides,
});

export const createMockPrismaService = () => ({
  cartItem: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
  },
  productVariant: {
    findUnique: jest.fn(),
  },
});
