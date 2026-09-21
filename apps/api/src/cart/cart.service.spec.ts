import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { CartSession } from './interfaces/cart-session.interface';
import {
  createMockPrismaService,
  mockCartItem,
  mockVariant,
} from './test/cart.fixtures';

describe('CartService', () => {
  let service: CartService;
  let mockPrisma: ReturnType<typeof createMockPrismaService>;

  beforeEach(async () => {
    mockPrisma = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
  });

  describe('getCart', () => {
    it('should return empty array directly when session is empty', async () => {
      const result = await service.getCart({});
      expect(result).toEqual([]);
      expect(mockPrisma.cartItem.findMany).not.toHaveBeenCalled();
    });

    it('should return cart items for authenticated user session', async () => {
      mockPrisma.cartItem.findMany.mockResolvedValue([mockCartItem]);

      const session: CartSession = { userId: 'user-1' };
      const result = await service.getCart(session);

      expect(mockPrisma.cartItem.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        include: { product: true, productVariant: true },
        orderBy: { createdAt: 'asc' },
      });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('cart-1');
      expect(result[0].pieces).toBe(2);
    });

    it('should return cart items for guest session', async () => {
      mockPrisma.cartItem.findMany.mockResolvedValue([
        { ...mockCartItem, userId: null, guestSessionId: 'guest-123' },
      ]);

      const session: CartSession = { guestSessionId: 'guest-123' };
      const result = await service.getCart(session);

      expect(mockPrisma.cartItem.findMany).toHaveBeenCalledWith({
        where: { guestSessionId: 'guest-123' },
        include: { product: true, productVariant: true },
        orderBy: { createdAt: 'asc' },
      });
      expect(result).toHaveLength(1);
    });
  });

  describe('addToCart', () => {
    const validDto: AddToCartDto = {
      product_id: 'prod-1',
      product_variant_id: 'var-1',
      pieces: 3,
    };

    it('should throw BadRequestException when session info is missing', async () => {
      await expect(service.addToCart({}, validDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException when product variant is not found', async () => {
      mockPrisma.productVariant.findUnique.mockResolvedValue(null);

      await expect(
        service.addToCart({ userId: 'user-1' }, validDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when variant product id does not match dto product id', async () => {
      mockPrisma.productVariant.findUnique.mockResolvedValue({
        ...mockVariant,
        productId: 'other-prod',
      });

      await expect(
        service.addToCart({ userId: 'user-1' }, validDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when product variant is unavailable', async () => {
      mockPrisma.productVariant.findUnique.mockResolvedValue({
        ...mockVariant,
        isAvailable: false,
      });

      await expect(
        service.addToCart({ userId: 'user-1' }, validDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when product variant stock is 0', async () => {
      mockPrisma.productVariant.findUnique.mockResolvedValue({
        ...mockVariant,
        stockQuantity: 0,
      });

      await expect(
        service.addToCart({ userId: 'user-1' }, validDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when requested pieces exceed stock for new item', async () => {
      mockPrisma.productVariant.findUnique.mockResolvedValue({
        ...mockVariant,
        stockQuantity: 5,
      });
      mockPrisma.cartItem.findFirst.mockResolvedValue(null);

      const highDto = { ...validDto, pieces: 6 };

      await expect(
        service.addToCart({ userId: 'user-1' }, highDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when updated quantity exceeds stock for existing item', async () => {
      mockPrisma.productVariant.findUnique.mockResolvedValue({
        ...mockVariant,
        stockQuantity: 5,
      });
      mockPrisma.cartItem.findFirst.mockResolvedValue({
        ...mockCartItem,
        pieces: 4,
      });

      const addDto = { ...validDto, pieces: 2 };

      await expect(
        service.addToCart({ userId: 'user-1' }, addDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should increment pieces of existing cart item and return updated cart', async () => {
      mockPrisma.productVariant.findUnique.mockResolvedValue(mockVariant);
      mockPrisma.cartItem.findFirst.mockResolvedValue({
        ...mockCartItem,
        pieces: 2,
      });
      mockPrisma.cartItem.update.mockResolvedValue({
        ...mockCartItem,
        pieces: 5,
      });
      mockPrisma.cartItem.findMany.mockResolvedValue([
        { ...mockCartItem, pieces: 5 },
      ]);

      const result = await service.addToCart(
        { userId: 'user-1' },
        { ...validDto, pieces: 3 },
      );

      expect(mockPrisma.cartItem.update).toHaveBeenCalledWith({
        where: { id: mockCartItem.id },
        data: { pieces: 5 },
      });
      expect(result[0].pieces).toBe(5);
    });

    it('should create new cart item when not in cart and return updated cart', async () => {
      mockPrisma.productVariant.findUnique.mockResolvedValue(mockVariant);
      mockPrisma.cartItem.findFirst.mockResolvedValue(null);
      mockPrisma.cartItem.create.mockResolvedValue(mockCartItem);
      mockPrisma.cartItem.findMany.mockResolvedValue([mockCartItem]);

      const result = await service.addToCart(
        { guestSessionId: 'guest-1' },
        validDto,
      );

      expect(mockPrisma.cartItem.create).toHaveBeenCalledWith({
        data: {
          userId: null,
          guestSessionId: 'guest-1',
          productId: 'prod-1',
          productVariantId: 'var-1',
          pieces: 3,
        },
      });
      expect(result).toHaveLength(1);
    });
  });
});
