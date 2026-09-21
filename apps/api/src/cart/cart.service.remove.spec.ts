import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { CartService } from './cart.service';
import { RemoveFromCartDto } from './dto/remove-from-cart.dto';
import { mockCartItem } from './test/cart.fixtures';

describe('CartService - removeFromCart and clearCart', () => {
  let service: CartService;
  let mockPrisma: {
    cartItem: {
      findMany: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
      deleteMany: jest.Mock;
    };
  };

  const validDto: RemoveFromCartDto = {
    product_id: 'prod-1',
    product_variant_id: 'var-1',
    pieces: 1,
  };

  beforeEach(async () => {
    mockPrisma = {
      cartItem: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('removeFromCart', () => {
    it('should throw NotFoundException when product is not found in cart', async () => {
      mockPrisma.cartItem.findFirst.mockResolvedValue(null);

      await expect(
        service.removeFromCart({ userId: 'user-1' }, validDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should delete record when removed pieces is equal or greater than existing pieces', async () => {
      mockPrisma.cartItem.findFirst.mockResolvedValue({
        ...mockCartItem,
        pieces: 2,
      });
      mockPrisma.cartItem.delete.mockResolvedValue(mockCartItem);
      mockPrisma.cartItem.findMany.mockResolvedValue([]);

      const result = await service.removeFromCart(
        { userId: 'user-1' },
        { ...validDto, pieces: 2 },
      );

      expect(mockPrisma.cartItem.delete).toHaveBeenCalledWith({
        where: { id: mockCartItem.id },
      });
      expect(result).toEqual([]);
    });

    it('should decrement pieces when removed pieces is less than existing pieces', async () => {
      mockPrisma.cartItem.findFirst.mockResolvedValue({
        ...mockCartItem,
        pieces: 3,
      });
      mockPrisma.cartItem.update.mockResolvedValue({
        ...mockCartItem,
        pieces: 2,
      });
      mockPrisma.cartItem.findMany.mockResolvedValue([
        { ...mockCartItem, pieces: 2 },
      ]);

      const result = await service.removeFromCart(
        { userId: 'user-1' },
        { ...validDto, pieces: 1 },
      );

      expect(mockPrisma.cartItem.update).toHaveBeenCalledWith({
        where: { id: mockCartItem.id },
        data: {
          pieces: { decrement: 1 },
        },
      });
      expect(result[0].pieces).toBe(2);
    });
  });

  describe('clearCart', () => {
    it('should return empty array directly when session is empty', async () => {
      const result = await service.clearCart({});
      expect(result).toEqual([]);
      expect(mockPrisma.cartItem.deleteMany).not.toHaveBeenCalled();
    });

    it('should delete all cart items for authenticated user', async () => {
      mockPrisma.cartItem.deleteMany.mockResolvedValue({ count: 3 });

      const result = await service.clearCart({ userId: 'user-1' });

      expect(mockPrisma.cartItem.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
      });
      expect(result).toEqual([]);
    });

    it('should delete all cart items for guest session', async () => {
      mockPrisma.cartItem.deleteMany.mockResolvedValue({ count: 2 });

      const result = await service.clearCart({ guestSessionId: 'guest-1' });

      expect(mockPrisma.cartItem.deleteMany).toHaveBeenCalledWith({
        where: { guestSessionId: 'guest-1' },
      });
      expect(result).toEqual([]);
    });
  });
});
