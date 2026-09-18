import { Test, TestingModule } from '@nestjs/testing';
import { AuthProvider, Role } from '@prisma/client';
import { AuthenticatedUser } from '../common/types/authenticated-user';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import {
  AdminUserDetailResponseDto,
  AdminUserListItemDto,
  AdminUsersPaginatedResponseDto,
  AdminUsersQueryDto,
  UpdateUserRoleDto,
} from './dto';

describe('AdminController', () => {
  let controller: AdminController;
  let adminService: {
    listUsers: jest.Mock;
    getUserById: jest.Mock;
    updateUserRole: jest.Mock;
  };

  const mockAdminUser: AuthenticatedUser = {
    id: 'admin-uuid-1',
    email: 'admin@ojsnutrition.com',
    role: Role.admin,
  };

  beforeEach(async () => {
    adminService = {
      listUsers: jest.fn(),
      getUserById: jest.fn(),
      updateUserRole: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [{ provide: AdminService, useValue: adminService }],
    }).compile();

    controller = module.get<AdminController>(AdminController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('listUsers', () => {
    it('should call AdminService.listUsers with correct query parameters', async () => {
      const query: AdminUsersQueryDto = {
        limit: 10,
        offset: 0,
        search: 'Ahmet',
      };
      const mockResponse: AdminUsersPaginatedResponseDto = {
        count: 1,
        next: null,
        previous: null,
        results: [],
      };
      adminService.listUsers.mockResolvedValue(mockResponse);

      const result = await controller.listUsers(query);

      expect(adminService.listUsers).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getUserById', () => {
    it('should call AdminService.getUserById with user id', async () => {
      const userId = 'user-uuid-123';
      const mockDetail: AdminUserDetailResponseDto = {
        id: userId,
        email: 'user@example.com',
        firstName: 'Test',
        lastName: 'User',
        phoneNumber: null,
        role: Role.customer,
        authProvider: AuthProvider.local,
        ordersCount: 0,
        totalSpent: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        addresses: [],
        recentOrders: [],
      };
      adminService.getUserById.mockResolvedValue(mockDetail);

      const result = await controller.getUserById(userId);

      expect(adminService.getUserById).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockDetail);
    });
  });

  describe('updateUserRole', () => {
    it('should call AdminService.updateUserRole with adminId, targetId, dto, and ip', async () => {
      const targetId = 'target-user-uuid';
      const dto: UpdateUserRoleDto = { role: Role.admin };
      const ip = '127.0.0.1';
      const mockUpdated: AdminUserListItemDto = {
        id: targetId,
        email: 'target@example.com',
        firstName: 'Target',
        lastName: 'User',
        phoneNumber: null,
        role: Role.admin,
        authProvider: AuthProvider.local,
        ordersCount: 1,
        totalSpent: 100,
        addressesCount: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      adminService.updateUserRole.mockResolvedValue(mockUpdated);

      const result = await controller.updateUserRole(
        targetId,
        dto,
        mockAdminUser,
        ip,
      );

      expect(adminService.updateUserRole).toHaveBeenCalledWith(
        mockAdminUser.id,
        targetId,
        dto,
        ip,
      );
      expect(result).toEqual(mockUpdated);
    });
  });
});
