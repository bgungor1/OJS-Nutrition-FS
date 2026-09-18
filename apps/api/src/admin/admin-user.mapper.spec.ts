import { AuthProvider, OrderStatus, Role } from '@prisma/client';
import {
  AddressWithLocation,
  AdminUserMapper,
  OrderWithItems,
  UserDetailRelation,
  UserWithCountRelation,
} from './admin-user.mapper';

describe('AdminUserMapper', () => {
  const mockUser: UserWithCountRelation = {
    id: 'user-uuid-1',
    email: 'user@example.com',
    passwordHash: '$2b$10$hashed',
    authProvider: AuthProvider.local,
    googleId: null,
    role: Role.customer,
    firstName: 'Zeynep',
    lastName: 'Kaya',
    phoneNumber: '05559876543',
    createdAt: new Date('2026-03-01T12:00:00.000Z'),
    updatedAt: new Date('2026-03-02T12:00:00.000Z'),
    _count: {
      orders: 3,
      addresses: 2,
    },
  };

  describe('toUserListItem', () => {
    it('should transform user entity to list item DTO format without password hash', () => {
      const result = AdminUserMapper.toUserListItem(mockUser, 1250.755);

      expect(result.id).toBe(mockUser.id);
      expect(result.email).toBe(mockUser.email);
      expect(result.firstName).toBe(mockUser.firstName);
      expect(result.lastName).toBe(mockUser.lastName);
      expect(result.phoneNumber).toBe(mockUser.phoneNumber);
      expect(result.role).toBe(Role.customer);
      expect(result.ordersCount).toBe(3);
      expect(result.addressesCount).toBe(2);
      expect(result.totalSpent).toBe(1250.76);
      expect(
        (result as unknown as Record<string, unknown>).passwordHash,
      ).toBeUndefined();
    });

    it('should default to 0 when _count or total spent is missing or undefined', () => {
      const userWithoutCount = { ...mockUser, _count: undefined };
      const result = AdminUserMapper.toUserListItem(userWithoutCount, 0);

      expect(result.ordersCount).toBe(0);
      expect(result.addressesCount).toBe(0);
      expect(result.totalSpent).toBe(0);
    });
  });

  describe('toUserDetail', () => {
    it('should transform user detail with addresses, orders, and calculated item counts', () => {
      const mockAddress: AddressWithLocation = {
        id: 'addr-1',
        userId: mockUser.id,
        title: 'Office',
        firstName: 'Zeynep',
        lastName: 'Kaya',
        countryId: 1,
        regionId: 34,
        subregionId: 342,
        fullAddress: 'Maslak Mah. Büyükdere Cad.',
        phoneNumber: '05559876543',
        createdAt: new Date('2026-03-01T12:00:00.000Z'),
        updatedAt: new Date('2026-03-01T12:00:00.000Z'),
        country: { id: 1, name: 'Türkiye' },
        region: { id: 34, name: 'İstanbul', countryId: 1 },
        subregion: { id: 342, name: 'Sarıyer', regionId: 34 },
      };

      const mockOrder: OrderWithItems = {
        id: 'ord-1',
        orderNo: 'ORD-2026-9999',
        userId: mockUser.id,
        status: OrderStatus.delivered,
        totalPrice:
          '750.50' as unknown as import('@prisma/client/runtime/library').Decimal,
        shippingFee:
          '0.00' as unknown as import('@prisma/client/runtime/library').Decimal,
        addressSnapshot: {},
        createdAt: new Date('2026-03-02T15:00:00.000Z'),
        updatedAt: new Date('2026-03-02T15:00:00.000Z'),
        items: [
          {
            id: 'item-1',
            orderId: 'ord-1',
            productId: 'prod-1',
            productVariantId: 'var-1',
            productName: 'Whey Protein',
            variantName: 'Çikolata',
            pieces: 2,
            unitPrice:
              '375.25' as unknown as import('@prisma/client/runtime/library').Decimal,
            totalPrice:
              '750.50' as unknown as import('@prisma/client/runtime/library').Decimal,
            photo: null,
          },
        ],
      };

      const detailedUser: UserDetailRelation = {
        ...mockUser,
        addresses: [mockAddress],
        orders: [mockOrder],
      };

      const result = AdminUserMapper.toUserDetail(detailedUser, 750.5);

      expect(result.id).toBe(mockUser.id);
      expect(
        (result as unknown as Record<string, unknown>).passwordHash,
      ).toBeUndefined();
      expect(result.addresses).toHaveLength(1);
      expect(result.addresses[0].country.name).toBe('Türkiye');
      expect(result.addresses[0].region.name).toBe('İstanbul');
      expect(result.addresses[0].subregion.name).toBe('Sarıyer');
      expect(result.recentOrders).toHaveLength(1);
      expect(result.recentOrders[0].orderNo).toBe('ORD-2026-9999');
      expect(result.recentOrders[0].itemsCount).toBe(2);
      expect(result.totalSpent).toBe(750.5);
    });
  });

  describe('toPaginatedResponse', () => {
    it('should build next and previous pagination links including search and role query parameters', () => {
      const items = [AdminUserMapper.toUserListItem(mockUser, 500)];
      const response = AdminUserMapper.toPaginatedResponse(
        45,
        items,
        10,
        10,
        'Zeynep',
        Role.customer,
      );

      expect(response.count).toBe(45);
      expect(response.results).toEqual(items);
      expect(response.next).toBe(
        '?limit=10&offset=20&search=Zeynep&role=customer',
      );
      expect(response.previous).toBe(
        '?limit=10&offset=0&search=Zeynep&role=customer',
      );
    });

    it('should return null for previous on the first page', () => {
      const response = AdminUserMapper.toPaginatedResponse(25, [], 10, 0);

      expect(response.previous).toBeNull();
      expect(response.next).toBe('?limit=10&offset=10');
    });

    it('should return null for next on the last page', () => {
      const response = AdminUserMapper.toPaginatedResponse(15, [], 10, 10);

      expect(response.next).toBeNull();
      expect(response.previous).toBe('?limit=10&offset=0');
    });
  });
});
