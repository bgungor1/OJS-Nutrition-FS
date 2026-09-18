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
      count: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
    };
    order: {
      groupBy: jest.Mock;
      aggregate: jest.Mock;
    };
  };
  let auditService: {
    warn: jest.Mock;
    info: jest.Mock;
    alarm: jest.Mock;
  };

  const mockAdminUser = {
    id: 'admin-uuid-1',
    email: 'admin@ojsnutrition.com',
    firstName: 'Admin',
    lastName: 'User',
    phoneNumber: '05550000000',
    role: Role.admin,
    authProvider: AuthProvider.local,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    _count: { orders: 5, addresses: 1 },
  };

  const mockCustomerUser = {
    id: 'customer-uuid-2',
    email: 'customer@example.com',
    firstName: 'Can',
    lastName: 'Demir',
    phoneNumber: '05551112233',
    role: Role.customer,
    authProvider: AuthProvider.local,
    createdAt: new Date('2026-02-01T00:00:00.000Z'),
    updatedAt: new Date('2026-02-01T00:00:00.000Z'),
    _count: { orders: 2, addresses: 1 },
  };

  beforeEach(async () => {
    prisma = {
      user: {
        count: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      order: {
        groupBy: jest.fn(),
        aggregate: jest.fn(),
      },
    };

    auditService = {
      warn: jest.fn(),
      info: jest.fn(),
      alarm: jest.fn(),
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

  describe('listUsers', () => {
    it('should list users with default pagination and compute total spent for each user', async () => {
      prisma.user.count.mockResolvedValue(2);
      prisma.user.findMany.mockResolvedValue([mockAdminUser, mockCustomerUser]);
      prisma.order.groupBy.mockResolvedValue([
        {
          userId: mockAdminUser.id,
          _sum: { totalPrice: 1500.0 },
        },
        {
          userId: mockCustomerUser.id,
          _sum: { totalPrice: 450.5 },
        },
      ]);

      const result = await service.listUsers({});

      expect(prisma.user.count).toHaveBeenCalledWith({ where: {} });
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 20,
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { orders: true, addresses: true } } },
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
      expect(result.results[0].totalSpent).toBe(1500);
      expect(result.results[1].id).toBe(mockCustomerUser.id);
      expect(result.results[1].totalSpent).toBe(450.5);
      expect(result.next).toBeNull();
      expect(result.previous).toBeNull();
    });

    it('should create OR conditions with trimmed search query', async () => {
      prisma.user.count.mockResolvedValue(1);
      prisma.user.findMany.mockResolvedValue([mockCustomerUser]);
      prisma.order.groupBy.mockResolvedValue([]);

      const result = await service.listUsers({ search: '  Can  ' });

      expect(prisma.user.count).toHaveBeenCalledWith({
        where: {
          OR: [
            { firstName: { contains: 'Can', mode: 'insensitive' } },
            { lastName: { contains: 'Can', mode: 'insensitive' } },
            { email: { contains: 'Can', mode: 'insensitive' } },
          ],
        },
      });
      expect(result.count).toBe(1);
      expect(result.results[0].id).toBe(mockCustomerUser.id);
    });

    it('should apply role filter to query condition when provided', async () => {
      prisma.user.count.mockResolvedValue(1);
      prisma.user.findMany.mockResolvedValue([mockAdminUser]);
      prisma.order.groupBy.mockResolvedValue([]);

      const result = await service.listUsers({ role: Role.admin });

      expect(prisma.user.count).toHaveBeenCalledWith({
        where: { role: Role.admin },
      });
      expect(result.results[0].role).toBe(Role.admin);
    });

    it('should generate correct next and previous pagination links', async () => {
      prisma.user.count.mockResolvedValue(50);
      prisma.user.findMany.mockResolvedValue([mockAdminUser]);
      prisma.order.groupBy.mockResolvedValue([]);

      const result = await service.listUsers({ limit: 10, offset: 20 });

      expect(result.count).toBe(50);
      expect(result.next).toBe('?limit=10&offset=30');
      expect(result.previous).toBe('?limit=10&offset=10');
    });
  });

  describe('getUserById', () => {
    it('should return user detail profile, addresses, and orders when user is found', async () => {
      const mockDetailedUser = {
        ...mockCustomerUser,
        passwordHash: '$2b$10$hashedsecretpass',
        addresses: [
          {
            id: 'addr-1',
            title: 'Home',
            firstName: 'Can',
            lastName: 'Demir',
            fullAddress: 'Bağdat Cad. No: 10',
            phoneNumber: '05551112233',
            createdAt: new Date('2026-02-02T00:00:00.000Z'),
            country: { id: 1, name: 'Türkiye' },
            region: { id: 34, name: 'İstanbul' },
            subregion: { id: 341, name: 'Kadıköy' },
          },
        ],
        orders: [
          {
            id: 'order-1',
            orderNo: 'ORD-2026-0001',
            status: OrderStatus.delivered,
            totalPrice: 450.5,
            createdAt: new Date('2026-02-05T00:00:00.000Z'),
            items: [{ pieces: 2 }, { pieces: 1 }],
          },
          {
            id: 'order-2',
            orderNo: 'ORD-2026-0002',
            status: OrderStatus.cancelled,
            totalPrice: 200.0,
            createdAt: new Date('2026-02-10T00:00:00.000Z'),
            items: [{ pieces: 1 }],
          },
        ],
      };

      prisma.user.findUnique.mockResolvedValue(mockDetailedUser);

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
