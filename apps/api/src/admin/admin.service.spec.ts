import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthProvider, OrderStatus, Role } from '@prisma/client';
import { AuditEvent, SecurityAuditService } from '../common/audit';
import { PrismaService } from '../prisma';
import { AdminService } from './admin.service';

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

  const mockAdminUser = {
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
    _count: {
      orders: 2,
      addresses: 1,
    },
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
      const detailedUser = {
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
            createdAt: new Date(),
            updatedAt: new Date(),
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
            createdAt: new Date(),
            updatedAt: new Date(),
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
            createdAt: new Date(),
            updatedAt: new Date(),
            items: [{ id: 'it-2', pieces: 1 }],
          },
        ],
      };

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

  describe('updateUserRole', () => {
    it('should successfully update customer to admin and record security audit log', async () => {
      prisma.user.findUnique.mockResolvedValue(mockCustomerUser);
      prisma.user.update.mockResolvedValue({
        ...mockCustomerUser,
        role: Role.admin,
      });
      prisma.order.aggregate.mockResolvedValue({
        _sum: { totalPrice: 450.5 },
      });

      const result = await service.updateUserRole(
        mockAdminUser.id,
        mockCustomerUser.id,
        { role: Role.admin },
        '192.168.1.50',
      );

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: mockCustomerUser.id },
        data: { role: Role.admin },
        include: {
          _count: { select: { orders: true, addresses: true } },
        },
      });

      expect(auditService.warn).toHaveBeenCalledWith(
        AuditEvent.ADMIN_USER_ROLE_CHANGED,
        {
          ip: '192.168.1.50',
          userId: mockAdminUser.id,
          resourceId: mockCustomerUser.id,
          details: {
            targetEmail: mockCustomerUser.email,
            previousRole: Role.customer,
            newRole: Role.admin,
          },
        },
      );

      expect(result.role).toBe(Role.admin);
      expect(result.totalSpent).toBe(450.5);
    });

    it('should throw NotFoundException when target user is not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.updateUserRole('admin-1', 'non-existent', {
          role: Role.customer,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when admin attempts self-lockout by removing their own admin role', async () => {
      prisma.user.findUnique.mockResolvedValue(mockAdminUser);

      await expect(
        service.updateUserRole(
          mockAdminUser.id,
          mockAdminUser.id,
          { role: Role.customer },
          '127.0.0.1',
        ),
      ).rejects.toThrow(
        new BadRequestException('Kendi yöneticilik yetkinizi kaldıramazsınız.'),
      );

      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when attempting to demote the only remaining admin in the system', async () => {
      const otherAdmin = { ...mockAdminUser, id: 'admin-uuid-99' };
      prisma.user.findUnique.mockResolvedValue(otherAdmin);
      // Simulate that there is only 1 admin in the system
      prisma.user.count.mockResolvedValue(1);

      await expect(
        service.updateUserRole(
          mockAdminUser.id,
          otherAdmin.id,
          { role: Role.customer },
          '127.0.0.1',
        ),
      ).rejects.toThrow(
        new BadRequestException('Sistemde en az bir yönetici bulunmalıdır.'),
      );

      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('should allow demoting another admin to customer when multiple admins exist', async () => {
      const otherAdmin = { ...mockAdminUser, id: 'admin-uuid-99' };
      prisma.user.findUnique.mockResolvedValue(otherAdmin);
      // Multiple admins exist in system
      prisma.user.count.mockResolvedValue(2);
      prisma.user.update.mockResolvedValue({
        ...otherAdmin,
        role: Role.customer,
      });
      prisma.order.aggregate.mockResolvedValue({ _sum: { totalPrice: 0 } });

      const result = await service.updateUserRole(
        mockAdminUser.id,
        otherAdmin.id,
        { role: Role.customer },
      );

      expect(result.role).toBe(Role.customer);
      expect(prisma.user.update).toHaveBeenCalled();
    });
  });
});
