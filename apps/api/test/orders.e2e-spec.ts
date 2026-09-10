import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { OrderStatus, Role } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import cookieParser from 'cookie-parser';
import request, { Response as SupertestResponse } from 'supertest';
import { AppModule } from '../src/app.module';
import { TokenService } from '../src/auth/token.service';
import { PrismaService } from '../src/prisma/prisma.service';
import {
  OrderDetailResponse,
  PaginatedOrdersResponse,
  ShipmentFeeResponse,
} from '../src/orders/interfaces/order-response.interface';
import { PaymentSettingsResponse } from '../src/payments/interfaces/payment-process.interface';

interface ApiSuccessResponse<T> {
  status: 'success';
  data: T;
}

interface ApiErrorResponse {
  status: 'error';
  message?: string;
}

describe('Orders E2E Test Suite (/api/v1/orders)', () => {
  let app: INestApplication;
  let server: Parameters<typeof request>[0];
  let tokenA: string;
  let tokenB: string;
  let tokenAdmin: string;

  const mockUserA = {
    id: 'user-uuid-1',
    email: 'usera@example.com',
    role: Role.customer,
    firstName: 'Ahmet',
    lastName: 'Yılmaz',
    phoneNumber: '05551112233',
  };

  const mockUserB = {
    id: 'user-uuid-2',
    email: 'userb@example.com',
    role: Role.customer,
    firstName: 'Mehmet',
    lastName: 'Demir',
    phoneNumber: '05552223344',
  };

  const mockAdmin = {
    id: 'admin-uuid-1',
    email: 'admin@example.com',
    role: Role.admin,
    firstName: 'Admin',
    lastName: 'Superuser',
    phoneNumber: '05559998877',
  };

  const mockAddressA = {
    id: 'a0000000-0000-4000-8000-000000000001',
    userId: mockUserA.id,
    title: 'Ev',
    firstName: 'Ahmet',
    lastName: 'Yılmaz',
    phoneNumber: '05551112233',
    fullAddress: 'Bağdat Cad. No: 10',
    country: { name: 'Türkiye' },
    region: { name: 'İstanbul' },
    subregion: { name: 'Kadıköy' },
  };

  const mockCartItemA = {
    id: 'cart-item-1',
    userId: mockUserA.id,
    productId: 'prod-1',
    productVariantId: 'var-1',
    pieces: 2,
    product: {
      id: 'prod-1',
      name: 'Whey Protein',
    },
    productVariant: {
      id: 'var-1',
      aroma: 'Çikolata',
      totalPrice: new Decimal(200),
      discountedPrice: null,
      photoSrc: 'media/products/whey.jpg',
      stockQuantity: 10,
      isAvailable: true,
    },
  };

  const mockOrderA = {
    id: 'ord-uuid-1',
    orderNo: 'ORD-20260910-A1B2C3',
    userId: mockUserA.id,
    status: OrderStatus.pending,
    totalPrice: new Decimal(449.9),
    shippingFee: new Decimal(49.9),
    addressSnapshot: {
      title: 'Ev',
      firstName: 'Ahmet',
      lastName: 'Yılmaz',
      phoneNumber: '05551112233',
      country: 'Türkiye',
      region: 'İstanbul',
      subregion: 'Kadıköy',
      fullAddress: 'Bağdat Cad. No: 10',
    },
    createdAt: new Date('2026-09-10T12:00:00.000Z'),
    updatedAt: new Date('2026-09-10T12:00:00.000Z'),
    items: [
      {
        id: 'item-1',
        orderId: 'ord-uuid-1',
        productId: 'prod-1',
        productVariantId: 'var-1',
        productName: 'Whey Protein',
        variantName: 'Çikolata',
        pieces: 2,
        unitPrice: new Decimal(200),
        totalPrice: new Decimal(400),
        photo: 'media/products/whey.jpg',
      },
    ],
    payment: {
      id: 'pay-1',
      orderId: 'ord-uuid-1',
      provider: 'mock',
      providerRef: 'mock_pay_123',
      cardType: 'VISA',
      last4: '4242',
      status: 'succeeded',
      createdAt: new Date('2026-09-10T12:00:00.000Z'),
    },
  };

  let mockPrisma: {
    $connect: jest.Mock;
    $disconnect: jest.Mock;
    user: { findUnique: jest.Mock };
    refreshToken: { create: jest.Mock };
    address: { findFirst: jest.Mock };
    cartItem: { findMany: jest.Mock; deleteMany: jest.Mock };
    productVariant: { updateMany: jest.Mock; update: jest.Mock };
    order: {
      findMany: jest.Mock;
      findFirst: jest.Mock;
      findUnique: jest.Mock;
      count: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
    $transaction: jest.Mock;
  };

  let mockTx: {
    productVariant: { updateMany: jest.Mock; update: jest.Mock };
    order: { create: jest.Mock; update: jest.Mock };
    cartItem: { deleteMany: jest.Mock };
  };

  beforeAll(async () => {
    mockTx = {
      productVariant: {
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        update: jest.fn().mockResolvedValue({}),
      },
      order: {
        create: jest.fn().mockResolvedValue(mockOrderA),
        update: jest.fn().mockResolvedValue(mockOrderA),
      },
      cartItem: {
        deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
    };

    mockPrisma = {
      $connect: jest.fn(),
      $disconnect: jest.fn(),
      user: jest.fn().mockImplementation((args: { where: { id: string } }) => {
        if (args.where.id === mockUserA.id) return Promise.resolve(mockUserA);
        if (args.where.id === mockUserB.id) return Promise.resolve(mockUserB);
        if (args.where.id === mockAdmin.id) return Promise.resolve(mockAdmin);
        return Promise.resolve(null);
      }) as unknown as { findUnique: jest.Mock },
      refreshToken: {
        create: jest.fn().mockResolvedValue({ id: 'rt-id' }),
      },
      address: {
        findFirst: jest.fn(),
      },
      cartItem: {
        findMany: jest.fn(),
        deleteMany: jest.fn(),
      },
      productVariant: {
        updateMany: jest.fn(),
        update: jest.fn(),
      },
      order: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      $transaction: jest.fn((cb: (tx: typeof mockTx) => Promise<unknown>) =>
        cb(mockTx),
      ),
    };
    mockPrisma.user = {
      findUnique: jest
        .fn()
        .mockImplementation((args: { where: { id: string } }) => {
          if (args.where.id === mockUserA.id) return Promise.resolve(mockUserA);
          if (args.where.id === mockUserB.id) return Promise.resolve(mockUserB);
          if (args.where.id === mockAdmin.id) return Promise.resolve(mockAdmin);
          return Promise.resolve(null);
        }),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .compile();

    app = moduleFixture.createNestApplication();
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

    const tokenService = app.get<TokenService>(TokenService);
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
    tokenAdmin = (
      await tokenService.generateTokens(
        mockAdmin.id,
        mockAdmin.email,
        mockAdmin.role,
      )
    ).access;
  });

  afterAll(async () => {
    await app.close();
  });

  const authA = () => ({
    get: (url: string) =>
      request(server).get(url).set('Authorization', `Bearer ${tokenA}`),
    post: (url: string) =>
      request(server).post(url).set('Authorization', `Bearer ${tokenA}`),
  });

  const authB = () => ({
    get: (url: string) =>
      request(server).get(url).set('Authorization', `Bearer ${tokenB}`),
  });

  const authAdmin = () => ({
    put: (url: string) =>
      request(server).put(url).set('Authorization', `Bearer ${tokenAdmin}`),
  });

  describe('GET /api/v1/orders/payment-settings', () => {
    it('giriş yapmış kullanıcıya ödeme ayarlarını 200 ve ResponseEnvelope ile dönmelidir', async () => {
      const res: SupertestResponse = await authA().get(
        '/api/v1/orders/payment-settings',
      );

      expect(res.status).toBe(200);
      const body = res.body as ApiSuccessResponse<PaymentSettingsResponse>;
      expect(body.status).toBe('success');
      expect(body.data.currency).toBe('TRY');
      expect(body.data.card_types).toBeInstanceOf(Array);
      expect(body.data.payment_types).toBeInstanceOf(Array);
    });
  });

  describe('GET /api/v1/orders/calculate-shipment-fee', () => {
    it('sepet 500 TL altındayken standart kargo ücreti hesaplamalıdır', async () => {
      mockPrisma.address.findFirst.mockResolvedValue(mockAddressA);
      mockPrisma.cartItem.findMany.mockResolvedValue([mockCartItemA]); // 2 * 200 = 400 < 500

      const res: SupertestResponse = await authA().get(
        `/api/v1/orders/calculate-shipment-fee?address_id=${mockAddressA.id}`,
      );

      expect(res.status).toBe(200);
      const body = res.body as ApiSuccessResponse<ShipmentFeeResponse>;
      expect(body.status).toBe('success');
      expect(body.data.fee).toBe(49.9);
      expect(body.data.is_free).toBe(false);
      expect(body.data.free_shipping_threshold).toBe(500);
    });

    it('adres bulunamazsa 404 Not Found dönmelidir', async () => {
      mockPrisma.address.findFirst.mockResolvedValue(null);

      const res: SupertestResponse = await authA().get(
        `/api/v1/orders/calculate-shipment-fee?address_id=${mockAddressA.id}`,
      );

      expect(res.status).toBe(404);
      const body = res.body as ApiErrorResponse;
      expect(body.status).toBe('error');
    });
  });

  describe('GET /api/v1/orders', () => {
    it('kullanıcının sipariş geçmişini sayfalı ve 200 ile dönmelidir', async () => {
      mockPrisma.order.findMany.mockResolvedValue([mockOrderA]);
      mockPrisma.order.count.mockResolvedValue(1);

      const res: SupertestResponse = await authA().get(
        '/api/v1/orders?limit=10&offset=0',
      );

      expect(res.status).toBe(200);
      const body = res.body as ApiSuccessResponse<PaginatedOrdersResponse>;
      expect(body.status).toBe('success');
      expect(body.data.count).toBe(1);
      expect(body.data.results).toHaveLength(1);
      expect(body.data.results[0].order_no).toBe(mockOrderA.orderNo);
    });
  });

  describe('GET /api/v1/orders/:orderId', () => {
    it('kullanıcı kendi siparişini sorguladığında 200 ile detayını alabilmelidir', async () => {
      mockPrisma.order.findFirst.mockResolvedValue(mockOrderA);

      const res: SupertestResponse = await authA().get(
        `/api/v1/orders/${mockOrderA.id}`,
      );

      expect(res.status).toBe(200);
      const body = res.body as ApiSuccessResponse<OrderDetailResponse>;
      expect(body.status).toBe('success');
      expect(body.data.id).toBe(mockOrderA.id);
      expect(body.data.items).toHaveLength(1);
      expect(body.data.cart_detail).toHaveLength(1);
    });

    it('IDOR Koruması: Başka kullanıcının sipariş ID si sorgulandığında 404 dönmelidir', async () => {
      // User B, User A'nın siparişini sorguluyor
      mockPrisma.order.findFirst.mockResolvedValue(null);

      const res: SupertestResponse = await authB().get(
        `/api/v1/orders/${mockOrderA.id}`,
      );

      expect(res.status).toBe(404);
      const body = res.body as ApiErrorResponse;
      expect(body.status).toBe('error');
    });
  });

  describe('POST /api/v1/orders/complete-shopping', () => {
    const validDto = {
      address_id: mockAddressA.id,
      payment_type: 'credit_card',
      payment_token: 'tok_sandbox_test',
    };

    it('başarılı checkout akışında 201 Created dönmelidir', async () => {
      mockPrisma.address.findFirst.mockResolvedValue(mockAddressA);
      mockPrisma.cartItem.findMany.mockResolvedValue([mockCartItemA]);
      mockTx.productVariant.updateMany.mockResolvedValue({ count: 1 });
      mockTx.order.create.mockResolvedValue(mockOrderA);
      mockTx.cartItem.deleteMany.mockResolvedValue({ count: 1 });

      const res: SupertestResponse = await authA()
        .post('/api/v1/orders/complete-shopping')
        .send(validDto);

      expect(res.status).toBe(201);
      const body = res.body as ApiSuccessResponse<OrderDetailResponse>;
      expect(body.status).toBe('success');
      expect(body.data.id).toBe(mockOrderA.id);
      expect(body.data.order_no).toBe(mockOrderA.orderNo);
    });

    it('yetersiz stok durumunda 409 Conflict dönmeli ve sipariş açmamalıdır', async () => {
      mockPrisma.address.findFirst.mockResolvedValue(mockAddressA);
      mockPrisma.cartItem.findMany.mockResolvedValue([mockCartItemA]);
      mockTx.productVariant.updateMany.mockResolvedValue({ count: 0 }); // Stok yetersiz

      const res: SupertestResponse = await authA()
        .post('/api/v1/orders/complete-shopping')
        .send(validDto);

      expect(res.status).toBe(409);
      const body = res.body as ApiErrorResponse;
      expect(body.status).toBe('error');
    });

    it('ödeme reddedildiğinde 400 Bad Request dönmelidir (Rollback)', async () => {
      mockPrisma.address.findFirst.mockResolvedValue(mockAddressA);
      mockPrisma.cartItem.findMany.mockResolvedValue([mockCartItemA]);
      mockTx.productVariant.updateMany.mockResolvedValue({ count: 1 });

      const res: SupertestResponse = await authA()
        .post('/api/v1/orders/complete-shopping')
        .send({
          ...validDto,
          payment_token: 'tok_fail_declined',
        });

      expect(res.status).toBe(400);
      const body = res.body as ApiErrorResponse;
      expect(body.status).toBe('error');
    });
  });

  describe('PUT /api/v1/orders/:id/status', () => {
    it('müşteri rolündeki kullanıcı statü güncellemeye çalıştığında 403 Forbidden almalıdır', async () => {
      const res: SupertestResponse = await request(server)
        .put(`/api/v1/orders/${mockOrderA.id}/status`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ status: OrderStatus.processing });

      expect(res.status).toBe(403);
      const body = res.body as ApiErrorResponse;
      expect(body.status).toBe('error');
    });

    it('admin rolü iptal yaptığında 200 OK dönmeli ve stokları iade etmelidir', async () => {
      mockPrisma.order.findUnique.mockResolvedValue({
        ...mockOrderA,
        status: OrderStatus.pending,
      });

      const updatedCancelledOrder = {
        ...mockOrderA,
        status: OrderStatus.cancelled,
      };
      mockTx.productVariant.update.mockResolvedValue({});
      mockTx.order.update.mockResolvedValue(updatedCancelledOrder);

      const res: SupertestResponse = await authAdmin()
        .put(`/api/v1/orders/${mockOrderA.id}/status`)
        .send({ status: OrderStatus.cancelled });

      expect(res.status).toBe(200);
      const body = res.body as ApiSuccessResponse<OrderDetailResponse>;
      expect(body.status).toBe('success');
      expect(body.data.status).toBe(OrderStatus.cancelled);
      expect(mockTx.productVariant.update).toHaveBeenCalledWith({
        where: { id: 'var-1' },
        data: { stockQuantity: { increment: 2 } },
      });
    });

    it('admin geçersiz geçiş denediğinde (pending -> delivered) 400 Bad Request dönmelidir', async () => {
      mockPrisma.order.findUnique.mockResolvedValue({
        ...mockOrderA,
        status: OrderStatus.pending,
      });

      const res: SupertestResponse = await authAdmin()
        .put(`/api/v1/orders/${mockOrderA.id}/status`)
        .send({ status: OrderStatus.delivered });

      expect(res.status).toBe(400);
      const body = res.body as ApiErrorResponse;
      expect(body.status).toBe('error');
    });
  });
});
