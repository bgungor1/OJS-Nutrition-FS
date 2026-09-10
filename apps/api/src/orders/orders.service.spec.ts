import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { OrderStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentsService } from '../payments/payments.service';
import { OrdersService } from './orders.service';
import {
  DEFAULT_CURRENCY,
  DEFAULT_SHIPPING_FEE,
  FREE_SHIPPING_THRESHOLD,
} from './order.constants';
import { CompleteShoppingDto } from './dto/complete-shopping.dto';

describe('OrdersService', () => {
  let service: OrdersService;

  let prismaService: {
    address: { findFirst: jest.Mock };
    user: { findUnique: jest.Mock };
    cartItem: { findMany: jest.Mock };
    $transaction: jest.Mock;
  };

  let txMock: {
    productVariant: { updateMany: jest.Mock };
    order: { create: jest.Mock };
    cartItem: { deleteMany: jest.Mock };
  };

  let paymentsService: {
    getPaymentSettings: jest.Mock;
    charge: jest.Mock;
  };

  beforeEach(async () => {
    txMock = {
      productVariant: { updateMany: jest.fn() },
      order: { create: jest.fn() },
      cartItem: { deleteMany: jest.fn() },
    };

    prismaService = {
      address: { findFirst: jest.fn() },
      user: { findUnique: jest.fn() },
      cartItem: { findMany: jest.fn() },
      $transaction: jest.fn((cb: (tx: typeof txMock) => Promise<unknown>) =>
        cb(txMock),
      ),
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

  describe('completeShopping', () => {
    const userId = 'user-uuid-1';
    const addressId = 'address-uuid-1';

    const mockAddress = {
      id: addressId,
      userId,
      title: 'Ev',
      firstName: 'Ahmet',
      lastName: 'Yılmaz',
      phoneNumber: '05551112233',
      fullAddress: 'Bağdat Cad. No: 10/2',
      country: { name: 'Türkiye' },
      region: { name: 'İstanbul' },
      subregion: { name: 'Kadıköy' },
    };

    const mockUser = {
      id: userId,
      firstName: 'Ahmet',
      lastName: 'Yılmaz',
      email: 'ahmet@example.com',
      phoneNumber: '05551112233',
    };

    const mockCartItem = {
      id: 'cart-item-1',
      userId,
      productId: 'prod-1',
      productVariantId: 'var-1',
      pieces: 2,
      product: {
        id: 'prod-1',
        name: 'Whey Protein',
      },
      productVariant: {
        id: 'var-1',
        aroma: 'Çikolata',
        totalPrice: new Decimal(300),
        discountedPrice: null,
        photoSrc: 'media/products/whey.jpg',
        stockQuantity: 10,
        isAvailable: true,
      },
    };

    const dto: CompleteShoppingDto = {
      address_id: addressId,
      payment_type: 'credit_card',
      payment_token: 'tok_sandbox_test_token',
    };

    it('adres bulunamazsa NotFoundException fırlatmalıdır (IDOR koruması)', async () => {
      prismaService.address.findFirst.mockResolvedValue(null);

      await expect(service.completeShopping(userId, dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('kullanıcı bulunamazsa NotFoundException fırlatmalıdır', async () => {
      prismaService.address.findFirst.mockResolvedValue(mockAddress);
      prismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.completeShopping(userId, dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('kullanıcının sepeti boşsa BadRequestException fırlatmalıdır', async () => {
      prismaService.address.findFirst.mockResolvedValue(mockAddress);
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      prismaService.cartItem.findMany.mockResolvedValue([]);

      await expect(service.completeShopping(userId, dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('yetersiz stok durumunda ConflictException fırlatmalı ve ödeme çekimi yapmamalıdır', async () => {
      prismaService.address.findFirst.mockResolvedValue(mockAddress);
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      prismaService.cartItem.findMany.mockResolvedValue([mockCartItem]);

      // Atomik stok düşümünde count: 0 dönerse (stok yetersiz)
      txMock.productVariant.updateMany.mockResolvedValue({ count: 0 });

      await expect(service.completeShopping(userId, dto)).rejects.toThrow(
        ConflictException,
      );

      expect(txMock.productVariant.updateMany).toHaveBeenCalledWith({
        where: {
          id: 'var-1',
          stockQuantity: { gte: 2 },
          isAvailable: true,
        },
        data: { stockQuantity: { decrement: 2 } },
      });

      expect(paymentsService.charge).not.toHaveBeenCalled();
      expect(txMock.order.create).not.toHaveBeenCalled();
    });

    it('ödeme başarısız olduğunda BadRequestException fırlatmalı ve sipariş kaydetmemelidir', async () => {
      prismaService.address.findFirst.mockResolvedValue(mockAddress);
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      prismaService.cartItem.findMany.mockResolvedValue([mockCartItem]);

      txMock.productVariant.updateMany.mockResolvedValue({ count: 1 });

      paymentsService.charge.mockResolvedValue({
        success: false,
        rawStatus: 'failed',
        errorMessage: 'Kart limiti yetersiz.',
      });

      await expect(service.completeShopping(userId, dto)).rejects.toThrow(
        BadRequestException,
      );

      expect(paymentsService.charge).toHaveBeenCalledTimes(1);
      expect(txMock.order.create).not.toHaveBeenCalled();
      expect(txMock.cartItem.deleteMany).not.toHaveBeenCalled();
    });

    it('tüm adımlar başarılı olduğunda sipariş, kalemler ve ödeme kaydı oluşturulup sepet silinmelidir', async () => {
      prismaService.address.findFirst.mockResolvedValue(mockAddress);
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      prismaService.cartItem.findMany.mockResolvedValue([mockCartItem]);

      txMock.productVariant.updateMany.mockResolvedValue({ count: 1 });

      paymentsService.charge.mockResolvedValue({
        success: true,
        rawStatus: 'succeeded',
        provider: 'mock',
        providerRef: 'mock_pay_123',
        cardType: 'VISA',
        last4: '4242',
      });

      const mockCreatedOrder = {
        id: 'ord-123',
        orderNo: 'ORD-20260910-A1B2C3',
        userId,
        status: OrderStatus.pending,
        totalPrice: new Decimal(600), // subtotal: 600 >= 500 -> free shipping (fee: 0)
        shippingFee: new Decimal(0),
        addressSnapshot: {
          title: 'Ev',
          firstName: 'Ahmet',
          lastName: 'Yılmaz',
          phoneNumber: '05551112233',
          country: 'Türkiye',
          region: 'İstanbul',
          subregion: 'Kadıköy',
          fullAddress: 'Bağdat Cad. No: 10/2',
        },
        createdAt: new Date('2026-09-10T15:00:00.000Z'),
        updatedAt: new Date('2026-09-10T15:00:00.000Z'),
        items: [
          {
            id: 'item-1',
            orderId: 'ord-123',
            productId: 'prod-1',
            productVariantId: 'var-1',
            productName: 'Whey Protein',
            variantName: 'Çikolata',
            pieces: 2,
            unitPrice: new Decimal(300),
            totalPrice: new Decimal(600),
            photo: 'media/products/whey.jpg',
          },
        ],
        payment: {
          id: 'pay-1',
          orderId: 'ord-123',
          provider: 'mock',
          providerRef: 'mock_pay_123',
          cardType: 'VISA',
          last4: '4242',
          status: 'succeeded',
          createdAt: new Date('2026-09-10T15:00:00.000Z'),
        },
      };

      txMock.order.create.mockResolvedValue(mockCreatedOrder);
      txMock.cartItem.deleteMany.mockResolvedValue({ count: 1 });

      const result = await service.completeShopping(
        userId,
        dto,
        '192.168.1.100',
      );

      expect(txMock.productVariant.updateMany).toHaveBeenCalledWith({
        where: {
          id: 'var-1',
          stockQuantity: { gte: 2 },
          isAvailable: true,
        },
        data: { stockQuantity: { decrement: 2 } },
      });

      expect(paymentsService.charge).toHaveBeenCalledWith(
        expect.objectContaining({
          paymentToken: 'tok_sandbox_test_token',
          amount: 600,
          paymentType: 'credit_card',
        }),
      );

      expect(txMock.order.create).toHaveBeenCalled();
      const calls = txMock.order.create.mock.calls as unknown[][];
      const orderCreateCall = calls[0][0] as {
        data: { userId: string; totalPrice: number; shippingFee: number };
      };
      expect(orderCreateCall.data.userId).toBe(userId);
      expect(orderCreateCall.data.totalPrice).toBe(600);
      expect(orderCreateCall.data.shippingFee).toBe(0);

      expect(txMock.cartItem.deleteMany).toHaveBeenCalledWith({
        where: { userId },
      });

      expect(result.id).toBe('ord-123');
      expect(result.order_no).toBe('ORD-20260910-A1B2C3');
      expect(result.status).toBe(OrderStatus.pending);
      expect(result.total_price).toBe(600);
      expect(result.items).toHaveLength(1);
      expect(result.cart_detail).toHaveLength(1);
      expect(result.payment?.provider_ref).toBe('mock_pay_123');
    });
  });
});
