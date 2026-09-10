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

describe('OrdersService', () => {
  let service: OrdersService;
  let prismaService: {
    address: { findFirst: jest.Mock };
    cartItem: { findMany: jest.Mock };
  };
  let paymentsService: {
    getPaymentSettings: jest.Mock;
  };

  beforeEach(async () => {
    prismaService = {
      address: { findFirst: jest.fn() },
      cartItem: { findMany: jest.fn() },
    };

    paymentsService = {
      getPaymentSettings: jest.fn().mockReturnValue({
        card_types: ['visa', 'mastercard', 'troy'],
        payment_types: ['credit_card', 'debit_card'],
        currency: 'TRY',
      }),
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

  describe('calculateSubtotal', () => {
    it('normal fiyatlı ürünlerin alt toplamını adetleriyle çarparak hesaplamalıdır', () => {
      const items = [
        {
          pieces: 2,
          productVariant: {
            totalPrice: new Decimal(100),
            discountedPrice: null,
          },
        },
        {
          pieces: 1,
          productVariant: {
            totalPrice: new Decimal(250),
            discountedPrice: null,
          },
        },
      ];

      const subtotal = service.calculateSubtotal(items);
      expect(subtotal).toBe(450);
    });

    it('indirimli fiyatı (discountedPrice) olan ürünlerde indirimli fiyatı esas almalıdır', () => {
      const items = [
        {
          pieces: 2,
          productVariant: {
            totalPrice: new Decimal(200),
            discountedPrice: new Decimal(150),
          },
        },
      ];

      const subtotal = service.calculateSubtotal(items);
      expect(subtotal).toBe(300);
    });
  });

  describe('calculateShippingFeeFromSubtotal', () => {
    it('ücretsiz kargo eşiğinin (500 TL) altındaki tutarlarda standart kargo ücreti dönmelidir', () => {
      expect(service.calculateShippingFeeFromSubtotal(499.99)).toBe(
        DEFAULT_SHIPPING_FEE,
      );
      expect(service.calculateShippingFeeFromSubtotal(0)).toBe(
        DEFAULT_SHIPPING_FEE,
      );
    });

    it('ücretsiz kargo eşiğine eşit veya üstündeki tutarlarda 0 TL dönmelidir', () => {
      expect(
        service.calculateShippingFeeFromSubtotal(FREE_SHIPPING_THRESHOLD),
      ).toBe(0);
      expect(service.calculateShippingFeeFromSubtotal(1000)).toBe(0);
    });
  });

  describe('calculateShipmentFee', () => {
    const userId = 'user-uuid-1';
    const addressId = 'address-uuid-1';

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
});
