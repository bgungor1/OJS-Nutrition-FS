import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { OrderStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentsService } from '../payments/payments.service';
import { OrdersService } from './orders.service';
import {
  MOCK_ORDER_ID,
  MOCK_ORDER_NO,
  MOCK_USER_ID,
  mockAddress,
  mockCartItem,
  mockCompleteShoppingDto,
  mockCreatedOrder,
  mockPaymentChargeSuccess,
  mockUser,
} from './test/orders.fixtures';

describe('OrdersService - Checkout Flow', () => {
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
      getPaymentSettings: jest.fn(),
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

  describe('completeShopping', () => {
    const userId = MOCK_USER_ID;
    const dto = mockCompleteShoppingDto;

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
      paymentsService.charge.mockResolvedValue(mockPaymentChargeSuccess);
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

      expect(result.id).toBe(MOCK_ORDER_ID);
      expect(result.order_no).toBe(MOCK_ORDER_NO);
      expect(result.status).toBe(OrderStatus.pending);
      expect(result.total_price).toBe(600);
      expect(result.items).toHaveLength(1);
      expect(result.cart_detail).toHaveLength(1);
      expect(result.payment?.provider_ref).toBe('mock_pay_123');
    });
  });
});
