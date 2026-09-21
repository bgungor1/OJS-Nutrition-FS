import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '@prisma/client';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { AuthenticatedUser } from '../common/types/authenticated-user';
import { CompleteShoppingDto } from './dto/complete-shopping.dto';
import {
  MOCK_ADDRESS_ID,
  MOCK_ORDER_ID,
  MOCK_USER_ID,
  mockCompleteShoppingDto,
  mockOrderDetail,
} from './test/orders.fixtures';

describe('OrdersController', () => {
  let controller: OrdersController;
  let ordersService: {
    getPaymentSettings: jest.Mock;
    calculateShipmentFee: jest.Mock;
    findUserOrders: jest.Mock;
    findUserOrderById: jest.Mock;
    completeShopping: jest.Mock;
  };

  const mockUser: AuthenticatedUser = {
    id: MOCK_USER_ID,
    email: 'user@example.com',
    role: Role.customer,
  };

  beforeEach(async () => {
    ordersService = {
      getPaymentSettings: jest.fn(),
      calculateShipmentFee: jest.fn(),
      findUserOrders: jest.fn(),
      findUserOrderById: jest.fn(),
      completeShopping: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        {
          provide: OrdersService,
          useValue: ordersService,
        },
      ],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getPaymentSettings', () => {
    it('should return payment settings from service', () => {
      const mockSettings = {
        card_types: ['visa', 'mastercard'],
        payment_types: ['credit_card'],
        currency: 'TRY',
      };
      ordersService.getPaymentSettings.mockReturnValue(mockSettings);

      const result = controller.getPaymentSettings();

      expect(ordersService.getPaymentSettings).toHaveBeenCalledTimes(1);
      expect(result).toBe(mockSettings);
    });
  });

  describe('calculateShipmentFee', () => {
    it('should call shipment fee calculation with user id and address parameter', async () => {
      const mockFee = {
        fee: 0,
        currency: 'TRY',
        free_shipping_threshold: 500,
        is_free: true,
      };
      ordersService.calculateShipmentFee.mockResolvedValue(mockFee);

      const result = await controller.calculateShipmentFee(mockUser, {
        address_id: MOCK_ADDRESS_ID,
      });

      expect(ordersService.calculateShipmentFee).toHaveBeenCalledWith(
        mockUser.id,
        MOCK_ADDRESS_ID,
      );
      expect(result).toBe(mockFee);
    });
  });

  describe('listOrders', () => {
    it('should call order list with user id and pagination parameters', async () => {
      const mockPaginated = { count: 1, results: [] };
      ordersService.findUserOrders.mockResolvedValue(mockPaginated);

      const result = await controller.listOrders(mockUser, {
        limit: 10,
        offset: 0,
      });

      expect(ordersService.findUserOrders).toHaveBeenCalledWith(mockUser.id, {
        limit: 10,
        offset: 0,
      });
      expect(result).toBe(mockPaginated);
    });
  });

  describe('getOrderDetail', () => {
    it('should call order detail query with user id and order id', async () => {
      ordersService.findUserOrderById.mockResolvedValue(mockOrderDetail);

      const result = await controller.getOrderDetail(mockUser, MOCK_ORDER_ID);

      expect(ordersService.findUserOrderById).toHaveBeenCalledWith(
        mockUser.id,
        MOCK_ORDER_ID,
      );
      expect(result).toBe(mockOrderDetail);
    });
  });

  describe('completeShopping', () => {
    it('should call completeShopping with user, dto, and IP info', async () => {
      ordersService.completeShopping.mockResolvedValue(mockOrderDetail);
      const dto: CompleteShoppingDto = mockCompleteShoppingDto;

      const result = await controller.completeShopping(
        mockUser,
        dto,
        '192.168.1.1',
      );

      expect(ordersService.completeShopping).toHaveBeenCalledWith(
        mockUser.id,
        dto,
        '192.168.1.1',
      );
      expect(result).toBe(mockOrderDetail);
    });
  });
});
