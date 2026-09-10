import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Decimal } from '@prisma/client/runtime/library';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentsService } from '../payments/payments.service';
import { OrdersService } from './orders.service';
import {
  DEFAULT_CURRENCY,
  DEFAULT_SHIPPING_FEE,
  FREE_SHIPPING_THRESHOLD,
} from './order.constants';
import {
  MOCK_ADDRESS_ID,
  MOCK_ORDER_ID,
  MOCK_ORDER_NO,
  MOCK_USER_ID,
  mockOrderDetail,
  mockOrdersList,
} from './test/orders.fixtures';

describe('OrdersService - Query & Settings', () => {
  let service: OrdersService;

  let prismaService: {
    address: { findFirst: jest.Mock };
    cartItem: { findMany: jest.Mock };
    order: {
      findMany: jest.Mock;
      findFirst: jest.Mock;
      count: jest.Mock;
    };
  };

  let paymentsService: {
    getPaymentSettings: jest.Mock;
    charge: jest.Mock;
  };

  beforeEach(async () => {
    prismaService = {
      address: { findFirst: jest.fn() },
      cartItem: { findMany: jest.fn() },
      order: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        count: jest.fn(),
      },
    };

    paymentsService = {
      getPaymentSettings: jest.fn().mockReturnValue({
        card_types: ['visa', 'mastercard', 'troy'],
        payment_types: ['credit_card', 'debit_card'],
        currency: 'TRY',
      }),
      charge: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: PrismaService, useValue: prismaService },
        { provide: PaymentsService, useValue: paymentsService },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  describe('getPaymentSettings', () => {
    it('ödeme ayarlarını PaymentsService üzerinden delege ederek dönmelidir', () => {
      const result = service.getPaymentSettings();

      expect(paymentsService.getPaymentSettings).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        card_types: ['visa', 'mastercard', 'troy'],
        payment_types: ['credit_card', 'debit_card'],
        currency: 'TRY',
      });
    });
  });

  describe('calculateShipmentFee', () => {
    const userId = MOCK_USER_ID;
    const addressId = MOCK_ADDRESS_ID;

    it('adres bulunamazsa veya kullanıcıya ait değilse NotFoundException fırlatmalıdır (IDOR Koruması)', async () => {
      prismaService.address.findFirst.mockResolvedValue(null);

      await expect(
        service.calculateShipmentFee(userId, addressId),
      ).rejects.toThrow(NotFoundException);

      expect(prismaService.address.findFirst).toHaveBeenCalledWith({
        where: { id: addressId, userId },
      });
    });

    it('sepet tutarı 500 TL altında kaldığında standart kargo ücreti dönmelidir', async () => {
      prismaService.address.findFirst.mockResolvedValue({
        id: addressId,
        userId,
      });
      prismaService.cartItem.findMany.mockResolvedValue([
        {
          pieces: 1,
          productVariant: {
            totalPrice: new Decimal(250),
            discountedPrice: null,
          },
        },
      ]);

      const result = await service.calculateShipmentFee(userId, addressId);

      expect(result).toEqual({
        fee: DEFAULT_SHIPPING_FEE,
        currency: DEFAULT_CURRENCY,
        free_shipping_threshold: FREE_SHIPPING_THRESHOLD,
        is_free: false,
      });
    });

    it('sepet tutarı 500 TL veya üzeri olduğunda ücretsiz kargo (fee: 0, is_free: true) dönmelidir', async () => {
      prismaService.address.findFirst.mockResolvedValue({
        id: addressId,
        userId,
      });
      prismaService.cartItem.findMany.mockResolvedValue([
        {
          pieces: 2,
          productVariant: {
            totalPrice: new Decimal(300),
            discountedPrice: null,
          },
        },
      ]);

      const result = await service.calculateShipmentFee(userId, addressId);

      expect(result).toEqual({
        fee: 0,
        currency: DEFAULT_CURRENCY,
        free_shipping_threshold: FREE_SHIPPING_THRESHOLD,
        is_free: true,
      });
    });
  });

  describe('findUserOrders', () => {
    const userId = MOCK_USER_ID;

    it('kullanıcının siparişlerini sayfalı ve tarihe göre azalan sırada getirmelidir', async () => {
      prismaService.order.findMany.mockResolvedValue(mockOrdersList);
      prismaService.order.count.mockResolvedValue(1);

      const result = await service.findUserOrders(userId, {
        limit: 10,
        offset: 5,
      });

      expect(prismaService.order.findMany).toHaveBeenCalledWith({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: 5,
        take: 10,
        include: {
          items: true,
          payment: true,
        },
      });

      expect(prismaService.order.count).toHaveBeenCalledWith({
        where: { userId },
      });

      expect(result.count).toBe(1);
      expect(result.results).toHaveLength(1);
      expect(result.results[0].id).toBe('ord-1');
      expect(result.results[0].item_count).toBe(2);
    });

    it('sorgu parametresi verilmediğinde varsayılan sayfalama değerlerini kullanmalıdır', async () => {
      prismaService.order.findMany.mockResolvedValue([]);
      prismaService.order.count.mockResolvedValue(0);

      const result = await service.findUserOrders(userId);

      expect(prismaService.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 20,
        }),
      );
      expect(result).toEqual({ count: 0, results: [] });
    });
  });

  describe('findUserOrderById', () => {
    const userId = MOCK_USER_ID;
    const orderId = MOCK_ORDER_ID;

    it('sipariş bulunduğunda ve kullanıcıya ait olduğunda detaylı siparişi dönmelidir', async () => {
      prismaService.order.findFirst.mockResolvedValue(mockOrderDetail);

      const result = await service.findUserOrderById(userId, orderId);

      expect(prismaService.order.findFirst).toHaveBeenCalledWith({
        where: { id: orderId, userId },
        include: {
          items: true,
          payment: true,
        },
      });

      expect(result.id).toBe(orderId);
      expect(result.order_no).toBe(MOCK_ORDER_NO);
    });

    it('sipariş bulunamazsa veya başka kullanıcıya aitse NotFoundException fırlatmalıdır (IDOR Koruması)', async () => {
      prismaService.order.findFirst.mockResolvedValue(null);

      await expect(service.findUserOrderById(userId, orderId)).rejects.toThrow(
        NotFoundException,
      );

      expect(prismaService.order.findFirst).toHaveBeenCalledWith({
        where: { id: orderId, userId },
        include: {
          items: true,
          payment: true,
        },
      });
    });
  });
});
