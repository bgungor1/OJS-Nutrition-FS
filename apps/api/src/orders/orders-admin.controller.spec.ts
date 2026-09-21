import { Test, TestingModule } from '@nestjs/testing';
import { OrderStatus } from '@prisma/client';
import { OrdersAdminController } from './orders-admin.controller';
import { OrdersService } from './orders.service';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { MOCK_ORDER_ID, mockOrderDetail } from './test/orders.fixtures';

describe('OrdersAdminController', () => {
  let controller: OrdersAdminController;
  let ordersService: {
    updateOrderStatus: jest.Mock;
  };

  beforeEach(async () => {
    ordersService = {
      updateOrderStatus: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersAdminController],
      providers: [
        {
          provide: OrdersService,
          useValue: ordersService,
        },
      ],
    }).compile();

    controller = module.get<OrdersAdminController>(OrdersAdminController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('updateStatus', () => {
    it('should call updateOrderStatus with order id and update status dto', async () => {
      ordersService.updateOrderStatus.mockResolvedValue(mockOrderDetail);
      const dto: UpdateOrderStatusDto = { status: OrderStatus.processing };

      const result = await controller.updateStatus(MOCK_ORDER_ID, dto);

      expect(ordersService.updateOrderStatus).toHaveBeenCalledWith(
        MOCK_ORDER_ID,
        dto,
      );
      expect(result).toBe(mockOrderDetail);
    });
  });
});
