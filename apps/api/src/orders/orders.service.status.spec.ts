import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { OrderStatus } from '@prisma/client';
import { AuditEvent, SecurityAuditService } from '../common/audit';
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

  let auditService: {
    info: jest.Mock;
    warn: jest.Mock;
    alarm: jest.Mock;
    record: jest.Mock;
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

    auditService = {
      info: jest.fn(),
      warn: jest.fn(),
      alarm: jest.fn(),
      record: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: PrismaService, useValue: prismaService },
        { provide: PaymentsService, useValue: {} },
        { provide: SecurityAuditService, useValue: auditService },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  describe('updateOrderStatus', () => {
    const orderId = MOCK_ORDER_ID;

    it('should throw NotFoundException if order not found', async () => {
      prismaService.order.findUnique.mockResolvedValue(null);

      await expect(
        service.updateOrderStatus(orderId, { status: OrderStatus.processing }),
      ).rejects.toThrow(NotFoundException);

      expect(prismaService.order.findUnique).toHaveBeenCalledWith({
        where: { id: orderId },
        include: { items: true, payment: true },
      });
    });

    it('should throw BadRequestException when attempting to update cancelled or returned order', async () => {
      prismaService.order.findUnique.mockResolvedValue({
        ...mockOrderDetailWithItems,
        status: OrderStatus.cancelled,
      });

      await expect(
        service.updateOrderStatus(orderId, { status: OrderStatus.processing }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException on invalid status transition', async () => {
      prismaService.order.findUnique.mockResolvedValue({
        ...mockOrderDetailWithItems,
        status: OrderStatus.pending,
      });

      await expect(
        service.updateOrderStatus(orderId, { status: OrderStatus.delivered }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should update order status without restocking on normal status transition (pending -> processing)', async () => {
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
      expect(auditService.info).toHaveBeenCalledWith(
        AuditEvent.ORDER_STATUS_CHANGED,
        expect.objectContaining({
          resourceId: mockOrderDetailWithItems.orderNo,
          details: {
            orderId,
            previousStatus: OrderStatus.pending,
            newStatus: OrderStatus.processing,
          },
        }),
      );
    });

    it('should atomically restock items and update status on transition to cancelled (processing -> cancelled)', async () => {
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
      expect(auditService.warn).toHaveBeenCalledWith(
        AuditEvent.ORDER_CANCELLED_RESTOCKED,
        expect.objectContaining({
          resourceId: mockOrderDetailWithItems.orderNo,
          details: {
            orderId,
            previousStatus: OrderStatus.processing,
            newStatus: OrderStatus.cancelled,
            restockedItems: 1,
          },
        }),
      );
    });

    it('should atomically restock items and update status on transition to returned (delivered -> returned)', async () => {
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
