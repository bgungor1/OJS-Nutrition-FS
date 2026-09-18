import { Test, TestingModule } from '@nestjs/testing';
import { OrderStatus, Role } from '@prisma/client';
import { AuthenticatedUser } from '../common/types/authenticated-user';
import { AdminOrdersController } from './admin-orders.controller';
import { AdminOrdersService } from './admin-orders.service';
import {
  AdminOrderDetailResponseDto,
  AdminOrdersPaginatedResponseDto,
  AdminOrdersQueryDto,
  UpdateAdminOrderStatusDto,
} from './dto';

describe('AdminOrdersController', () => {
  let controller: AdminOrdersController;
  let service: {
    listOrders: jest.Mock;
    getOrderById: jest.Mock;
    updateOrderStatus: jest.Mock;
  };

  const mockAdminUser: AuthenticatedUser = {
    id: 'admin-1',
    email: 'admin@example.com',
    role: Role.admin,
  };

  const mockDetail: AdminOrderDetailResponseDto = {
    id: 'ord-1',
    orderNo: 'OJS-2026-0001',
    status: OrderStatus.processing,
    totalPrice: 929.9,
    shippingFee: 29.9,
    addressSnapshot: { fullAddress: 'Test Adres' },
    createdAt: '2026-01-02T10:00:00.000Z',
    updatedAt: '2026-01-02T10:30:00.000Z',
    user: {
      id: 'usr-1',
      email: 'user@example.com',
      firstName: 'Can',
      lastName: 'Demir',
      phoneNumber: null,
    },
    items: [],
    payment: null,
  };

  const mockPaginated: AdminOrdersPaginatedResponseDto = {
    count: 1,
    limit: 20,
    offset: 0,
    results: [
      {
        id: 'ord-1',
        orderNo: 'OJS-2026-0001',
        status: OrderStatus.processing,
        totalPrice: 929.9,
        shippingFee: 29.9,
        itemCount: 2,
        createdAt: '2026-01-02T10:00:00.000Z',
        user: {
          id: 'usr-1',
          email: 'user@example.com',
          firstName: 'Can',
          lastName: 'Demir',
          phoneNumber: null,
        },
        payment: null,
      },
    ],
  };

  beforeEach(async () => {
    service = {
      listOrders: jest.fn(),
      getOrderById: jest.fn(),
      updateOrderStatus: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminOrdersController],
      providers: [
        {
          provide: AdminOrdersService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<AdminOrdersController>(AdminOrdersController);
  });

  describe('listOrders', () => {
    it('should delegate to adminOrdersService.listOrders', async () => {
      service.listOrders.mockResolvedValue(mockPaginated);

      const query: AdminOrdersQueryDto = { limit: 10, offset: 0 };
      const result = await controller.listOrders(query);

      expect(result).toEqual(mockPaginated);
      expect(service.listOrders).toHaveBeenCalledWith(query);
    });
  });

  describe('getOrderById', () => {
    it('should delegate to adminOrdersService.getOrderById', async () => {
      service.getOrderById.mockResolvedValue(mockDetail);

      const result = await controller.getOrderById('ord-1');

      expect(result).toEqual(mockDetail);
      expect(service.getOrderById).toHaveBeenCalledWith('ord-1');
    });
  });

  describe('updateOrderStatus', () => {
    it('should delegate to adminOrdersService.updateOrderStatus', async () => {
      service.updateOrderStatus.mockResolvedValue({
        ...mockDetail,
        status: OrderStatus.shipped,
      });

      const dto: UpdateAdminOrderStatusDto = { status: OrderStatus.shipped };
      const result = await controller.updateOrderStatus(
        'ord-1',
        dto,
        mockAdminUser,
        '127.0.0.1',
      );

      expect(result.status).toBe(OrderStatus.shipped);
      expect(service.updateOrderStatus).toHaveBeenCalledWith(
        'ord-1',
        dto,
        mockAdminUser.id,
        '127.0.0.1',
      );
    });
  });
});
