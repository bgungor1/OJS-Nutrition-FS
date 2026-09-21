import { AuthProvider, OrderStatus, Role } from '@prisma/client';

export const mockAdminUser = {
  id: 'admin-uuid-1',
  email: 'admin@example.com',
  passwordHash: '$2b$10$hashed',
  authProvider: AuthProvider.local,
  googleId: null,
  role: Role.admin,
  firstName: 'Ahmet',
  lastName: 'Yılmaz',
  phoneNumber: '05551234567',
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  _count: {
    orders: 5,
    addresses: 2,
  },
};

export const mockCustomerUser = {
  id: 'user-uuid-1',
  email: 'customer@example.com',
  passwordHash: '$2b$10$hashed',
  authProvider: AuthProvider.local,
  googleId: null,
  role: Role.customer,
  firstName: 'Can',
  lastName: 'Demir',
  phoneNumber: '05551112233',
  createdAt: new Date('2026-03-01T10:00:00.000Z'),
  updatedAt: new Date('2026-03-01T10:00:00.000Z'),
  _count: {
    orders: 2,
    addresses: 1,
  },
};

export const createMockUserDetail = (overrides = {}) => ({
  ...mockCustomerUser,
  addresses: [
    {
      id: 'addr-1',
      userId: mockCustomerUser.id,
      title: 'Evim',
      firstName: 'Can',
      lastName: 'Demir',
      countryId: 1,
      regionId: 34,
      subregionId: 341,
      fullAddress: 'Kadıköy',
      phoneNumber: '05551112233',
      createdAt: new Date('2026-03-01T10:00:00.000Z'),
      updatedAt: new Date('2026-03-01T10:00:00.000Z'),
      country: { id: 1, name: 'Türkiye' },
      region: { id: 34, name: 'İstanbul', countryId: 1 },
      subregion: { id: 341, name: 'Kadıköy', regionId: 34 },
    },
  ],
  orders: [
    {
      id: 'ord-1',
      orderNo: 'ORD-2026-001',
      userId: mockCustomerUser.id,
      status: OrderStatus.delivered,
      totalPrice: 450.5,
      shippingFee: 0,
      addressSnapshot: {},
      createdAt: new Date('2026-03-02T10:00:00.000Z'),
      updatedAt: new Date('2026-03-02T10:00:00.000Z'),
      items: [{ id: 'it-1', pieces: 3 }],
    },
    {
      id: 'ord-2',
      orderNo: 'ORD-2026-002',
      userId: mockCustomerUser.id,
      status: OrderStatus.cancelled,
      totalPrice: 200.0,
      shippingFee: 0,
      addressSnapshot: {},
      createdAt: new Date('2026-03-03T10:00:00.000Z'),
      updatedAt: new Date('2026-03-03T10:00:00.000Z'),
      items: [{ id: 'it-2', pieces: 1 }],
    },
  ],
  _count: { orders: 2, addresses: 1 },
  ...overrides,
});
