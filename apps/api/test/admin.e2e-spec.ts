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
  createAdminMockPrisma,
  mockAdmin,
  mockCategory,
  mockCustomer,
  mockOrder,
  mockProduct,
  mockSubCategory,
  mockTargetUser,
  mockVariant,
} from './fixtures/admin-e2e.fixture';

interface ApiSuccessResponse<T> {
  status: 'success';
  data: T;
}

interface ApiErrorResponse {
  status: 'error';
  message?: string;
}

describe('Admin E2E Test Suite (/api/v1/admin, /api/v1/products, /api/v1/reviews)', () => {
  let app: INestApplication;
  let server: Parameters<typeof request>[0];
  let customerToken: string;
  let adminToken: string;
  let mockPrisma: ReturnType<typeof createAdminMockPrisma>;

  beforeAll(async () => {
    mockPrisma = createAdminMockPrisma();

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
    customerToken = (
      await tokenService.generateTokens(
        mockCustomer.id,
        mockCustomer.email,
        mockCustomer.role,
      )
    ).access;
    adminToken = (
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

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma.user.findUnique.mockImplementation(
      (args: { where: { id?: string; email?: string } }) => {
        if (
          args.where.id === mockCustomer.id ||
          args.where.email === mockCustomer.email
        ) {
          return Promise.resolve(mockCustomer);
        }
        if (
          args.where.id === mockAdmin.id ||
          args.where.email === mockAdmin.email
        ) {
          return Promise.resolve(mockAdmin);
        }
        if (args.where.id === mockTargetUser.id) {
          return Promise.resolve(mockTargetUser);
        }
        return Promise.resolve(null);
      },
    );
  });

  const authAdmin = () => ({
    get: (url: string) =>
      request(server).get(url).set('Authorization', `Bearer ${adminToken}`),
    post: (url: string) =>
      request(server).post(url).set('Authorization', `Bearer ${adminToken}`),
    put: (url: string) =>
      request(server).put(url).set('Authorization', `Bearer ${adminToken}`),
    patch: (url: string) =>
      request(server).patch(url).set('Authorization', `Bearer ${adminToken}`),
    delete: (url: string) =>
      request(server).delete(url).set('Authorization', `Bearer ${adminToken}`),
  });

  describe('1. RBAC & Yetkilendirme Testleri', () => {
    it('Token olmadan admin endpointlerine erişimde 401 dönmelidir', async () => {
      await request(server).get('/api/v1/admin/dashboard/stats').expect(401);
      await request(server).get('/api/v1/admin/users').expect(401);
      await request(server).get('/api/v1/admin/orders').expect(401);
      await request(server).post('/api/v1/products').send({}).expect(401);
      await request(server)
        .delete(`/api/v1/reviews/${mockVariant.id}`)
        .expect(401);
    });

    it('Müşteri rolündeki token ile erişimde 403 Forbidden dönmelidir', async () => {
      await request(server)
        .get('/api/v1/admin/dashboard/stats')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(403);

      await request(server)
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(403);

      await request(server)
        .get('/api/v1/admin/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(403);

      await request(server)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({})
        .expect(403);
    });
  });

  describe('2. Dashboard Analitik & İstatistikleri', () => {
    it('GET /api/v1/admin/dashboard/stats başarıyla istatistik ve metrikleri dönmelidir', async () => {
      mockPrisma.order.count.mockResolvedValue(10);
      mockPrisma.order.aggregate.mockResolvedValue({
        _sum: { totalPrice: new Decimal(5490) },
      });
      mockPrisma.user.count.mockResolvedValue(25);
      mockPrisma.product.count.mockResolvedValue(12);
      mockPrisma.order.groupBy.mockResolvedValue([
        { status: OrderStatus.processing, _count: { id: 4 } },
        { status: OrderStatus.delivered, _count: { id: 6 } },
      ]);
      mockPrisma.order.findMany
        .mockResolvedValueOnce([mockOrder])
        .mockResolvedValueOnce([
          { createdAt: new Date(), totalPrice: new Decimal(549) },
        ]);
      mockPrisma.orderItem.groupBy.mockResolvedValue([
        {
          productId: mockProduct.id,
          productName: mockProduct.name,
          _sum: { pieces: 15, totalPrice: new Decimal(8235) },
        },
      ]);
      mockPrisma.product.findMany.mockResolvedValue([
        { id: mockProduct.id, variants: [{ photoSrc: mockVariant.photoSrc }] },
      ]);
      mockPrisma.productVariant.findMany.mockResolvedValue([
        {
          ...mockVariant,
          stockQuantity: 4,
          product: { name: mockProduct.name, slug: mockProduct.slug },
        },
      ]);

      const res: SupertestResponse = await authAdmin()
        .get('/api/v1/admin/dashboard/stats')
        .expect(200);

      const body = res.body as ApiSuccessResponse<{
        summary: {
          totalOrders: number;
          totalRevenue: number;
          totalUsers: number;
          totalProducts: number;
        };
        ordersByStatus: Record<string, number>;
      }>;

      expect(body.status).toBe('success');
      expect(body.data.summary.totalOrders).toBe(10);
      expect(body.data.summary.totalRevenue).toBe(5490);
      expect(body.data.ordersByStatus.processing).toBe(4);
    });
  });

  describe('3. Admin Kullanıcı Yönetimi', () => {
    it('GET /api/v1/admin/users sayfalı kullanıcı listesini dönmelidir', async () => {
      mockPrisma.user.findMany.mockResolvedValue([mockTargetUser]);
      mockPrisma.user.count.mockResolvedValue(1);

      const res: SupertestResponse = await authAdmin()
        .get('/api/v1/admin/users?limit=10&offset=0&search=target')
        .expect(200);

      const body = res.body as ApiSuccessResponse<{
        count: number;
        results: Array<{ id: string; email: string }>;
      }>;
      expect(body.status).toBe('success');
      expect(body.data.count).toBe(1);
      expect(body.data.results[0].email).toBe(mockTargetUser.email);
    });

    it('GET /api/v1/admin/users/:id kullanıcı detayını dönmelidir', async () => {
      const res: SupertestResponse = await authAdmin()
        .get(`/api/v1/admin/users/${mockTargetUser.id}`)
        .expect(200);

      const body = res.body as ApiSuccessResponse<{
        id: string;
        email: string;
      }>;
      expect(body.status).toBe('success');
      expect(body.data.id).toBe(mockTargetUser.id);
    });

    it('PATCH /api/v1/admin/users/:id/role rolü güncellemeli', async () => {
      mockPrisma.user.update.mockResolvedValue({
        ...mockTargetUser,
        role: Role.admin,
      });

      const res: SupertestResponse = await authAdmin()
        .patch(`/api/v1/admin/users/${mockTargetUser.id}/role`)
        .send({ role: Role.admin })
        .expect(200);

      const body = res.body as ApiSuccessResponse<{ role: Role }>;
      expect(body.status).toBe('success');
      expect(body.data.role).toBe(Role.admin);
    });

    it('Self-Lockout Koruması: Admin kendi rolünü değiştirememelidir', async () => {
      const res: SupertestResponse = await authAdmin()
        .patch(`/api/v1/admin/users/${mockAdmin.id}/role`)
        .send({ role: Role.customer })
        .expect(400);

      const body = res.body as ApiErrorResponse;
      expect(body.status).toBe('error');
    });
  });

  describe('4. Ürün & Varyant CRUD Yaşam Döngüsü', () => {
    it('POST /api/v1/products yeni ürün oluşturmalıdır', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null);
      mockPrisma.category.findUnique.mockResolvedValue(mockCategory);
      mockPrisma.subCategory.findUnique.mockResolvedValue(mockSubCategory);
      mockPrisma.product.create.mockResolvedValue({
        ...mockProduct,
        variants: [],
      });

      const res: SupertestResponse = await authAdmin()
        .post('/api/v1/products')
        .send({
          name: 'WHEY PROTEIN',
          slug: 'whey-protein',
          shortExplanation: 'Premium Whey',
          usage: '1 ölçek',
          features: '24g protein',
          description: 'Saf konsantre',
          nutritionalContent: {
            ingredients: [],
            nutrition_facts: { portion_sizes: [], ingredients: [] },
            amino_acid_facts: { portion_sizes: [], ingredients: [] },
          },
          tags: ['protein', 'whey'],
          mainCategoryId: mockCategory.id,
          subCategoryId: mockSubCategory.id,
        })
        .expect(201);

      const body = res.body as ApiSuccessResponse<{ name: string }>;
      expect(body.status).toBe('success');
      expect(body.data.name).toBe('WHEY PROTEIN');
    });

    it('PUT /api/v1/products/:id ürün alanlarını güncellemelidir', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(mockProduct);
      mockPrisma.product.update.mockResolvedValue({
        ...mockProduct,
        name: 'GÜNCELLENMİŞ PROTEİN',
      });

      const res: SupertestResponse = await authAdmin()
        .put(`/api/v1/products/${mockProduct.id}`)
        .send({ name: 'GÜNCELLENMİŞ PROTEİN' })
        .expect(200);

      const body = res.body as ApiSuccessResponse<{ name: string }>;
      expect(body.status).toBe('success');
      expect(body.data.name).toBe('GÜNCELLENMİŞ PROTEİN');
    });

    it('POST /api/v1/products/:id/variants varyant eklemelidir', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(mockProduct);
      mockPrisma.productVariant.create.mockResolvedValue(mockVariant);
      mockPrisma.product.findUniqueOrThrow.mockResolvedValue(mockProduct);

      const res: SupertestResponse = await authAdmin()
        .post(`/api/v1/products/${mockProduct.id}/variants`)
        .send({
          gram: 1000,
          pieces: 1,
          totalServings: 33,
          aroma: 'Muz',
          totalPrice: 599,
          pricePerServing: 18.15,
          photoSrc: 'media/products/muz.jpg',
          stockQuantity: 50,
        })
        .expect(201);

      const body = res.body as ApiSuccessResponse<{ id: string }>;
      expect(body.status).toBe('success');
    });

    it('DELETE /api/v1/products/:id/variants/:varId sipariş geçmişi olan varyant için 400 dönmelidir', async () => {
      mockPrisma.productVariant.findUnique.mockResolvedValue(mockVariant);
      mockPrisma.orderItem.count.mockResolvedValue(5);

      const res: SupertestResponse = await authAdmin()
        .delete(`/api/v1/products/${mockProduct.id}/variants/${mockVariant.id}`)
        .expect(400);

      const body = res.body as ApiErrorResponse;
      expect(body.status).toBe('error');
    });
  });

  describe('5. Admin Sipariş Yönetimi', () => {
    it('GET /api/v1/admin/orders filtrelenmiş sipariş listesini dönmelidir', async () => {
      mockPrisma.order.findMany.mockResolvedValue([mockOrder]);
      mockPrisma.order.count.mockResolvedValue(1);

      const res: SupertestResponse = await authAdmin()
        .get('/api/v1/admin/orders?limit=10&offset=0&status=processing')
        .expect(200);

      const body = res.body as ApiSuccessResponse<{
        count: number;
        results: Array<{ orderNo: string }>;
      }>;
      expect(body.status).toBe('success');
      expect(body.data.count).toBe(1);
      expect(body.data.results[0].orderNo).toBe(mockOrder.orderNo);
    });

    it('GET /api/v1/admin/orders/:id sipariş detayını dönmelidir', async () => {
      mockPrisma.order.findUnique.mockResolvedValue(mockOrder);

      const res: SupertestResponse = await authAdmin()
        .get(`/api/v1/admin/orders/${mockOrder.id}`)
        .expect(200);

      const body = res.body as ApiSuccessResponse<{
        id: string;
        orderNo: string;
      }>;
      expect(body.status).toBe('success');
      expect(body.data.id).toBe(mockOrder.id);
    });

    it('PATCH /api/v1/admin/orders/:id/status sipariş durumunu güncellemeli ve iptalde stok iade etmelidir', async () => {
      let currentStatus: OrderStatus = OrderStatus.processing;

      mockPrisma.order.findUnique.mockImplementation(
        (args: { where: { id: string } }) => {
          if (args.where.id === mockOrder.id) {
            return Promise.resolve({
              ...mockOrder,
              status: currentStatus,
            });
          }
          return Promise.resolve(null);
        },
      );

      mockPrisma.order.update.mockImplementation(() => {
        currentStatus = OrderStatus.cancelled;
        return Promise.resolve({
          ...mockOrder,
          status: OrderStatus.cancelled,
        });
      });

      const res: SupertestResponse = await authAdmin()
        .patch(`/api/v1/admin/orders/${mockOrder.id}/status`)
        .send({ status: OrderStatus.cancelled })
        .expect(200);

      const body = res.body as ApiSuccessResponse<{ status: OrderStatus }>;
      expect(body.status).toBe('success');
      expect(body.data.status).toBe(OrderStatus.cancelled);
      expect(mockPrisma.productVariant.update).toHaveBeenCalledWith({
        where: { id: mockVariant.id },
        data: { stockQuantity: { increment: 1 } },
      });
    });
  });

  describe('6. Yorum Moderasyonu', () => {
    it('DELETE /api/v1/reviews/:id yorumu silmeli ve ürün puan ortalamasını güncellemelidir', async () => {
      mockPrisma.review.findUnique.mockResolvedValue({
        id: 'rev-uuid-1',
        productId: mockProduct.id,
      });
      mockPrisma.review.delete.mockResolvedValue({});
      mockPrisma.review.aggregate.mockResolvedValue({
        _avg: { rating: 4.5 },
        _count: { id: 9 },
      });
      mockPrisma.product.update.mockResolvedValue({});

      const res: SupertestResponse = await authAdmin()
        .delete('/api/v1/reviews/rev-uuid-1')
        .expect(200);

      const body = res.body as ApiSuccessResponse<{ id: string }>;
      expect(body.status).toBe('success');
      expect(body.data.id).toBe('rev-uuid-1');
    });
  });
});
