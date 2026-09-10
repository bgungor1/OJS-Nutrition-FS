import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { OrderStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentsService } from '../payments/payments.service';
import { OrdersService } from './orders.service';
import {
  MOCK_ORDER_ID,
  mockOrderDetailWithItems,
} from './test/orders.fixtures';

describe('OrdersService - Order Status Flow', () => {
  let service: OrdersService;

  let prismaService: {
    order: {
      findUnique: jest.Mock;
    };
    $transaction: jest.Mock;
  };

  let txMock: {
    productVariant: { update: jest.Mock };
    order: { update: jest.Mock };
  };

  beforeEach(async () => {
    txMock = {
      productVariant: { update: jest.fn() },
      order: { update: jest.fn() },
    };

    prismaService = {
      order: {
        findUnique: jest.fn(),
      },
      $transaction: jest.fn((cb: (tx: typeof txMock) => Promise<unknown>) =>
        cb(txMock),
      ),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: PrismaService, useValue: prismaService },
        { provide: PaymentsService, useValue: {} },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  describe('updateOrderStatus', () => {
    const orderId = MOCK_ORDER_ID;

    it('sipariş bulunamazsa NotFoundException fırlatmalıdır', async () => {
      prismaService.order.findUnique.mockResolvedValue(null);

      await expect(
        service.updateOrderStatus(orderId, { status: OrderStatus.processing }),
      ).rejects.toThrow(NotFoundException);

      expect(prismaService.order.findUnique).toHaveBeenCalledWith({
        where: { id: orderId },
        include: { items: true, payment: true },
      });
    });

    it('iptal edilmiş veya iade edilmiş sipariş güncellenmek istendiğinde BadRequestException fırlatmalıdır', async () => {
      prismaService.order.findUnique.mockResolvedValue({
        ...mockOrderDetailWithItems,
        status: OrderStatus.cancelled,
      });

      await expect(
        service.updateOrderStatus(orderId, { status: OrderStatus.processing }),
      ).rejects.toThrow(BadRequestException);
    });

    it('geçersiz durum geçişi denendiğinde BadRequestException fırlatmalıdır', async () => {
      prismaService.order.findUnique.mockResolvedValue({
        ...mockOrderDetailWithItems,
        status: OrderStatus.pending,
      });

      await expect(
        service.updateOrderStatus(orderId, { status: OrderStatus.delivered }),
      ).rejects.toThrow(BadRequestException);
    });

    it('normal durum geçişinde (pending -> processing) stok iadesi yapmadan sipariş durumunu güncellemelidir', async () => {
      prismaService.order.findUnique.mockResolvedValue({
        ...mockOrderDetailWithItems,
        status: OrderStatus.pending,
      });

      const mockUpdatedOrder = {
        ...mockOrderDetailWithItems,
        status: OrderStatus.processing,
      };
      txMock.order.update.mockResolvedValue(mockUpdatedOrder);

      const result = await service.updateOrderStatus(orderId, {
        status: OrderStatus.processing,
      });

      expect(txMock.productVariant.update).not.toHaveBeenCalled();
      expect(txMock.order.update).toHaveBeenCalledWith({
        where: { id: orderId },
        data: { status: OrderStatus.processing },
        include: { items: true, payment: true },
      });
      expect(result.status).toBe(OrderStatus.processing);
    });

    it('iptal durumuna geçişte (processing -> cancelled) kalemlerin stoğunu atomik artırmalı ve durumu güncellemelidir', async () => {
      prismaService.order.findUnique.mockResolvedValue({
        ...mockOrderDetailWithItems,
        status: OrderStatus.processing,
      });

      const mockUpdatedOrder = {
        ...mockOrderDetailWithItems,
        status: OrderStatus.cancelled,
      };
      txMock.order.update.mockResolvedValue(mockUpdatedOrder);

      const result = await service.updateOrderStatus(orderId, {
        status: OrderStatus.cancelled,
      });

      expect(txMock.productVariant.update).toHaveBeenCalledTimes(1);
      expect(txMock.productVariant.update).toHaveBeenCalledWith({
        where: { id: 'var-1' },
        data: { stockQuantity: { increment: 2 } },
      });
      expect(txMock.order.update).toHaveBeenCalledWith({
        where: { id: orderId },
        data: { status: OrderStatus.cancelled },
        include: { items: true, payment: true },
      });
      expect(result.status).toBe(OrderStatus.cancelled);
    });

    it('iade durumuna geçişte (delivered -> returned) kalemlerin stoğunu atomik artırmalı ve durumu güncellemelidir', async () => {
      prismaService.order.findUnique.mockResolvedValue({
        ...mockOrderDetailWithItems,
        status: OrderStatus.delivered,
      });

      const mockUpdatedOrder = {
        ...mockOrderDetailWithItems,
        status: OrderStatus.returned,
      };
      txMock.order.update.mockResolvedValue(mockUpdatedOrder);

      const result = await service.updateOrderStatus(orderId, {
        status: OrderStatus.returned,
      });

      expect(txMock.productVariant.update).toHaveBeenCalledTimes(1);
      expect(txMock.productVariant.update).toHaveBeenCalledWith({
        where: { id: 'var-1' },
        data: { stockQuantity: { increment: 2 } },
      });
      expect(txMock.order.update).toHaveBeenCalledWith({
        where: { id: orderId },
        data: { status: OrderStatus.returned },
        include: { items: true, payment: true },
      });
      expect(result.status).toBe(OrderStatus.returned);
    });
  });
});
