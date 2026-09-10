import { BadRequestException } from '@nestjs/common';
import { OrderStatus, Prisma } from '@prisma/client';
import { OrderLifecycleHelper } from './order-lifecycle.helper';

describe('OrderLifecycleHelper', () => {
  describe('validateTransition', () => {
    it.each([
      [OrderStatus.pending, OrderStatus.processing],
      [OrderStatus.pending, OrderStatus.cancelled],
      [OrderStatus.processing, OrderStatus.shipped],
      [OrderStatus.processing, OrderStatus.cancelled],
      [OrderStatus.shipped, OrderStatus.delivered],
      [OrderStatus.delivered, OrderStatus.returned],
    ])(
      'geçerli durum geçişine (%s -> %s) izin vermelidir',
      (current, target) => {
        expect(() =>
          OrderLifecycleHelper.validateTransition(current, target),
        ).not.toThrow();
      },
    );

    it.each([
      [OrderStatus.pending, OrderStatus.delivered],
      [OrderStatus.pending, OrderStatus.returned],
      [OrderStatus.processing, OrderStatus.pending],
      [OrderStatus.shipped, OrderStatus.cancelled],
      [OrderStatus.shipped, OrderStatus.returned],
      [OrderStatus.delivered, OrderStatus.cancelled],
      [OrderStatus.delivered, OrderStatus.processing],
    ])(
      'geçersiz durum geçişinde (%s -> %s) BadRequestException fırlatmalıdır',
      (current, target) => {
        expect(() =>
          OrderLifecycleHelper.validateTransition(current, target),
        ).toThrow(BadRequestException);
      },
    );

    it('iptal edilmiş siparişin durumu değiştirilmek istendiğinde hata fırlatmalıdır', () => {
      expect(() =>
        OrderLifecycleHelper.validateTransition(
          OrderStatus.cancelled,
          OrderStatus.processing,
        ),
      ).toThrow(
        'İptal edilmiş veya iade edilmiş bir siparişin durumu değiştirilemez.',
      );
    });

    it('iade edilmiş siparişin durumu değiştirilmek istendiğinde hata fırlatmalıdır', () => {
      expect(() =>
        OrderLifecycleHelper.validateTransition(
          OrderStatus.returned,
          OrderStatus.delivered,
        ),
      ).toThrow(
        'İptal edilmiş veya iade edilmiş bir siparişin durumu değiştirilemez.',
      );
    });
  });

  describe('restockOrderItems', () => {
    it('her bir sipariş kaleminin stoğunu atomik olarak artırmalıdır', async () => {
      const updateMock = jest.fn().mockResolvedValue({});
      const mockTx = {
        productVariant: {
          update: updateMock,
        },
      } as unknown as Prisma.TransactionClient;

      const items = [
        { productVariantId: 'var-1', pieces: 2 },
        { productVariantId: 'var-2', pieces: 3 },
      ];

      await OrderLifecycleHelper.restockOrderItems(mockTx, items);

      expect(updateMock).toHaveBeenCalledTimes(2);
      expect(updateMock).toHaveBeenNthCalledWith(1, {
        where: { id: 'var-1' },
        data: { stockQuantity: { increment: 2 } },
      });
      expect(updateMock).toHaveBeenNthCalledWith(2, {
        where: { id: 'var-2' },
        data: { stockQuantity: { increment: 3 } },
      });
    });

    it('kalem listesi boş olduğunda güncelleme yapmamalıdır', async () => {
      const updateMock = jest.fn();
      const mockTx = {
        productVariant: {
          update: updateMock,
        },
      } as unknown as Prisma.TransactionClient;

      await OrderLifecycleHelper.restockOrderItems(mockTx, []);

      expect(updateMock).not.toHaveBeenCalled();
    });
  });
});
