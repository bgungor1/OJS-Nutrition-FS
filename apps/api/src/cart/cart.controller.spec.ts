import { Test, TestingModule } from '@nestjs/testing';
import type { Request, Response } from 'express';
import { Role } from '@prisma/client';
import { AuthenticatedUser } from '../common/types/authenticated-user';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { RemoveFromCartDto } from './dto/remove-from-cart.dto';
import { GUEST_CART_COOKIE } from './cart-session.helper';
import { CartItemResponseDto } from './interfaces/cart-item-response.interface';

describe('CartController', () => {
  let controller: CartController;
  let mockCartService: {
    getCart: jest.Mock;
    addToCart: jest.Mock;
    removeFromCart: jest.Mock;
    clearCart: jest.Mock;
    mergeGuestCart: jest.Mock;
  };

  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  const mockUser: AuthenticatedUser = {
    id: 'user-1',
    email: 'test@example.com',
    role: Role.customer,
  };

  const mockCartItem: CartItemResponseDto = {
    id: 'cart-item-1',
    product_id: 'prod-1',
    product_variant_id: 'var-1',
    pieces: 2,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
    product: {
      id: 'prod-1',
      name: 'Whey Protein',
      slug: 'whey-protein',
      photo_src: 'media/test.jpg',
      photo: 'media/test.jpg',
    },
    variant: {
      id: 'var-1',
      aroma: 'Çikolata',
      size: { gram: 1000, pieces: 1, total_services: 33 },
      price: {
        total_price: 549,
        discounted_price: null,
        price_per_servings: 15.12,
        discount_percentage: null,
        profit: null,
      },
      photo_src: 'media/test.jpg',
      is_available: true,
      stock_quantity: 10,
    },
  };

  beforeEach(async () => {
    mockCartService = {
      getCart: jest.fn(),
      addToCart: jest.fn(),
      removeFromCart: jest.fn(),
      clearCart: jest.fn(),
      mergeGuestCart: jest.fn(),
    };

    mockReq = {
      cookies: {},
    };

    mockRes = {
      cookie: jest.fn(),
      clearCookie: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CartController],
      providers: [{ provide: CartService, useValue: mockCartService }],
    }).compile();

    controller = module.get<CartController>(CartController);
  });

  describe('getCart', () => {
    it('girişli kullanıcı için sepeti getirmeli', async () => {
      mockCartService.getCart.mockResolvedValue([mockCartItem]);

      const result = await controller.getCart(
        mockReq as Request,
        mockRes as Response,
        mockUser,
      );

      expect(mockCartService.getCart).toHaveBeenCalledWith({
        userId: 'user-1',
      });
      expect(result).toEqual([mockCartItem]);
    });

    it('misafir kullanıcı için sepeti getirmeli ve çerez çözümlemeli', async () => {
      mockReq.cookies = { [GUEST_CART_COOKIE]: 'guest-123' };
      mockCartService.getCart.mockResolvedValue([mockCartItem]);

      const result = await controller.getCart(
        mockReq as Request,
        mockRes as Response,
      );

      expect(mockCartService.getCart).toHaveBeenCalledWith({
        guestSessionId: 'guest-123',
      });
      expect(result).toEqual([mockCartItem]);
    });
  });

  describe('addToCart', () => {
    const dto: AddToCartDto = {
      product_id: 'prod-1',
      product_variant_id: 'var-1',
      pieces: 1,
    };

    it('servise doğru parametreleri iletip güncel sepeti dönmeli', async () => {
      mockCartService.addToCart.mockResolvedValue([mockCartItem]);

      const result = await controller.addToCart(
        dto,
        mockReq as Request,
        mockRes as Response,
        mockUser,
      );

      expect(mockCartService.addToCart).toHaveBeenCalledWith(
        { userId: 'user-1' },
        dto,
      );
      expect(result).toEqual([mockCartItem]);
    });
  });

  describe('removeFromCart', () => {
    const dto: RemoveFromCartDto = {
      product_id: 'prod-1',
      product_variant_id: 'var-1',
      pieces: 1,
    };

    it('servise doğru parametreleri iletip güncel sepeti dönmeli', async () => {
      mockCartService.removeFromCart.mockResolvedValue([]);

      const result = await controller.removeFromCart(
        dto,
        mockReq as Request,
        mockRes as Response,
        mockUser,
      );

      expect(mockCartService.removeFromCart).toHaveBeenCalledWith(
        { userId: 'user-1' },
        dto,
      );
      expect(result).toEqual([]);
    });
  });

  describe('clearCart', () => {
    it('servise temizleme isteği gönderip boş liste dönmeli', async () => {
      mockCartService.clearCart.mockResolvedValue([]);

      const result = await controller.clearCart(
        mockReq as Request,
        mockRes as Response,
        mockUser,
      );

      expect(mockCartService.clearCart).toHaveBeenCalledWith({
        userId: 'user-1',
      });
      expect(result).toEqual([]);
    });
  });

  describe('mergeGuestCart', () => {
    it('misafir sepetini kullanıcı sepetine aktarmalı ve misafir çerezini silmeli', async () => {
      mockReq.cookies = { [GUEST_CART_COOKIE]: 'guest-999' };
      mockCartService.mergeGuestCart.mockResolvedValue([mockCartItem]);

      const result = await controller.mergeGuestCart(
        mockReq as Request,
        mockRes as Response,
        mockUser,
      );

      expect(mockCartService.mergeGuestCart).toHaveBeenCalledWith(
        'user-1',
        'guest-999',
      );
      expect(mockRes.clearCookie).toHaveBeenCalledWith(
        GUEST_CART_COOKIE,
        expect.objectContaining({ path: '/' }),
      );
      expect(result).toEqual([mockCartItem]);
    });
  });
});
