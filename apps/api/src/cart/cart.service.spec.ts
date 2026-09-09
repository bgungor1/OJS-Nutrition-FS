import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { RemoveFromCartDto } from './dto/remove-from-cart.dto';
import { CartSession } from './interfaces/cart-session.interface';

describe('CartService', () => {
  let service: CartService;
  let mockPrisma: {
    cartItem: {
      findMany: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
      deleteMany: jest.Mock;
    };
    productVariant: {
      findUnique: jest.Mock;
    };
  };

  const mockProduct = {
    id: 'prod-1',
    name: 'Whey Protein',
    slug: 'whey-protein',
  };

  const mockVariant = {
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

  const mockCartItem = {
    id: 'cart-1',
    userId: 'user-1',
    guestSessionId: null,
    productId: 'prod-1',
    productVariantId: 'var-1',
    pieces: 2,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    product: mockProduct,
    productVariant: mockVariant,
  };

  beforeEach(async () => {
    mockPrisma = {
      cartItem: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn(),
      },
      productVariant: {
        findUnique: jest.fn(),
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

  describe('getCart', () => {
    it('oturum bilgisi boşsa doğrudan boş dizi dönmeli', async () => {
      const result = await service.getCart({});
      expect(result).toEqual([]);
      expect(mockPrisma.cartItem.findMany).not.toHaveBeenCalled();
    });

    it('kullanıcı oturumu için sepet kalemlerini getirmeli', async () => {
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

    it('misafir oturumu için sepet kalemlerini getirmeli', async () => {
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

    it('oturum bilgisi eksikse BadRequestException fırlatmalı', async () => {
      await expect(service.addToCart({}, validDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('varyant bulunamazsa NotFoundException fırlatmalı', async () => {
      mockPrisma.productVariant.findUnique.mockResolvedValue(null);

      await expect(
        service.addToCart({ userId: 'user-1' }, validDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('varyantın ürün IDsi ile DTOdaki ürün ID eşleşmezse NotFoundException fırlatmalı', async () => {
      mockPrisma.productVariant.findUnique.mockResolvedValue({
        ...mockVariant,
        productId: 'other-prod',
      });

      await expect(
        service.addToCart({ userId: 'user-1' }, validDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('ürün satışa kapalıysa (isAvailable=false) BadRequestException fırlatmalı', async () => {
      mockPrisma.productVariant.findUnique.mockResolvedValue({
        ...mockVariant,
        isAvailable: false,
      });

      await expect(
        service.addToCart({ userId: 'user-1' }, validDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('ürün stoğu 0 ise BadRequestException fırlatmalı', async () => {
      mockPrisma.productVariant.findUnique.mockResolvedValue({
        ...mockVariant,
        stockQuantity: 0,
      });

      await expect(
        service.addToCart({ userId: 'user-1' }, validDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('yeni kalem eklenirken talep edilen adet stoğu aşıyorsa BadRequestException fırlatmalı', async () => {
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

    it('sepette zaten olan ürünün yeni toplam adedi stoğu aşıyorsa BadRequestException fırlatmalı', async () => {
      mockPrisma.productVariant.findUnique.mockResolvedValue({
        ...mockVariant,
        stockQuantity: 5,
      });
      mockPrisma.cartItem.findFirst.mockResolvedValue({
        ...mockCartItem,
        pieces: 4,
      });

      const addDto = { ...validDto, pieces: 2 }; // 4 + 2 = 6 > 5

      await expect(
        service.addToCart({ userId: 'user-1' }, addDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('sepette zaten olan kalemin adedini artırmalı ve güncel sepeti dönmeli', async () => {
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

    it('sepette olmayan kalemi oluşturmalı ve güncel sepeti dönmeli', async () => {
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

  describe('removeFromCart', () => {
    const validDto: RemoveFromCartDto = {
      product_id: 'prod-1',
      product_variant_id: 'var-1',
      pieces: 1,
    };

    it('ürün sepette bulunamazsa NotFoundException fırlatmalı', async () => {
      mockPrisma.cartItem.findFirst.mockResolvedValue(null);

      await expect(
        service.removeFromCart({ userId: 'user-1' }, validDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('çıkarılacak adet mevcut adede eşit veya fazlaysa kaydı silmeli', async () => {
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

    it('çıkarılacak adet mevcut adetten azsa adedi eksiltmeli', async () => {
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
    it('oturum boşsa doğrudan boş dizi dönmeli', async () => {
      const result = await service.clearCart({});
      expect(result).toEqual([]);
      expect(mockPrisma.cartItem.deleteMany).not.toHaveBeenCalled();
    });

    it('kullanıcı sepetindeki tüm kalemleri silmeli', async () => {
      mockPrisma.cartItem.deleteMany.mockResolvedValue({ count: 3 });

      const result = await service.clearCart({ userId: 'user-1' });

      expect(mockPrisma.cartItem.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
      });
      expect(result).toEqual([]);
    });

    it('misafir sepetindeki tüm kalemleri silmeli', async () => {
      mockPrisma.cartItem.deleteMany.mockResolvedValue({ count: 2 });

      const result = await service.clearCart({ guestSessionId: 'guest-1' });

      expect(mockPrisma.cartItem.deleteMany).toHaveBeenCalledWith({
        where: { guestSessionId: 'guest-1' },
      });
      expect(result).toEqual([]);
    });
  });
});
