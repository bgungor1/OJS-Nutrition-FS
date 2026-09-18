import { AuthProvider, OrderStatus, Role } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export const mockCustomer = {
  id: '11111111-1111-4000-8000-111111111111',
  email: 'customer@example.com',
  role: Role.customer,
  firstName: 'Customer',
  lastName: 'User',
  phoneNumber: '+905551112233',
  passwordHash: 'hash',
  authProvider: AuthProvider.local,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
};

export const mockAdmin = {
  id: '22222222-2222-4000-8000-222222222222',
  email: 'admin@example.com',
  role: Role.admin,
  firstName: 'Admin',
  lastName: 'Superuser',
  phoneNumber: '+905559998877',
  passwordHash: 'hash',
  authProvider: AuthProvider.local,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
};

export const mockTargetUser = {
  id: '33333333-3333-4000-8000-333333333333',
  email: 'target@example.com',
  role: Role.customer,
  firstName: 'Target',
  lastName: 'User',
  phoneNumber: '+905554443322',
  passwordHash: 'hash',
  authProvider: AuthProvider.local,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  addresses: [],
  orders: [],
};

export const mockCategory = {
  id: '44444444-4444-4000-8000-444444444444',
  name: 'PROTEİN',
  slug: 'protein',
  subCategories: [],
};

export const mockSubCategory = {
  id: '55555555-5555-4000-8000-555555555555',
  name: 'WHEY',
  slug: 'whey',
  categoryId: mockCategory.id,
};

export const mockVariant = {
  id: '66666666-6666-4000-8000-666666666666',
  productId: '77777777-7777-4000-8000-777777777777',
  gram: 1000,
  pieces: 1,
  totalServings: 33,
  aroma: 'Çikolata',
  totalPrice: new Decimal(599),
  discountedPrice: new Decimal(549),
  pricePerServing: new Decimal(16.63),
  photoSrc: 'media/products/whey.jpg',
  isAvailable: true,
  stockQuantity: 25,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
};

export const mockProduct = {
  id: '77777777-7777-4000-8000-777777777777',
  name: 'WHEY PROTEIN',
  slug: 'whey-protein',
  shortExplanation: 'Premium Whey',
  explanation: {
    usage: '1 ölçek',
    features: '24g protein',
    description: 'Saf konsantre',
  },
  nutritionalContent: {
    ingredients: [],
    nutrition_facts: { portion_sizes: [], ingredients: [] },
    amino_acid_facts: { portion_sizes: [], ingredients: [] },
  },
  tags: ['protein', 'whey'],
  mainCategoryId: mockCategory.id,
  subCategoryId: mockSubCategory.id,
  isBestSeller: true,
  bestSellerRank: 1,
  averageStar: new Decimal(4.8),
  commentCount: 10,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  variants: [mockVariant],
};

export const mockOrder = {
  id: '88888888-8888-4000-8000-888888888888',
  orderNo: 'OJS-2026-0001',
  userId: mockCustomer.id,
  status: OrderStatus.processing,
  totalPrice: new Decimal(549),
  shippingFee: new Decimal(0),
  addressSnapshot: { fullAddress: 'Örnek cad.' },
  createdAt: new Date('2026-01-02T10:00:00.000Z'),
  updatedAt: new Date('2026-01-02T10:30:00.000Z'),
  user: mockCustomer,
  items: [
    {
      id: '99999999-9999-4000-8000-999999999999',
      orderId: '88888888-8888-4000-8000-888888888888',
      productId: mockProduct.id,
      productVariantId: mockVariant.id,
      productName: 'WHEY PROTEIN',
      variantName: 'Çikolata',
      pieces: 1,
      unitPrice: new Decimal(549),
      totalPrice: new Decimal(549),
      photo: 'media/products/whey.jpg',
    },
  ],
  payment: null,
};

export const createAdminMockPrisma = () => {
  const prisma = {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
    },
    refreshToken: {
      create: jest.fn().mockResolvedValue({ id: 'rt-id' }),
    },
    order: {
      count: jest.fn(),
      aggregate: jest.fn(),
      groupBy: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    orderItem: {
      groupBy: jest.fn(),
      count: jest.fn(),
      findFirst: jest.fn(),
    },
    product: {
      findUnique: jest.fn(),
      findUniqueOrThrow: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    productVariant: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    category: {
      findUnique: jest.fn(),
    },
    subCategory: {
      findUnique: jest.fn(),
    },
    review: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      delete: jest.fn(),
      aggregate: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  prisma.$transaction.mockImplementation(
    async (cb: (tx: typeof prisma) => Promise<unknown>) => cb(prisma),
  );

  return prisma;
};
