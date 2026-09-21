import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { CartService } from './cart.service';
import {
  createMockGuestItem,
  createMockUserItem,
  mockProduct,
  mockVariant1,
  mockVariant2,
} from './test/cart.fixtures';

describe('CartService - mergeGuestCart', () => {
  let service: CartService;
  let mockPrisma: {
    cartItem: {
      findMany: jest.Mock;
    };
    $transaction: jest.Mock;
  };
  let mockTx: {
    cartItem: {
      findMany: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  beforeEach(async () => {
    mockTx = {
      cartItem: {
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    mockPrisma = {
      cartItem: {
        findMany: jest.fn(),
      },
      $transaction: jest.fn((callback: (tx: typeof mockTx) => unknown) =>
        callback(mockTx),
      ),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
  });

  it('should return user cart directly without transaction when guestSessionId is undefined or whitespace', async () => {
    mockPrisma.cartItem.findMany.mockResolvedValue([]);

    const result1 = await service.mergeGuestCart('user-1', undefined);
    const result2 = await service.mergeGuestCart('user-1', '   ');

    expect(mockPrisma.$transaction).not.toHaveBeenCalled();
    expect(result1).toEqual([]);
    expect(result2).toEqual([]);
  });

  it('should return empty array without running transaction when guest cart is empty', async () => {
    mockTx.cartItem.findMany.mockResolvedValueOnce([]);
    mockPrisma.cartItem.findMany.mockResolvedValue([]);

    const result = await service.mergeGuestCart('user-1', 'guest-123');

    expect(mockPrisma.$transaction).toHaveBeenCalled();
    expect(mockTx.cartItem.update).not.toHaveBeenCalled();
    expect(mockTx.cartItem.delete).not.toHaveBeenCalled();
    expect(result).toEqual([]);
  });

  it('should transfer non-conflicting variants directly to user (assign userId and set guestSessionId to null)', async () => {
    const guestItem = createMockGuestItem();

    mockTx.cartItem.findMany
      .mockResolvedValueOnce([guestItem])
      .mockResolvedValueOnce([]);

    mockPrisma.cartItem.findMany.mockResolvedValue([
      {
        ...guestItem,
        userId: 'user-1',
        guestSessionId: null,
        product: mockProduct,
        productVariant: mockVariant1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    const result = await service.mergeGuestCart('user-1', 'guest-123');

    expect(mockTx.cartItem.update).toHaveBeenCalledWith({
      where: { id: 'guest-item-1' },
      data: {
        userId: 'user-1',
        guestSessionId: null,
      },
    });
    expect(mockTx.cartItem.delete).not.toHaveBeenCalled();
    expect(result).toHaveLength(1);
    expect(result[0].pieces).toBe(2);
  });

  it('should increment user quantity and delete guest record for conflicting variants', async () => {
    const guestItem = createMockGuestItem({ pieces: 3 });
    const userItem = createMockUserItem({ pieces: 2 });

    mockTx.cartItem.findMany
      .mockResolvedValueOnce([guestItem])
      .mockResolvedValueOnce([userItem]);

    mockPrisma.cartItem.findMany.mockResolvedValue([
      {
        ...userItem,
        pieces: 5,
        product: mockProduct,
        productVariant: mockVariant1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    const result = await service.mergeGuestCart('user-1', 'guest-123');

    expect(mockTx.cartItem.update).toHaveBeenCalledWith({
      where: { id: 'user-item-1' },
      data: {
        pieces: { increment: 3 },
      },
    });
    expect(mockTx.cartItem.delete).toHaveBeenCalledWith({
      where: { id: 'guest-item-1' },
    });
    expect(result).toHaveLength(1);
    expect(result[0].pieces).toBe(5);
  });

  it('should correctly handle both conflicting and non-conflicting variants in mixed scenario', async () => {
    const guestItem1 = {
      id: 'guest-1',
      productVariantId: 'var-1',
      pieces: 2,
    };
    const guestItem2 = {
      id: 'guest-2',
      productVariantId: 'var-2',
      pieces: 4,
    };
    const userItem1 = {
      id: 'user-1',
      productVariantId: 'var-1',
      pieces: 1,
    };

    mockTx.cartItem.findMany
      .mockResolvedValueOnce([guestItem1, guestItem2])
      .mockResolvedValueOnce([userItem1]);

    mockPrisma.cartItem.findMany.mockResolvedValue([
      {
        id: 'user-1',
        productId: 'prod-1',
        productVariantId: 'var-1',
        pieces: 3,
        product: mockProduct,
        productVariant: mockVariant1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'guest-2',
        productId: 'prod-1',
        productVariantId: 'var-2',
        pieces: 4,
        product: mockProduct,
        productVariant: mockVariant2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    const result = await service.mergeGuestCart('user-1', 'guest-123');

    expect(mockTx.cartItem.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { pieces: { increment: 2 } },
    });
    expect(mockTx.cartItem.delete).toHaveBeenCalledWith({
      where: { id: 'guest-1' },
    });

    expect(mockTx.cartItem.update).toHaveBeenCalledWith({
      where: { id: 'guest-2' },
      data: { userId: 'user-1', guestSessionId: null },
    });

    expect(result).toHaveLength(2);
  });

  it('should propagate error upwards if error occurs during transaction', async () => {
    mockTx.cartItem.findMany.mockRejectedValue(
      new Error('DB Connection Timeout'),
    );

    await expect(service.mergeGuestCart('user-1', 'guest-123')).rejects.toThrow(
      'DB Connection Timeout',
    );
  });
});
