import { Test, TestingModule } from '@nestjs/testing';
import { Role, OrderStatus } from '@prisma/client';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { AuthenticatedUser } from '../common/types/authenticated-user';
import { CompleteShoppingDto } from './dto/complete-shopping.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
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
    updateOrderStatus: jest.Mock;
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
      updateOrderStatus: jest.fn(),
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

  it('controller tanımlanmış olmalıdır', () => {
    expect(controller).toBeDefined();
  });

  describe('getPaymentSettings', () => {
    it('ödeme ayarlarını servisten alıp dönmelidir', () => {
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
    it('kullanıcı kimliği ve adres parametresiyle kargo hesaplama metodunu çağırmalıdır', async () => {
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
    it('kullanıcı kimliği ve sayfalama parametreleriyle sipariş listesini çağırmalıdır', async () => {
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
    it('kullanıcı kimliği ve sipariş kimliği ile detay sorgusunu çağırmalıdır', async () => {
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
    it('kullanıcı, dto ve ip bilgisiyle sipariş tamamlama metodunu çağırmalıdır', async () => {
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

  describe('updateStatus', () => {
    it('sipariş kimliği ve yeni durum dto su ile durum güncelleme metodunu çağırmalıdır', async () => {
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
