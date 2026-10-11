import { BadRequestException, ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { OrderCheckoutHelper } from './order-checkout.helper';
import { OrderCartItem } from './order-checkout.types';

describe('OrderCheckoutHelper - Concurrency & Locking', () => {
  const itemA: OrderCartItem = {
    productId: 'prod-1',
    productVariantId: 'var-2',
    pieces: 2,
    product: { id: 'prod-1', name: 'Whey Protein' },
    productVariant: {
      id: 'var-2',
      aroma: 'Vanilya',
      totalPrice: new Prisma.Decimal(300),
      discountedPrice: null,
      photoSrc: 'vanilla.jpg',
    },
  };

  const itemB: OrderCartItem = {
    productId: 'prod-2',
    productVariantId: 'var-1',
    pieces: 1,
    product: { id: 'prod-2', name: 'Creatine' },
    productVariant: {
      id: 'var-1',
      aroma: 'Aromasız',
      totalPrice: new Prisma.Decimal(200),
      discountedPrice: null,
      photoSrc: 'creatine.jpg',
    },
  };

  describe('sortItemsForLocking', () => {
    it('should sort cart items strictly ascending by productVariantId for deadlock prevention', () => {
      const unsorted = [itemA, itemB];
      const sorted = OrderCheckoutHelper.sortItemsForLocking(unsorted);

      expect(sorted[0].productVariantId).toBe('var-1');
      expect(sorted[1].productVariantId).toBe('var-2');
    });

    it('should maintain order when already sorted', () => {
      const alreadySorted = [itemB, itemA];
      const result = OrderCheckoutHelper.sortItemsForLocking(alreadySorted);

      expect(result[0].productVariantId).toBe('var-1');
      expect(result[1].productVariantId).toBe('var-2');
    });
  });

  describe('verifyCartIntegrity', () => {
    it('should pass without error when cart items match expected items', async () => {
      const mockTx = {
        cartItem: {
          findMany: jest.fn().mockResolvedValue([
            { productVariantId: 'var-2', pieces: 2 },
            { productVariantId: 'var-1', pieces: 1 },
          ]),
        },
      } as unknown as Prisma.TransactionClient;

      await expect(
        OrderCheckoutHelper.verifyCartIntegrity(mockTx, 'user-1', [
          itemA,
          itemB,
        ]),
      ).resolves.toBeUndefined();
    });

    it('should throw BadRequestException when cart is empty inside transaction (double-checkout guard)', async () => {
      const mockTx = {
        cartItem: {
          findMany: jest.fn().mockResolvedValue([]),
        },
      } as unknown as Prisma.TransactionClient;

      await expect(
        OrderCheckoutHelper.verifyCartIntegrity(mockTx, 'user-1', [itemA]),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException when item quantity was modified concurrently', async () => {
      const mockTx = {
        cartItem: {
          findMany: jest
            .fn()
            .mockResolvedValue([{ productVariantId: 'var-2', pieces: 1 }]),
        },
      } as unknown as Prisma.TransactionClient;

      await expect(
        OrderCheckoutHelper.verifyCartIntegrity(mockTx, 'user-1', [itemA]),
      ).rejects.toThrow(ConflictException);
    });

    it('should safely do nothing when tx.cartItem.findMany is undefined (backwards compatibility)', async () => {
      const mockTx = {} as unknown as Prisma.TransactionClient;

      await expect(
        OrderCheckoutHelper.verifyCartIntegrity(mockTx, 'user-1', [itemA]),
      ).resolves.toBeUndefined();
    });
  });

  describe('acquireVariantPessimisticLocks', () => {
    it('should execute SELECT ... FOR UPDATE via $queryRaw and pass when stock is sufficient', async () => {
      const queryRawMock = jest.fn().mockResolvedValue([
        { id: 'var-1', stockQuantity: 10, isAvailable: true },
        { id: 'var-2', stockQuantity: 5, isAvailable: true },
      ]);

      const mockTx = {
        $queryRaw: queryRawMock,
      } as unknown as Prisma.TransactionClient;

      await expect(
        OrderCheckoutHelper.acquireVariantPessimisticLocks(mockTx, [
          itemA,
          itemB,
        ]),
      ).resolves.toBeUndefined();

      expect(queryRawMock).toHaveBeenCalledTimes(1);
    });

    it('should throw ConflictException when variant is not available', async () => {
      const queryRawMock = jest
        .fn()
        .mockResolvedValue([
          { id: 'var-2', stockQuantity: 10, isAvailable: false },
        ]);

      const mockTx = {
        $queryRaw: queryRawMock,
      } as unknown as Prisma.TransactionClient;

      await expect(
        OrderCheckoutHelper.acquireVariantPessimisticLocks(mockTx, [itemA]),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException when requested quantity exceeds locked stock', async () => {
      const queryRawMock = jest
        .fn()
        .mockResolvedValue([
          { id: 'var-2', stockQuantity: 1, isAvailable: true },
        ]);

      const mockTx = {
        $queryRaw: queryRawMock,
      } as unknown as Prisma.TransactionClient;

      await expect(
        OrderCheckoutHelper.acquireVariantPessimisticLocks(mockTx, [itemA]),
      ).rejects.toThrow(
        /Yetersiz stok: Whey Protein \(Vanilya\) için talep edilen adet \(2\) mevcut değil \(Kalan: 1\)/,
      );
    });

    it('should gracefully continue when $queryRaw is not available', async () => {
      const mockTx = {} as unknown as Prisma.TransactionClient;

      await expect(
        OrderCheckoutHelper.acquireVariantPessimisticLocks(mockTx, [itemA]),
      ).resolves.toBeUndefined();
    });
  });

  describe('decrementStockAtomic', () => {
    it('should decrement stock for all items in sorted order', async () => {
      const updateManyMock = jest
        .fn()
        .mockResolvedValueOnce({ count: 1 })
        .mockResolvedValueOnce({ count: 1 });

      const mockTx = {
        productVariant: { updateMany: updateManyMock },
      } as unknown as Prisma.TransactionClient;

      await OrderCheckoutHelper.decrementStockAtomic(mockTx, [itemA, itemB]);

      expect(updateManyMock).toHaveBeenCalledTimes(2);
      expect(updateManyMock).toHaveBeenNthCalledWith(1, {
        where: { id: 'var-1', stockQuantity: { gte: 1 }, isAvailable: true },
        data: { stockQuantity: { decrement: 1 } },
      });
      expect(updateManyMock).toHaveBeenNthCalledWith(2, {
        where: { id: 'var-2', stockQuantity: { gte: 2 }, isAvailable: true },
        data: { stockQuantity: { decrement: 2 } },
      });
    });

    it('should throw ConflictException when updateMany returns count 0', async () => {
      const updateManyMock = jest.fn().mockResolvedValue({ count: 0 });

      const mockTx = {
        productVariant: { updateMany: updateManyMock },
      } as unknown as Prisma.TransactionClient;

      await expect(
        OrderCheckoutHelper.decrementStockAtomic(mockTx, [itemA]),
      ).rejects.toThrow(ConflictException);
    });
  });
});
