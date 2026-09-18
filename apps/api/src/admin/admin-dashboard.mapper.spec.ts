import { AuthProvider, OrderStatus, Role } from '@prisma/client';
import { AdminDashboardMapper } from './admin-dashboard.mapper';

describe('AdminDashboardMapper', () => {
  const mockUser = {
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
  };

  describe('toDashboardSummary', () => {
    it('should map counts and round revenue to two decimals', () => {
      const summary = AdminDashboardMapper.toDashboardSummary(
        150,
        125430.789,
        50,
        20,
      );

      expect(summary).toEqual({
        totalOrders: 150,
        totalRevenue: 125430.79,
        totalUsers: 50,
        totalProducts: 20,
      });
    });
  });

  describe('toOrdersByStatus', () => {
    it('should map order status counts and default missing statuses to 0', () => {
      const statusCounts = [
        { status: OrderStatus.processing, _count: { id: 5 } },
        { status: OrderStatus.delivered, _count: { id: 120 } },
      ];

      const result = AdminDashboardMapper.toOrdersByStatus(statusCounts);

      expect(result).toEqual({
        pending: 0,
        processing: 5,
        shipped: 0,
        delivered: 120,
        cancelled: 0,
        returned: 0,
      });
    });
  });

  describe('toRecentOrders', () => {
    it('should format recent orders with customer name, email, item count, and price', () => {
      const mockRecentOrders = [
        {
          id: 'ord-recent-1',
          orderNo: 'ORD-2026-REC1',
          userId: mockUser.id,
          user: mockUser,
          status: OrderStatus.processing,
          totalPrice:
            '850.00' as unknown as import('@prisma/client/runtime/library').Decimal,
          shippingFee:
            '0.00' as unknown as import('@prisma/client/runtime/library').Decimal,
          addressSnapshot: {},
          createdAt: new Date('2026-03-18T10:00:00.000Z'),
          updatedAt: new Date('2026-03-18T10:00:00.000Z'),
          items: [
            {
              id: 'it-1',
              orderId: 'ord-recent-1',
              productId: 'p-1',
              productVariantId: 'v-1',
              productName: 'BCAA',
              variantName: 'Karpuz',
              pieces: 3,
              unitPrice:
                '283.33' as unknown as import('@prisma/client/runtime/library').Decimal,
              totalPrice:
                '850.00' as unknown as import('@prisma/client/runtime/library').Decimal,
              photo: null,
            },
          ],
        },
      ];

      const result = AdminDashboardMapper.toRecentOrders(mockRecentOrders);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 'ord-recent-1',
        orderNo: 'ORD-2026-REC1',
        customerName: 'Zeynep Kaya',
        customerEmail: 'user@example.com',
        totalPrice: 850,
        status: OrderStatus.processing,
        itemsCount: 3,
        createdAt: new Date('2026-03-18T10:00:00.000Z'),
      });
    });
  });

  describe('toTopProducts', () => {
    it('should map top selling products with total quantity, revenue, and photo', () => {
      const topItems = [
        {
          productId: 'p-top-1',
          productName: 'Whey Protein',
          _sum: {
            pieces: 45,
            totalPrice:
              '36000.50' as unknown as import('@prisma/client/runtime/library').Decimal,
          },
        },
      ];
      const photoMap = new Map([['p-top-1', 'media/products/whey.jpg']]);

      const result = AdminDashboardMapper.toTopProducts(topItems, photoMap);

      expect(result).toEqual([
        {
          productId: 'p-top-1',
          productName: 'Whey Protein',
          totalQuantitySold: 45,
          totalRevenue: 36000.5,
          photoSrc: 'media/products/whey.jpg',
        },
      ]);
    });
  });

  describe('toLowStockVariants', () => {
    it('should map low stock variants including product details', () => {
      const lowVariants = [
        {
          id: 'var-low-1',
          productId: 'p-1',
          product: {
            name: 'Creatine',
            slug: 'creatine-monohydrate',
          },
          aroma: 'Aromasız',
          gram: 300,
          pieces: 1,
          totalServings: 60,
          totalPrice:
            '399.00' as unknown as import('@prisma/client/runtime/library').Decimal,
          discountedPrice: null,
          pricePerServing:
            '6.65' as unknown as import('@prisma/client/runtime/library').Decimal,
          photoSrc: 'media/products/creatine.jpg',
          isAvailable: true,
          stockQuantity: 4,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const result = AdminDashboardMapper.toLowStockVariants(lowVariants);

      expect(result).toEqual([
        {
          variantId: 'var-low-1',
          productId: 'p-1',
          productName: 'Creatine',
          productSlug: 'creatine-monohydrate',
          aroma: 'Aromasız',
          gram: 300,
          stockQuantity: 4,
          isAvailable: true,
          photoSrc: 'media/products/creatine.jpg',
        },
      ]);
    });
  });

  describe('toSalesTrend', () => {
    it('should map daily data into sorted trend array', () => {
      const dailyMap = new Map([
        ['2026-03-02', { orderCount: 5, totalRevenue: 4200.5 }],
        ['2026-03-01', { orderCount: 3, totalRevenue: 2500 }],
      ]);

      const result = AdminDashboardMapper.toSalesTrend(dailyMap);

      expect(result).toEqual([
        { date: '2026-03-01', orderCount: 3, totalRevenue: 2500 },
        { date: '2026-03-02', orderCount: 5, totalRevenue: 4200.5 },
      ]);
    });
  });
});
