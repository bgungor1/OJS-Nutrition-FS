import { AuthProvider, OrderStatus, Role } from '@prisma/client';
import {
  AdminOrdersMapper,
  AdminOrderWithRelations,
} from './admin-orders.mapper';

describe('AdminOrdersMapper', () => {
  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    passwordHash: 'hash',
    authProvider: AuthProvider.local,
    googleId: null,
    role: Role.customer,
    firstName: 'Can',
    lastName: 'Demir',
    phoneNumber: '+905551112233',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  };

  const mockPayment = {
    id: 'pay-1',
    orderId: 'ord-1',
    provider: 'iyzico',
    providerRef: 'ref-123',
    cardType: 'credit_card',
    last4: '1234',
    status: 'SUCCESS',
    createdAt: new Date('2026-01-02T10:00:00.000Z'),
    updatedAt: new Date('2026-01-02T10:00:00.000Z'),
  };

  const mockItem = {
    id: 'item-1',
    orderId: 'ord-1',
    productId: 'prod-1',
    productVariantId: 'var-1',
    productName: 'Whey Protein',
    variantName: 'Çikolata',
    pieces: 2,
    unitPrice:
      450 as unknown as import('@prisma/client/runtime/library').Decimal,
    totalPrice:
      900 as unknown as import('@prisma/client/runtime/library').Decimal,
    photo: 'media/products/whey.jpg',
  };

  const mockOrder: AdminOrderWithRelations & { items: (typeof mockItem)[] } = {
    id: 'ord-1',
    orderNo: 'OJS-2026-0001',
    userId: 'user-1',
    status: OrderStatus.processing,
    totalPrice:
      929.9 as unknown as import('@prisma/client/runtime/library').Decimal,
    shippingFee:
      29.9 as unknown as import('@prisma/client/runtime/library').Decimal,
    addressSnapshot: {
      title: 'Ev',
      fullAddress: 'Örnek cad. No:5',
    },
    createdAt: new Date('2026-01-02T10:00:00.000Z'),
    updatedAt: new Date('2026-01-02T10:30:00.000Z'),
    user: mockUser,
    items: [mockItem],
    payment: mockPayment,
  };

  describe('toCustomerDto', () => {
    it('should map user fields accurately', () => {
      const result = AdminOrdersMapper.toCustomerDto(mockUser);
      expect(result).toEqual({
        id: 'user-1',
        email: 'test@example.com',
        firstName: 'Can',
        lastName: 'Demir',
        phoneNumber: '+905551112233',
      });
    });
  });

  describe('toPaymentDto', () => {
    it('should return null when payment is missing', () => {
      expect(AdminOrdersMapper.toPaymentDto(null)).toBeNull();
      expect(AdminOrdersMapper.toPaymentDto(undefined)).toBeNull();
    });

    it('should map payment transaction properties', () => {
      const result = AdminOrdersMapper.toPaymentDto(mockPayment);
      expect(result).toEqual({
        provider: 'iyzico',
        providerRef: 'ref-123',
        cardType: 'credit_card',
        last4: '1234',
        status: 'SUCCESS',
        createdAt: '2026-01-02T10:00:00.000Z',
      });
    });
  });

  describe('toOrderItemDto', () => {
    it('should map order item with numeric prices', () => {
      const result = AdminOrdersMapper.toOrderItemDto(mockItem);
      expect(result).toEqual({
        id: 'item-1',
        productId: 'prod-1',
        productVariantId: 'var-1',
        productName: 'Whey Protein',
        variantName: 'Çikolata',
        pieces: 2,
        unitPrice: 450,
        totalPrice: 900,
        photo: 'media/products/whey.jpg',
      });
    });
  });

  describe('toListItemDto', () => {
    it('should calculate total pieces and map summary fields', () => {
      const result = AdminOrdersMapper.toListItemDto(mockOrder);
      expect(result).toEqual({
        id: 'ord-1',
        orderNo: 'OJS-2026-0001',
        status: OrderStatus.processing,
        totalPrice: 929.9,
        shippingFee: 29.9,
        itemCount: 2,
        createdAt: '2026-01-02T10:00:00.000Z',
        user: {
          id: 'user-1',
          email: 'test@example.com',
          firstName: 'Can',
          lastName: 'Demir',
          phoneNumber: '+905551112233',
        },
        payment: {
          provider: 'iyzico',
          providerRef: 'ref-123',
          cardType: 'credit_card',
          last4: '1234',
          status: 'SUCCESS',
          createdAt: '2026-01-02T10:00:00.000Z',
        },
      });
    });
  });

  describe('toDetailDto', () => {
    it('should map full relational order detail', () => {
      const result = AdminOrdersMapper.toDetailDto(mockOrder);
      expect(result.id).toBe('ord-1');
      expect(result.orderNo).toBe('OJS-2026-0001');
      expect(result.addressSnapshot).toEqual({
        title: 'Ev',
        fullAddress: 'Örnek cad. No:5',
      });
      expect(result.items).toHaveLength(1);
      expect(result.items[0].productName).toBe('Whey Protein');
    });
  });

  describe('toPaginatedResponseDto', () => {
    it('should map list with query pagination metadata', () => {
      const result = AdminOrdersMapper.toPaginatedResponseDto([mockOrder], 1, {
        limit: 10,
        offset: 0,
        search: 'OJS',
        status: OrderStatus.processing,
      });

      expect(result.count).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.offset).toBe(0);
      expect(result.search).toBe('OJS');
      expect(result.status).toBe(OrderStatus.processing);
      expect(result.results).toHaveLength(1);
    });
  });
});
