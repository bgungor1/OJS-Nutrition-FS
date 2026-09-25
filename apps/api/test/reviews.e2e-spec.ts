import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthProvider, Role } from '@prisma/client';
import request, { Response as SupertestResponse } from 'supertest';
import { AppModule } from '../src/app.module';
import { TokenService } from '../src/auth/token.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { ApiReview, PaginatedReviewsResponse } from '../src/reviews/interfaces';

interface ApiSuccessResponse<T> {
  status: 'success';
  data: T;
}

interface ApiErrorResponse {
  status: 'error';
  statusCode: number;
  message?: string;
  reason?: Record<string, string[]>;
}

describe('Reviews E2E Test Suite (/api/v1/products/:slug/reviews & /api/v1/reviews)', () => {
  let app: INestApplication;
  let server: Parameters<typeof request>[0];
  let tokenService: TokenService;

  let adminAccessToken: string;
  let customer1AccessToken: string;
  let customer2AccessToken: string;

  const mockAdminUser = {
    id: 'admin-uuid-1',
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'Yönetici',
    role: Role.admin,
    authProvider: AuthProvider.local,
    createdAt: new Date(),
  };

  const mockCustomer1 = {
    id: 'customer-uuid-1',
    email: 'customer1@example.com',
    firstName: 'Ali',
    lastName: 'Yılmaz',
    role: Role.customer,
    authProvider: AuthProvider.local,
    createdAt: new Date(),
  };

  const mockCustomer2 = {
    id: 'customer-uuid-2',
    email: 'customer2@example.com',
    firstName: 'Ayşe',
    lastName: 'Demir',
    role: Role.customer,
    authProvider: AuthProvider.local,
    createdAt: new Date(),
  };

  const sampleProduct = {
    id: 'product-uuid-1',
    name: 'Whey Protein 1000g',
    slug: 'whey-protein-1000g',
    commentCount: 2,
    averageStar: 4.5,
  };

  const sampleReview1 = {
    id: 'review-uuid-1',
    productId: sampleProduct.id,
    userId: mockCustomer1.id,
    reviewerName: 'Ali Y.',
    rating: 5,
    isVerified: true,
    title: 'Mükemmel ürün',
    text: 'Tadı ve karışımı harika, kesinlikle tavsiye ediyorum.',
    images: ['media/reviews/photo1.jpg'],
    helpfulCount: 4,
    createdAt: new Date('2026-09-01T10:00:00Z'),
  };

  const sampleReview2 = {
    id: 'review-uuid-2',
    productId: sampleProduct.id,
    userId: mockCustomer2.id,
    reviewerName: 'Ayşe D.',
    rating: 4,
    isVerified: false,
    title: 'Fiyat performans',
    text: 'Etkisi gayet iyi fakat aroması biraz yoğun.',
    images: [],
    helpfulCount: 1,
    createdAt: new Date('2026-09-02T12:00:00Z'),
  };

  interface MockPrismaReviews {
    user: {
      findUnique: jest.Mock;
    };
    product: {
      findUnique: jest.Mock;
      update: jest.Mock;
    };
    review: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      findFirst: jest.Mock;
      count: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
      aggregate: jest.Mock;
    };
    orderItem: {
      findFirst: jest.Mock;
    };
    refreshToken: {
      findUnique: jest.Mock;
      create: jest.Mock;
    };
    $transaction: jest.Mock;
  }

  let mockPrisma: MockPrismaReviews;

  beforeAll(async () => {
    mockPrisma = {
      user: {
        findUnique: jest.fn(),
      },
      product: {
        findUnique: jest.fn(),
        update: jest.fn().mockResolvedValue({}),
      },
      review: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        aggregate: jest.fn().mockResolvedValue({
          _count: { id: 2 },
          _avg: { rating: 4.5 },
        }),
      },
      orderItem: {
        findFirst: jest.fn(),
      },
      refreshToken: {
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({ id: 'rt-id' }),
      },
      $transaction: jest
        .fn()
        .mockImplementation(
          async (callback: (tx: MockPrismaReviews) => Promise<unknown>) => {
            return callback(mockPrisma);
          },
        ),
    };

    mockPrisma.user.findUnique.mockImplementation(
      ({ where }: { where: { id?: string; email?: string } }) => {
        if (
          where.id === mockAdminUser.id ||
          where.email === mockAdminUser.email
        ) {
          return Promise.resolve(mockAdminUser);
        }
        if (
          where.id === mockCustomer1.id ||
          where.email === mockCustomer1.email
        ) {
          return Promise.resolve(mockCustomer1);
        }
        if (
          where.id === mockCustomer2.id ||
          where.email === mockCustomer2.email
        ) {
          return Promise.resolve(mockCustomer2);
        }
        return Promise.resolve(null);
      },
    );

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
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

    tokenService = moduleFixture.get<TokenService>(TokenService);
    const adminTokens = await tokenService.generateTokens(
      mockAdminUser.id,
      mockAdminUser.email,
      mockAdminUser.role,
    );
    adminAccessToken = adminTokens.access;

    const cust1Tokens = await tokenService.generateTokens(
      mockCustomer1.id,
      mockCustomer1.email,
      mockCustomer1.role,
    );
    customer1AccessToken = cust1Tokens.access;

    const cust2Tokens = await tokenService.generateTokens(
      mockCustomer2.id,
      mockCustomer2.email,
      mockCustomer2.role,
    );
    customer2AccessToken = cust2Tokens.access;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma.user.findUnique.mockImplementation(
      ({ where }: { where: { id?: string; email?: string } }) => {
        if (
          where.id === mockAdminUser.id ||
          where.email === mockAdminUser.email
        ) {
          return Promise.resolve(mockAdminUser);
        }
        if (
          where.id === mockCustomer1.id ||
          where.email === mockCustomer1.email
        ) {
          return Promise.resolve(mockCustomer1);
        }
        if (
          where.id === mockCustomer2.id ||
          where.email === mockCustomer2.email
        ) {
          return Promise.resolve(mockCustomer2);
        }
        return Promise.resolve(null);
      },
    );
  });

  describe('GET /api/v1/products/:slug/reviews (Public Reviews Listing)', () => {
    it('should return 404 Not Found when product slug does not exist', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null);

      const res: SupertestResponse = await request(server)
        .get('/api/v1/products/non-existent-product/reviews')
        .expect(404);

      const body = res.body as ApiErrorResponse;
      expect(body.status).toBe('error');
      expect(body.statusCode).toBe(404);
      expect(body.message).toContain('Ürün bulunamadı');
    });

    it('should successfully return paginated reviews and ratingStats for valid product', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({ id: sampleProduct.id });
      mockPrisma.review.findMany
        .mockResolvedValueOnce([sampleReview1, sampleReview2]) // paginated list
        .mockResolvedValueOnce([
          { rating: 5, isVerified: true },
          { rating: 4, isVerified: false },
        ]); // all summaries for stats
      mockPrisma.review.count.mockResolvedValue(2);

      const res: SupertestResponse = await request(server)
        .get(`/api/v1/products/${sampleProduct.slug}/reviews`)
        .expect(200);

      const body = res.body as ApiSuccessResponse<PaginatedReviewsResponse>;
      expect(body.status).toBe('success');
      expect(body.data.count).toBe(2);
      expect(body.data.results).toHaveLength(2);

      const [firstReview] = body.data.results;
      expect(firstReview.id).toBe(sampleReview1.id);
      expect(firstReview.product_id).toBe(sampleProduct.id);
      expect(firstReview.reviewer_name).toBe(sampleReview1.reviewerName);
      expect(firstReview.rating).toBe(5);
      expect(firstReview.is_verified).toBe(true);
      expect(firstReview.helpful_count).toBe(4);

      expect(body.data.stats).toBeDefined();
      expect(body.data.stats.total_reviews).toBe(2);
      expect(body.data.stats.average_rating).toBe(4.5);
      expect(body.data.stats.verified_reviews).toBe(1);
      expect(body.data.stats.rating_distribution['5']).toBe(1);
      expect(body.data.stats.rating_distribution['4']).toBe(1);
    });

    it('should support rating filter and sort parameters', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({ id: sampleProduct.id });
      mockPrisma.review.findMany
        .mockResolvedValueOnce([sampleReview1])
        .mockResolvedValueOnce([
          { rating: 5, isVerified: true },
          { rating: 4, isVerified: false },
        ]);
      mockPrisma.review.count.mockResolvedValue(1);

      const res: SupertestResponse = await request(server)
        .get(`/api/v1/products/${sampleProduct.slug}/reviews`)
        .query({ rating: 5, sort: 'highest_rating', limit: 10, offset: 0 })
        .expect(200);

      const body = res.body as ApiSuccessResponse<PaginatedReviewsResponse>;
      expect(body.status).toBe('success');
      expect(body.data.count).toBe(1);
      expect(mockPrisma.review.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { productId: sampleProduct.id, rating: 5 },
          orderBy: [{ rating: 'desc' }, { createdAt: 'desc' }],
          take: 10,
          skip: 0,
        }),
      );
    });
  });

  describe('POST /api/v1/products/:slug/reviews (Create Review)', () => {
    const validDto = {
      rating: 5,
      title: 'Harika Ürün',
      text: 'Etkisinden son derece memnun kaldım.',
      images: ['media/reviews/photo.jpg'],
    };

    it('should return 401 Unauthorized when request has no token', async () => {
      const res: SupertestResponse = await request(server)
        .post(`/api/v1/products/${sampleProduct.slug}/reviews`)
        .send(validDto)
        .expect(401);

      const body = res.body as ApiErrorResponse;
      expect(body.status).toBe('error');
    });

    it('should return 400 Bad Request when rating is outside 1-5 or fields are invalid', async () => {
      const res: SupertestResponse = await request(server)
        .post(`/api/v1/products/${sampleProduct.slug}/reviews`)
        .set('Authorization', `Bearer ${customer1AccessToken}`)
        .send({ rating: 6, title: '', text: '' })
        .expect(400);

      const body = res.body as ApiErrorResponse;
      expect(body.status).toBe('error');
      expect(body.statusCode).toBe(400);
    });

    it('should return 409 Conflict when user already reviewed the product', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({ id: sampleProduct.id });
      mockPrisma.review.findFirst.mockResolvedValue({ id: 'existing-rev' });

      const res: SupertestResponse = await request(server)
        .post(`/api/v1/products/${sampleProduct.slug}/reviews`)
        .set('Authorization', `Bearer ${customer1AccessToken}`)
        .send(validDto)
        .expect(409);

      const body = res.body as ApiErrorResponse;
      expect(body.status).toBe('error');
      expect(body.message).toContain('zaten bir değerlendirme yaptınız');
    });

    it('should create review with isVerified=true and update aggregate metrics for buyer with order', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({ id: sampleProduct.id });
      mockPrisma.review.findFirst.mockResolvedValue(null);
      mockPrisma.orderItem.findFirst.mockResolvedValue({ id: 'order-item-1' });

      const createdReviewEntity = {
        id: 'new-review-id',
        productId: sampleProduct.id,
        userId: mockCustomer1.id,
        reviewerName: 'Ali Y.',
        rating: 5,
        isVerified: true,
        title: validDto.title,
        text: validDto.text,
        images: validDto.images,
        helpfulCount: 0,
        createdAt: new Date(),
      };

      mockPrisma.review.create.mockResolvedValue(createdReviewEntity);

      const res: SupertestResponse = await request(server)
        .post(`/api/v1/products/${sampleProduct.slug}/reviews`)
        .set('Authorization', `Bearer ${customer1AccessToken}`)
        .send(validDto)
        .expect(201);

      const body = res.body as ApiSuccessResponse<ApiReview>;
      expect(body.status).toBe('success');
      expect(body.data.id).toBe('new-review-id');
      expect(body.data.is_verified).toBe(true);
      expect(body.data.reviewer_name).toBe('Ali Y.');
      expect(mockPrisma.$transaction).toHaveBeenCalled();
      expect(mockPrisma.product.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: sampleProduct.id },
        }),
      );
    });

    it('should create review with isVerified=false when user has no prior order', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({ id: sampleProduct.id });
      mockPrisma.review.findFirst.mockResolvedValue(null);
      mockPrisma.orderItem.findFirst.mockResolvedValue(null);

      const createdReviewEntity = {
        id: 'new-review-id-2',
        productId: sampleProduct.id,
        userId: mockCustomer2.id,
        reviewerName: 'Ayşe D.',
        rating: 4,
        isVerified: false,
        title: validDto.title,
        text: validDto.text,
        images: [],
        helpfulCount: 0,
        createdAt: new Date(),
      };

      mockPrisma.review.create.mockResolvedValue(createdReviewEntity);

      const res: SupertestResponse = await request(server)
        .post(`/api/v1/products/${sampleProduct.slug}/reviews`)
        .set('Authorization', `Bearer ${customer2AccessToken}`)
        .send({ ...validDto, rating: 4, images: [] })
        .expect(201);

      const body = res.body as ApiSuccessResponse<ApiReview>;
      expect(body.status).toBe('success');
      expect(body.data.is_verified).toBe(false);
      expect(body.data.reviewer_name).toBe('Ayşe D.');
    });
  });

  describe('POST /api/v1/products/:slug/reviews/:id/helpful (Helpful Vote)', () => {
    it('should return 404 Not Found for non-existent review ID', async () => {
      mockPrisma.review.update.mockRejectedValue({ code: 'P2025' });

      const res: SupertestResponse = await request(server)
        .post(
          `/api/v1/products/${sampleProduct.slug}/reviews/non-existent-id/helpful`,
        )
        .expect(404);

      const body = res.body as ApiErrorResponse;
      expect(body.status).toBe('error');
    });

    it('should increment helpfulCount by 1 when clicked for valid review', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({ id: sampleProduct.id });
      mockPrisma.review.findFirst.mockResolvedValue(sampleReview1);
      mockPrisma.review.update.mockResolvedValue({
        ...sampleReview1,
        helpfulCount: 5,
      });

      const res: SupertestResponse = await request(server)
        .post(
          `/api/v1/products/${sampleProduct.slug}/reviews/${sampleReview1.id}/helpful`,
        )
        .expect(200);

      const body = res.body as ApiSuccessResponse<ApiReview>;
      expect(body.status).toBe('success');
      expect(body.data.helpful_count).toBe(5);
      expect(mockPrisma.review.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: sampleReview1.id },
          data: { helpfulCount: { increment: 1 } },
        }),
      );
    });
  });

  describe('DELETE /api/v1/reviews/:id (Admin Moderation)', () => {
    it('should return 401 Unauthorized when request has no token', async () => {
      const res: SupertestResponse = await request(server)
        .delete(`/api/v1/reviews/${sampleReview1.id}`)
        .expect(401);

      const body = res.body as ApiErrorResponse;
      expect(body.status).toBe('error');
    });

    it('should return 403 Forbidden when requested by customer role', async () => {
      const res: SupertestResponse = await request(server)
        .delete(`/api/v1/reviews/${sampleReview1.id}`)
        .set('Authorization', `Bearer ${customer1AccessToken}`)
        .expect(403);

      const body = res.body as ApiErrorResponse;
      expect(body.status).toBe('error');
    });

    it('should return 404 Not Found when trying to delete non-existent review', async () => {
      mockPrisma.review.findUnique.mockResolvedValue(null);

      const res: SupertestResponse = await request(server)
        .delete('/api/v1/reviews/missing-id')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(404);

      const body = res.body as ApiErrorResponse;
      expect(body.status).toBe('error');
    });

    it('should delete review and return { id } when requested by admin', async () => {
      mockPrisma.review.findUnique.mockResolvedValue({
        id: sampleReview1.id,
        productId: sampleProduct.id,
      });
      mockPrisma.review.delete.mockResolvedValue({ id: sampleReview1.id });

      const res: SupertestResponse = await request(server)
        .delete(`/api/v1/reviews/${sampleReview1.id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200);

      const body = res.body as ApiSuccessResponse<{ id: string }>;
      expect(body.status).toBe('success');
      expect(body.data.id).toBe(sampleReview1.id);
      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });
  });

  describe('DELETE /api/v1/products/:slug/reviews/:id (Product Nested Admin Delete Endpoint)', () => {
    it('should return 403 Forbidden when customer role attempts deletion', async () => {
      const res: SupertestResponse = await request(server)
        .delete(
          `/api/v1/products/${sampleProduct.slug}/reviews/${sampleReview1.id}`,
        )
        .set('Authorization', `Bearer ${customer1AccessToken}`)
        .expect(403);

      const body = res.body as ApiErrorResponse;
      expect(body.status).toBe('error');
      expect(body.message).toContain('Bu işlem için yetkiniz yok');
    });

    it('should return 200 OK and { id } when deleted by admin', async () => {
      mockPrisma.review.findUnique.mockResolvedValue({
        id: sampleReview1.id,
        productId: sampleProduct.id,
      });
      mockPrisma.review.delete.mockResolvedValue({ id: sampleReview1.id });

      const res: SupertestResponse = await request(server)
        .delete(
          `/api/v1/products/${sampleProduct.slug}/reviews/${sampleReview1.id}`,
        )
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200);

      const body = res.body as ApiSuccessResponse<{ id: string }>;
      expect(body.status).toBe('success');
      expect(body.data.id).toBe(sampleReview1.id);
    });
  });

  describe('POST /api/v1/products/:slug/reviews/upload (Customer Review Media Upload)', () => {
    const testJpgBuffer = Buffer.from([
      0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01,
    ]);

    it('should return 401 when request is not authenticated', async () => {
      await request(server)
        .post(`/api/v1/products/${sampleProduct.slug}/reviews/upload`)
        .attach('file', testJpgBuffer, 'review.jpg')
        .expect(401);
    });

    it('should return 404 when product slug is not found', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null);

      await request(server)
        .post('/api/v1/products/non-existing-product/reviews/upload')
        .set('Authorization', `Bearer ${customer1AccessToken}`)
        .attach('file', testJpgBuffer, 'review.jpg')
        .expect(404);
    });

    it('should return 201 Created and photo_src when authenticated customer uploads image', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(sampleProduct);

      const res: SupertestResponse = await request(server)
        .post(`/api/v1/products/${sampleProduct.slug}/reviews/upload`)
        .set('Authorization', `Bearer ${customer1AccessToken}`)
        .attach('file', testJpgBuffer, 'review.jpg')
        .expect(201);

      const body = res.body as ApiSuccessResponse<{
        photo_src: string;
        url: string;
      }>;
      expect(body.status).toBe('success');
      expect(body.data.photo_src).toMatch(/^media\/uploads\/[a-f0-9-]+\.jpg$/);
      expect(body.data.url).toMatch(
        /^http:\/\/localhost:3000\/media\/uploads\/[a-f0-9-]+\.jpg$/,
      );
    });
  });
});
