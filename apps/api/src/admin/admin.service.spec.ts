import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { OrderStatus, Role } from '@prisma/client';
import { SecurityAuditService } from '../common/audit';
import { PrismaService } from '../prisma';
import { AdminService } from './admin.service';
import {
  createMockUserDetail,
  mockAdminUser,
  mockCustomerUser,
} from './test/admin.fixtures';

describe('AdminService', () => {
  let service: AdminService;
  let prisma: {
    user: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      count: jest.Mock;
      update: jest.Mock;
    };
    order: {
      aggregate: jest.Mock;
      groupBy: jest.Mock;
    };
  };
  let auditService: {
    warn: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      user: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
      },
      order: {
        aggregate: jest.fn(),
        groupBy: jest.fn(),
      },
    };

    auditService = {
      warn: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: PrismaService, useValue: prisma },
        { provide: SecurityAuditService, useValue: auditService },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('listUsers', () => {
    it('should return paginated users with calculated order spent and count metadata', async () => {
      prisma.user.count.mockResolvedValue(2);
      prisma.user.findMany.mockResolvedValue([mockAdminUser, mockCustomerUser]);
      prisma.order.groupBy.mockResolvedValue([
        { userId: mockAdminUser.id, _sum: { totalPrice: 1500.25 } },
        { userId: mockCustomerUser.id, _sum: { totalPrice: 450.5 } },
      ]);

      const result = await service.listUsers({ limit: 10, offset: 0 });

      expect(prisma.user.count).toHaveBeenCalledWith({ where: {} });
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: {},
        take: 10,
        skip: 0,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { orders: true, addresses: true },
          },
        },
      });

      expect(prisma.order.groupBy).toHaveBeenCalledWith({
        by: ['userId'],
        where: {
          userId: { in: [mockAdminUser.id, mockCustomerUser.id] },
          status: { notIn: [OrderStatus.cancelled, OrderStatus.returned] },
        },
        _sum: { totalPrice: true },
      });

      expect(result.count).toBe(2);
      expect(result.results).toHaveLength(2);
      expect(result.results[0].id).toBe(mockAdminUser.id);
      expect(result.results[0].totalSpent).toBe(1500.25);
      expect(result.results[1].id).toBe(mockCustomerUser.id);
      expect(result.results[1].totalSpent).toBe(450.5);
      expect(result.previous).toBeNull();
      expect(result.next).toBeNull();
    });

    it('should filter by role and apply search on email, firstName, and lastName', async () => {
      prisma.user.count.mockResolvedValue(1);
      prisma.user.findMany.mockResolvedValue([mockCustomerUser]);
      prisma.order.groupBy.mockResolvedValue([]);

      const result = await service.listUsers({
        limit: 5,
        offset: 0,
        role: Role.customer,
        search: 'Can',
      });

      expect(prisma.user.count).toHaveBeenCalledWith({
        where: {
          role: Role.customer,
          OR: [
            { email: { contains: 'Can', mode: 'insensitive' } },
            { firstName: { contains: 'Can', mode: 'insensitive' } },
            { lastName: { contains: 'Can', mode: 'insensitive' } },
          ],
        },
      });

      expect(result.count).toBe(1);
      expect(result.results).toHaveLength(1);
    });

    it('should not call order.groupBy if no users are returned', async () => {
      prisma.user.count.mockResolvedValue(0);
      prisma.user.findMany.mockResolvedValue([]);

      const result = await service.listUsers({ limit: 10, offset: 0 });

      expect(prisma.order.groupBy).not.toHaveBeenCalled();
      expect(result.count).toBe(0);
      expect(result.results).toHaveLength(0);
    });
  });

  describe('getUserById', () => {
    it('should return detailed user profile, addresses, order history, and totalSpent', async () => {
      const detailedUser = createMockUserDetail();
      prisma.user.findUnique.mockResolvedValue(detailedUser);

      const result = await service.getUserById(mockCustomerUser.id);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockCustomerUser.id },
        include: {
          addresses: {
            include: { country: true, region: true, subregion: true },
            orderBy: { createdAt: 'desc' },
          },
          orders: {
            include: { items: true },
            orderBy: { createdAt: 'desc' },
          },
          _count: {
            select: { orders: true, addresses: true },
          },
        },
      });

      expect(result.id).toBe(mockCustomerUser.id);
      expect(
        (result as unknown as Record<string, unknown>).passwordHash,
      ).toBeUndefined();
      expect(result.addresses).toHaveLength(1);
      expect(result.addresses[0].country.name).toBe('Türkiye');
      expect(result.recentOrders).toHaveLength(2);
      expect(result.recentOrders[0].itemsCount).toBe(3);
      // Cancelled order should not be included in totalSpent
      expect(result.totalSpent).toBe(450.5);
    });

    it('should throw NotFoundException when user is not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.getUserById('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
