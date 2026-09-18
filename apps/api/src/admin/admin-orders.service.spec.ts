import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthProvider, OrderStatus, Role } from '@prisma/client';
import { AuditEvent } from '../common/audit/audit-event.enum';
import { SecurityAuditService } from '../common/audit/security-audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { AdminOrdersService } from './admin-orders.service';

describe('AdminOrdersService', () => {
  let service: AdminOrdersService;
  let prisma: {
    order: {
      findMany: jest.Mock;
      count: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
    };
    productVariant: {
      update: jest.Mock;
    };
    $transaction: jest.Mock;
  };
  let auditService: {
    info: jest.Mock;
    warn: jest.Mock;
  };

  const mockUser = {
    id: 'user-1',
    email: 'can@example.com',
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

  const mockOrder = {
    id: 'ord-1',
    orderNo: 'OJS-2026-0001',
    userId: 'user-1',
    status: OrderStatus.processing,
    totalPrice:
      929.9 as unknown as import('@prisma/client/runtime/library').Decimal,
    shippingFee:
      29.9 as unknown as import('@prisma/client/runtime/library').Decimal,
    addressSnapshot: { fullAddress: 'Test Adres' },
    createdAt: new Date('2026-01-02T10:00:00.000Z'),
    updatedAt: new Date('2026-01-02T10:30:00.000Z'),
    user: mockUser,
    items: [mockItem],
    payment: null,
  };

  beforeEach(async () => {
    prisma = {
      order: {
        findMany: jest.fn(),
        count: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      productVariant: {
        update: jest.fn(),
      },
      $transaction: jest.fn(
        async (callback: (tx: unknown) => Promise<unknown>) =>
          callback({
            order: {
              update: jest.fn().mockResolvedValue({
                ...mockOrder,
                status: OrderStatus.shipped,
              }),
            },
            productVariant: {
              update: jest.fn().mockResolvedValue({}),
            },
          }),
      ),
    };

    auditService = {
      info: jest.fn(),
      warn: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminOrdersService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
        {
          provide: SecurityAuditService,
          useValue: auditService,
        },
      ],
    }).compile();

    service = module.get<AdminOrdersService>(AdminOrdersService);
  });

  describe('listOrders', () => {
    it('should query orders with pagination and sort', async () => {
      prisma.order.findMany.mockResolvedValue([mockOrder]);
      prisma.order.count.mockResolvedValue(1);

      const result = await service.listOrders({
        limit: 10,
        offset: 0,
        search: 'OJS',
        status: OrderStatus.processing,
        startDate: '2026-01-01',
        endDate: '2026-01-31',
        sort: 'total_desc',
      });

      expect(result.count).toBe(1);
      expect(result.results).toHaveLength(1);
      expect(prisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 10,
          skip: 0,
          orderBy: { totalPrice: 'desc' },
        }),
      );
    });

    it('should handle sorting variations', async () => {
      prisma.order.findMany.mockResolvedValue([]);
      prisma.order.count.mockResolvedValue(0);

      await service.listOrders({ sort: 'date_asc' });
      expect(prisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { createdAt: 'asc' } }),
      );

      await service.listOrders({ sort: 'total_asc' });
      expect(prisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { totalPrice: 'asc' } }),
      );
    });
  });

  describe('getOrderById', () => {
    it('should return order detail when order exists', async () => {
      prisma.order.findUnique.mockResolvedValue(mockOrder);

      const result = await service.getOrderById('ord-1');
      expect(result.id).toBe('ord-1');
      expect(result.orderNo).toBe('OJS-2026-0001');
    });

    it('should throw NotFoundException when order does not exist', async () => {
      prisma.order.findUnique.mockResolvedValue(null);

      await expect(service.getOrderById('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateOrderStatus', () => {
    it('should update status and emit audit log', async () => {
      prisma.order.findUnique.mockResolvedValue(mockOrder);

      const result = await service.updateOrderStatus(
        'ord-1',
        { status: OrderStatus.shipped },
        'admin-1',
        '127.0.0.1',
      );

      expect(result.id).toBe('ord-1');
      expect(auditService.info).toHaveBeenCalledWith(
        AuditEvent.ADMIN_ORDER_STATUS_UPDATED,
        expect.objectContaining({
          userId: 'admin-1',
          resourceId: 'ord-1',
        }),
      );
    });

    it('should restock items and log warning audit when cancelled', async () => {
      prisma.order.findUnique.mockResolvedValue({
        ...mockOrder,
        status: OrderStatus.processing,
      });

      await service.updateOrderStatus(
        'ord-1',
        { status: OrderStatus.cancelled },
        'admin-1',
      );

      expect(auditService.warn).toHaveBeenCalledWith(
        AuditEvent.ORDER_CANCELLED_RESTOCKED,
        expect.objectContaining({
          userId: 'admin-1',
          resourceId: 'ord-1',
        }),
      );
    });

    it('should throw BadRequestException when transition is not permitted', async () => {
      prisma.order.findUnique.mockResolvedValue({
        ...mockOrder,
        status: OrderStatus.cancelled,
      });

      await expect(
        service.updateOrderStatus(
          'ord-1',
          { status: OrderStatus.processing },
          'admin-1',
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
