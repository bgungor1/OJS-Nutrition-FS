import { Test, TestingModule } from '@nestjs/testing';
import { AuthProvider, OrderStatus, Role } from '@prisma/client';
import { PrismaService } from '../prisma';
import { AdminDashboardService } from './admin-dashboard.service';

describe('AdminDashboardService', () => {
  let service: AdminDashboardService;
  let prisma: {
    order: {
      count: jest.Mock;
      aggregate: jest.Mock;
      groupBy: jest.Mock;
      findMany: jest.Mock;
    };
    user: {
      count: jest.Mock;
    };
    product: {
      count: jest.Mock;
      findMany: jest.Mock;
    };
    productVariant: {
      findMany: jest.Mock;
    };
    orderItem: {
      groupBy: jest.Mock;
    };
  };

  const mockCustomerUser = {
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
  };

  beforeEach(async () => {
    prisma = {
      order: {
        count: jest.fn(),
        aggregate: jest.fn(),
        groupBy: jest.fn(),
        findMany: jest.fn(),
      },
      user: {
        count: jest.fn(),
      },
      product: {
        count: jest.fn(),
        findMany: jest.fn(),
      },
      productVariant: {
        findMany: jest.fn(),
      },
      orderItem: {
        groupBy: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminDashboardService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<AdminDashboardService>(AdminDashboardService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getDashboardStats', () => {
    it('should aggregate summary, status distribution, recent orders, top products, low stock, and 30-day sales trend', async () => {
      prisma.order.count.mockResolvedValue(120);
      prisma.order.aggregate.mockResolvedValue({
        _sum: { totalPrice: 95400.5 },
      });
      prisma.user.count.mockResolvedValue(55);
      prisma.product.count.mockResolvedValue(18);

      prisma.order.groupBy.mockResolvedValue([
        { status: OrderStatus.processing, _count: { id: 10 } },
        { status: OrderStatus.delivered, _count: { id: 100 } },
        { status: OrderStatus.cancelled, _count: { id: 10 } },
      ]);

      const mockRecentOrder = {
        id: 'ord-rec-1',
        orderNo: 'ORD-2026-99',
        userId: mockCustomerUser.id,
        user: mockCustomerUser,
        totalPrice: 1250.0,
        status: OrderStatus.processing,
        createdAt: new Date('2026-03-18T12:00:00.000Z'),
        items: [{ pieces: 2 }, { pieces: 1 }],
      };
      prisma.order.findMany
        .mockResolvedValueOnce([mockRecentOrder]) // recentOrders
        .mockResolvedValueOnce([
          {
            createdAt: new Date(),
            totalPrice: 1250.0,
          },
        ]); // trendOrders

      prisma.orderItem.groupBy.mockResolvedValue([
        {
          productId: 'prod-top-1',
          productName: 'Whey Protein',
          _sum: { pieces: 80, totalPrice: 64000.0 },
        },
      ]);

      prisma.product.findMany.mockResolvedValue([
        {
          id: 'prod-top-1',
          variants: [{ photoSrc: 'media/products/whey.jpg' }],
        },
      ]);

      prisma.productVariant.findMany.mockResolvedValue([
        {
          id: 'var-low-1',
          productId: 'prod-top-1',
          product: { name: 'Whey Protein', slug: 'whey-protein' },
          aroma: 'Vanilya',
          gram: 1000,
          stockQuantity: 2,
          isAvailable: true,
          photoSrc: 'media/products/whey-vanilya.jpg',
        },
      ]);

      const result = await service.getDashboardStats();

      expect(result.summary).toEqual({
        totalOrders: 120,
        totalRevenue: 95400.5,
        totalUsers: 55,
        totalProducts: 18,
      });

      expect(result.ordersByStatus.processing).toBe(10);
      expect(result.ordersByStatus.delivered).toBe(100);
      expect(result.ordersByStatus.cancelled).toBe(10);
      expect(result.ordersByStatus.pending).toBe(0);

      expect(result.recentOrders).toHaveLength(1);
      expect(result.recentOrders[0].orderNo).toBe('ORD-2026-99');
      expect(result.recentOrders[0].customerName).toBe('Can Demir');
      expect(result.recentOrders[0].itemsCount).toBe(3);

      expect(result.topProducts).toHaveLength(1);
      expect(result.topProducts[0].productName).toBe('Whey Protein');
      expect(result.topProducts[0].photoSrc).toBe('media/products/whey.jpg');

      expect(result.lowStockVariants).toHaveLength(1);
      expect(result.lowStockVariants[0].stockQuantity).toBe(2);

      // Exactly 30 days in sales trend
      expect(result.salesTrend).toHaveLength(30);
    });

    it('should handle zero orders and empty data gracefully', async () => {
      prisma.order.count.mockResolvedValue(0);
      prisma.order.aggregate.mockResolvedValue({ _sum: { totalPrice: null } });
      prisma.user.count.mockResolvedValue(0);
      prisma.product.count.mockResolvedValue(0);
      prisma.order.groupBy.mockResolvedValue([]);
      prisma.order.findMany.mockResolvedValue([]);
      prisma.orderItem.groupBy.mockResolvedValue([]);
      prisma.productVariant.findMany.mockResolvedValue([]);

      const result = await service.getDashboardStats();

      expect(result.summary).toEqual({
        totalOrders: 0,
        totalRevenue: 0,
        totalUsers: 0,
        totalProducts: 0,
      });
      expect(result.ordersByStatus.pending).toBe(0);
      expect(result.recentOrders).toHaveLength(0);
      expect(result.topProducts).toHaveLength(0);
      expect(result.lowStockVariants).toHaveLength(0);
      expect(result.salesTrend).toHaveLength(30);
    });
  });
});
