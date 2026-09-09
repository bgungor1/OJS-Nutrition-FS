import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CartService } from './cart.service';

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

  const mockProduct = {
    id: 'prod-1',
    name: 'Whey Protein',
    slug: 'whey-protein',
  };

  const mockVariant1 = {
    id: 'var-1',
    productId: 'prod-1',
    gram: 1000,
    pieces: 1,
    totalServings: 33,
    aroma: 'Çikolata',
    totalPrice: new Prisma.Decimal(549),
    discountedPrice: null,
    pricePerServing: new Prisma.Decimal(15.12),
    photoSrc: 'media/test.jpg',
    isAvailable: true,
    stockQuantity: 10,
  };

  const mockVariant2 = {
    id: 'var-2',
    productId: 'prod-1',
    gram: 1000,
    pieces: 1,
    totalServings: 33,
    aroma: 'Çilek',
    totalPrice: new Prisma.Decimal(549),
    discountedPrice: null,
    pricePerServing: new Prisma.Decimal(15.12),
    photoSrc: 'media/test2.jpg',
    isAvailable: true,
    stockQuantity: 10,
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

  it('guestSessionId tanımlı değilse veya boşsa transaction çalıştırmadan kullanıcının mevcut sepetini dönmeli', async () => {
    mockPrisma.cartItem.findMany.mockResolvedValue([]);

    const result1 = await service.mergeGuestCart('user-1', undefined);
    const result2 = await service.mergeGuestCart('user-1', '   ');

    expect(mockPrisma.$transaction).not.toHaveBeenCalled();
    expect(result1).toEqual([]);
    expect(result2).toEqual([]);
  });

  it('misafir sepeti boşsa transaction içinde işlem yapmadan sepeti dönmeli', async () => {
    mockTx.cartItem.findMany.mockResolvedValueOnce([]); // guest items boş
    mockPrisma.cartItem.findMany.mockResolvedValue([]);

    const result = await service.mergeGuestCart('user-1', 'guest-123');

    expect(mockPrisma.$transaction).toHaveBeenCalled();
    expect(mockTx.cartItem.update).not.toHaveBeenCalled();
    expect(mockTx.cartItem.delete).not.toHaveBeenCalled();
    expect(result).toEqual([]);
  });

  it('çakışmayan varyantları doğrudan kullanıcıya devretmeli (userId atanmalı, guestSessionId null olmalı)', async () => {
    const guestItem = {
      id: 'guest-item-1',
      userId: null,
      guestSessionId: 'guest-123',
      productId: 'prod-1',
      productVariantId: 'var-1',
      pieces: 2,
    };

    mockTx.cartItem.findMany
      .mockResolvedValueOnce([guestItem]) // guest items
      .mockResolvedValueOnce([]); // user items (boş)

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

  it('çakışan varyantlarda kullanıcının adedini artırmalı ve misafir kaydını silmeli', async () => {
    const guestItem = {
      id: 'guest-item-1',
      userId: null,
      guestSessionId: 'guest-123',
      productId: 'prod-1',
      productVariantId: 'var-1',
      pieces: 3,
    };

    const userItem = {
      id: 'user-item-1',
      userId: 'user-1',
      guestSessionId: null,
      productId: 'prod-1',
      productVariantId: 'var-1',
      pieces: 2,
    };

    mockTx.cartItem.findMany
      .mockResolvedValueOnce([guestItem]) // guest items
      .mockResolvedValueOnce([userItem]); // user items (aynı varyant var)

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

  it('hem çakışan hem çakışmayan varyantları karma senaryoda doğru yönetmeli', async () => {
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

    // Çakışan var-1 için update & delete
    expect(mockTx.cartItem.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { pieces: { increment: 2 } },
    });
    expect(mockTx.cartItem.delete).toHaveBeenCalledWith({
      where: { id: 'guest-1' },
    });

    // Çakışmayan var-2 için devretme
    expect(mockTx.cartItem.update).toHaveBeenCalledWith({
      where: { id: 'guest-2' },
      data: { userId: 'user-1', guestSessionId: null },
    });

    expect(result).toHaveLength(2);
  });

  it('transaction sırasında hata fırlatılırsa hatayı yukarı iletmeli', async () => {
    mockTx.cartItem.findMany.mockRejectedValue(
      new Error('DB Connection Timeout'),
    );

    await expect(service.mergeGuestCart('user-1', 'guest-123')).rejects.toThrow(
      'DB Connection Timeout',
    );
  });
});
