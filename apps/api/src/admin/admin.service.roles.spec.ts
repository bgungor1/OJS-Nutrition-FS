import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '@prisma/client';
import { AuditEvent, SecurityAuditService } from '../common/audit';
import { PrismaService } from '../prisma';
import { AdminService } from './admin.service';
import { mockAdminUser, mockCustomerUser } from './test/admin.fixtures';

describe('AdminService - updateUserRole', () => {
  let service: AdminService;
  let prisma: {
    user: {
      findUnique: jest.Mock;
      count: jest.Mock;
      update: jest.Mock;
    };
    order: {
      aggregate: jest.Mock;
    };
  };
  let auditService: {
    warn: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
      },
      order: {
        aggregate: jest.fn(),
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
