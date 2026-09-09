import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma, Role } from '@prisma/client';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { TokenService } from '../src/auth/token.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { GUEST_CART_COOKIE } from '../src/cart/cart-session.helper';
import { CartItemResponseDto } from '../src/cart/interfaces/cart-item-response.interface';

interface ApiSuccess<T> {
  status: 'success';
  data: T;
}

interface ApiError {
  status: 'error';
  message?: string;
  reason?: Record<string, string[]>;
}

describe('Cart E2E Test Suite (/api/v1/cart)', () => {
  let app: INestApplication;
  let server: Parameters<typeof request>[0];
  let tokenA: string;
  let tokenB: string;

  let mockPrisma: {
    user: { findUnique: jest.Mock };
    refreshToken: { create: jest.Mock };
    productVariant: { findUnique: jest.Mock };
    cartItem: {
      findMany: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
      deleteMany: jest.Mock;
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

  const mockUserA = {
    id: 'user-uuid-1',
    email: 'usera@example.com',
    role: Role.customer,
  };

  const mockUserB = {
    id: 'user-uuid-2',
    email: 'userb@example.com',
    role: Role.customer,
  };

  const mockProductId = 'a0000000-0000-4000-8000-000000000001';
  const mockVariantId = 'b0000000-0000-4000-8000-000000000002';
  const mockUnavailableVariantId = 'c0000000-0000-4000-8000-000000000003';
  const mockCartItemId = 'd0000000-0000-4000-8000-000000000004';
  const nonExistentProductId = 'e0000000-0000-4000-8000-000000000005';
  const nonExistentVariantId = 'f0000000-0000-4000-8000-000000000006';

  const mockProduct = {
    id: mockProductId,
    name: 'Whey Protein',
    slug: 'whey-protein',
    shortExplanation: 'Protein tozu',
    usage: 'Günde 1 ölçek',
    features: 'BCAA',
    description: 'Açıklama',
    nutritionalContent: {},
    tags: ['protein'],
    mainCategoryId: 'cat-1',
    subCategoryId: 'subcat-1',
    isBestSeller: true,
    bestSellerRank: 1,
    commentCount: 10,
    averageStar: 4.9,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  };

  const mockVariant = {
    id: mockVariantId,
    productId: mockProduct.id,
    gram: 1000,
    pieces: 1,
    totalServings: 33,
    aroma: 'Çikolata',
    totalPrice: new Prisma.Decimal(549),
    discountedPrice: new Prisma.Decimal(499),
    pricePerServing: new Prisma.Decimal(15.12),
    photoSrc: 'media/products/whey-cikolata.jpg',
    isAvailable: true,
    stockQuantity: 10,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    product: mockProduct,
  };

  const mockUnavailableVariant = {
    ...mockVariant,
    id: mockUnavailableVariantId,
    aroma: 'Çilek',
    isAvailable: false,
    stockQuantity: 0,
  };

  const makeDbCartItem = (overrides: Record<string, unknown> = {}) => ({
    id: mockCartItemId,
    userId: null,
    guestSessionId: 'guest-session-123',
    productId: mockProduct.id,
    productVariantId: mockVariant.id,
    pieces: 2,
    createdAt: new Date('2026-02-01T12:00:00.000Z'),
    updatedAt: new Date('2026-02-01T12:00:00.000Z'),
    product: mockProduct,
    productVariant: mockVariant,
    ...overrides,
  });

  beforeAll(async () => {
    mockTx = {
      cartItem: {
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    mockPrisma = {
      user: { findUnique: jest.fn() },
      refreshToken: { create: jest.fn().mockResolvedValue({ id: 'rt-id' }) },
      productVariant: { findUnique: jest.fn() },
      cartItem: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn(),
      },
      $transaction: jest.fn((callback: (tx: typeof mockTx) => unknown) =>
        callback(mockTx),
      ),
    };

    const fixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .compile();

    app = fixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );

    await app.init();
    server = app.getHttpServer() as Parameters<typeof request>[0];

    const tokenService = fixture.get<TokenService>(TokenService);
    tokenA = (
      await tokenService.generateTokens(
        mockUserA.id,
        mockUserA.email,
        mockUserA.role,
      )
    ).access;
    tokenB = (
      await tokenService.generateTokens(
        mockUserB.id,
        mockUserB.email,
        mockUserB.role,
      )
    ).access;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma.user.findUnique.mockImplementation(
      ({ where }: { where: { id?: string } }) => {
        if (where.id === mockUserA.id) return Promise.resolve(mockUserA);
        if (where.id === mockUserB.id) return Promise.resolve(mockUserB);
        return Promise.resolve(null);
      },
    );
  });

  describe('1. Misafir Sepeti ve Çerez Yaşam Döngüsü', () => {
    it('çerezsiz GET /api/v1/cart isteğinde misafire Set-Cookie ile guest_cart_id vermeli ve boş sepet dönmeli', async () => {
      mockPrisma.cartItem.findMany.mockResolvedValue([]);

      const res = await request(server).get('/api/v1/cart').expect(200);

      const body = res.body as ApiSuccess<CartItemResponseDto[]>;
      expect(body.status).toBe('success');
      expect(body.data).toEqual([]);

      const setCookie = res.headers['set-cookie'] as unknown as string[];
      expect(setCookie).toBeDefined();
      expect(
        setCookie.some((cookie) => cookie.includes(`${GUEST_CART_COOKIE}=`)),
      ).toBe(true);
      expect(setCookie.some((cookie) => cookie.includes('HttpOnly'))).toBe(
        true,
      );
    });

    it('var olan guest_cart_id çereziyle GET çağrıldığında mevcut çerezi koruyarak sepeti listelemeli', async () => {
      const dbItem = makeDbCartItem();
      mockPrisma.cartItem.findMany.mockResolvedValue([dbItem]);

      const res = await request(server)
        .get('/api/v1/cart')
        .set('Cookie', [`${GUEST_CART_COOKIE}=existing-guest-uuid`])
        .expect(200);

      const body = res.body as ApiSuccess<CartItemResponseDto[]>;
      expect(body.status).toBe('success');
      expect(body.data).toHaveLength(1);
      expect(body.data[0].product.name).toBe('Whey Protein');
      expect(body.data[0].variant.aroma).toBe('Çikolata');
      expect(body.data[0].variant.price.profit).toBe(50);
      expect(body.data[0].product.photo).toBe(
        'media/products/whey-cikolata.jpg',
      );
    });
  });

  describe('2. Sepete Ekleme ve Stok Validasyonları (POST /api/v1/cart)', () => {
    it('geçerli misafir isteğinde ürünü sepete eklemeli ve zenginleştirilmiş sepeti dönmeli', async () => {
      mockPrisma.productVariant.findUnique.mockResolvedValue(mockVariant);
      mockPrisma.cartItem.findFirst.mockResolvedValue(null);
      mockPrisma.cartItem.create.mockResolvedValue(makeDbCartItem());
      mockPrisma.cartItem.findMany.mockResolvedValue([makeDbCartItem()]);

      const res = await request(server)
        .post('/api/v1/cart')
        .set('Cookie', [`${GUEST_CART_COOKIE}=guest-uuid-1`])
        .send({
          product_id: mockProduct.id,
          product_variant_id: mockVariant.id,
          pieces: 2,
        })
        .expect(200);

      const body = res.body as ApiSuccess<CartItemResponseDto[]>;
      expect(body.status).toBe('success');
      expect(body.data).toHaveLength(1);
      expect(mockPrisma.cartItem.create).toHaveBeenCalled();
    });

    it('talep edilen adet mevcut stoğu aşıyorsa 400 Bad Request fırlatmalı', async () => {
      mockPrisma.productVariant.findUnique.mockResolvedValue(mockVariant); // stok = 10
      mockPrisma.cartItem.findFirst.mockResolvedValue(null);

      const res = await request(server)
        .post('/api/v1/cart')
        .set('Cookie', [`${GUEST_CART_COOKIE}=guest-uuid-1`])
        .send({
          product_id: mockProduct.id,
          product_variant_id: mockVariant.id,
          pieces: 15, // 15 > 10
        })
        .expect(400);

      const body = res.body as ApiError;
      expect(body.status).toBe('error');
    });

    it('satışa kapalı veya stoğu tükenmiş ürün eklendiğinde 400 Bad Request fırlatmalı', async () => {
      mockPrisma.productVariant.findUnique.mockResolvedValue(
        mockUnavailableVariant,
      );

      const res = await request(server)
        .post('/api/v1/cart')
        .set('Cookie', [`${GUEST_CART_COOKIE}=guest-uuid-1`])
        .send({
          product_id: mockProduct.id,
          product_variant_id: mockUnavailableVariant.id,
          pieces: 1,
        })
        .expect(400);

      const body = res.body as ApiError;
      expect(body.status).toBe('error');
    });

    it('olmayan ürün veya varyant IDsi verildiğinde 404 Not Found fırlatmalı', async () => {
      mockPrisma.productVariant.findUnique.mockResolvedValue(null);

      const res = await request(server)
        .post('/api/v1/cart')
        .set('Cookie', [`${GUEST_CART_COOKIE}=guest-uuid-1`])
        .send({
          product_id: nonExistentProductId,
          product_variant_id: nonExistentVariantId,
          pieces: 1,
        })
        .expect(404);

      const body = res.body as ApiError;
      expect(body.status).toBe('error');
    });
  });

  describe('3. Sepetten Eksiltme ve Temizleme (DELETE /api/v1/cart)', () => {
    it('sepetteki ürünün adedini eksiltmeli', async () => {
      const existingItem = makeDbCartItem({ pieces: 3 });
      mockPrisma.cartItem.findFirst.mockResolvedValue(existingItem);
      mockPrisma.cartItem.update.mockResolvedValue({
        ...existingItem,
        pieces: 2,
      });
      mockPrisma.cartItem.findMany.mockResolvedValue([
        makeDbCartItem({ pieces: 2 }),
      ]);

      const res = await request(server)
        .delete('/api/v1/cart')
        .set('Cookie', [`${GUEST_CART_COOKIE}=guest-uuid-1`])
        .send({
          product_id: mockProduct.id,
          product_variant_id: mockVariant.id,
          pieces: 1,
        })
        .expect(200);

      const body = res.body as ApiSuccess<CartItemResponseDto[]>;
      expect(body.status).toBe('success');
      expect(body.data[0].pieces).toBe(2);
    });

    it('DELETE /api/v1/cart/clear ile tüm sepeti boşaltmalı', async () => {
      mockPrisma.cartItem.deleteMany.mockResolvedValue({ count: 2 });

      const res = await request(server)
        .delete('/api/v1/cart/clear')
        .set('Cookie', [`${GUEST_CART_COOKIE}=guest-uuid-1`])
        .expect(200);

      const body = res.body as ApiSuccess<CartItemResponseDto[]>;
      expect(body.status).toBe('success');
      expect(body.data).toEqual([]);
      expect(mockPrisma.cartItem.deleteMany).toHaveBeenCalled();
    });
  });

  describe('4. Kullanıcı Girişi ve Sepet Birleştirme (POST /api/v1/cart/merge)', () => {
    it('Bearer token olmadan merge çağrıldığında 401 Unauthorized dönmeli', async () => {
      await request(server).post('/api/v1/cart/merge').expect(401);
    });

    it('giriş yapmış kullanıcıda misafir sepetini kullanıcıya aktarmalı ve misafir çerezini temizlemeli', async () => {
      const guestItem = makeDbCartItem({
        id: 'guest-item-1',
        guestSessionId: 'guest-session-123',
        userId: null,
      });

      mockTx.cartItem.findMany
        .mockResolvedValueOnce([guestItem]) // guest items
        .mockResolvedValueOnce([]); // user items (boş)

      mockPrisma.cartItem.findMany.mockResolvedValue([
        {
          ...guestItem,
          userId: mockUserA.id,
          guestSessionId: null,
        },
      ]);

      const res = await request(server)
        .post('/api/v1/cart/merge')
        .set('Authorization', `Bearer ${tokenA}`)
        .set('Cookie', [`${GUEST_CART_COOKIE}=guest-session-123`])
        .expect(200);

      const body = res.body as ApiSuccess<CartItemResponseDto[]>;
      expect(body.status).toBe('success');
      expect(body.data).toHaveLength(1);

      // Çerezin silindiği teyit edilmeli (Set-Cookie içinde max-age=0 veya expired date)
      const setCookie = res.headers['set-cookie'] as unknown as string[];
      expect(setCookie).toBeDefined();
      expect(
        setCookie.some(
          (c) =>
            c.includes(`${GUEST_CART_COOKIE}=;`) ||
            c.includes('Max-Age=0') ||
            c.includes('Expires='),
        ),
      ).toBe(true);
    });
  });

  describe('5. Kullanıcılar Arası Sepet İzolasyonu', () => {
    it('Kullanıcı B, Kullanıcı A nın sepetindeki ürünleri görmemeli', async () => {
      mockPrisma.cartItem.findMany.mockImplementation(
        ({ where }: { where: { userId?: string } }) => {
          if (where.userId === mockUserA.id) {
            return Promise.resolve([makeDbCartItem({ userId: mockUserA.id })]);
          }
          return Promise.resolve([]);
        },
      );

      // Kullanıcı B kendi sepetini çeker
      const resB = await request(server)
        .get('/api/v1/cart')
        .set('Authorization', `Bearer ${tokenB}`)
        .expect(200);

      const bodyB = resB.body as ApiSuccess<CartItemResponseDto[]>;
      expect(bodyB.status).toBe('success');
      expect(bodyB.data).toEqual([]); // Kullanıcı B'nin sepeti boş

      // Kullanıcı A kendi sepetini çeker
      const resA = await request(server)
        .get('/api/v1/cart')
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(200);

      const bodyA = resA.body as ApiSuccess<CartItemResponseDto[]>;
      expect(bodyA.status).toBe('success');
      expect(bodyA.data).toHaveLength(1); // Kullanıcı A'nın sepeti dolu
    });
  });
});
