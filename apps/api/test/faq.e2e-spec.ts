import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthProvider, Role } from '@prisma/client';
import request, { Response as SupertestResponse } from 'supertest';
import { AppModule } from '../src/app.module';
import { TokenService } from '../src/auth/token.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { ApiFaqItem } from '../src/faq/interfaces';

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

describe('FAQ E2E Test Suite (/api/v1/faq)', () => {
  let app: INestApplication;
  let server: Parameters<typeof request>[0];
  let tokenService: TokenService;

  let adminAccessToken: string;
  let customerAccessToken: string;

  const mockAdminUser = {
    id: 'admin-uuid-1',
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'Yönetici',
    role: Role.admin,
    authProvider: AuthProvider.local,
    createdAt: new Date(),
  };

  const mockCustomer = {
    id: 'customer-uuid-1',
    email: 'customer@example.com',
    firstName: 'Mehmet',
    lastName: 'Kaya',
    role: Role.customer,
    authProvider: AuthProvider.local,
    createdAt: new Date(),
  };

  const sampleFaq1 = {
    id: 'faq-uuid-1',
    question: 'Siparişim ne zaman kargoya verilir?',
    answer:
      'Hafta içi saat 16:00ya kadar verilen siparişler aynı gün kargolanır.',
    category: 'kargo',
    sortOrder: 1,
    createdAt: new Date(),
  };

  const sampleFaq2 = {
    id: 'faq-uuid-2',
    question: 'Hangi ödeme yöntemlerini kabul ediyorsunuz?',
    answer:
      'Kredi kartı, banka kartı ve havale yöntemleriyle ödeme yapabilirsiniz.',
    category: 'odeme',
    sortOrder: 2,
    createdAt: new Date(),
  };

  interface MockPrismaFaq {
    user: {
      findUnique: jest.Mock;
    };
    faqItem: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
    refreshToken: {
      findUnique: jest.Mock;
      create: jest.Mock;
    };
  }

  let mockPrisma: MockPrismaFaq;

  beforeAll(async () => {
    mockPrisma = {
      user: {
        findUnique: jest.fn(),
      },
      faqItem: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      refreshToken: {
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({ id: 'rt-id' }),
      },
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
          where.id === mockCustomer.id ||
          where.email === mockCustomer.email
        ) {
          return Promise.resolve(mockCustomer);
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

    const custTokens = await tokenService.generateTokens(
      mockCustomer.id,
      mockCustomer.email,
      mockCustomer.role,
    );
    customerAccessToken = custTokens.access;
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
          where.id === mockCustomer.id ||
          where.email === mockCustomer.email
        ) {
          return Promise.resolve(mockCustomer);
        }
        return Promise.resolve(null);
      },
    );
  });

  describe('GET /api/v1/faq (Public FAQ Listing)', () => {
    it('should return all FAQ items ordered by sortOrder', async () => {
      mockPrisma.faqItem.findMany.mockResolvedValue([sampleFaq1, sampleFaq2]);

      const res: SupertestResponse = await request(server)
        .get('/api/v1/faq')
        .expect(200);

      const body = res.body as ApiSuccessResponse<ApiFaqItem[]>;
      expect(body.status).toBe('success');
      expect(body.data).toHaveLength(2);
      expect(body.data[0].id).toBe(sampleFaq1.id);
      expect(body.data[0].question).toBe(sampleFaq1.question);
      expect(body.data[0].category).toBe('kargo');
      expect(body.data[0].sort_order).toBe(1);
      expect(body.data[1].id).toBe(sampleFaq2.id);
      expect(body.data[1].sort_order).toBe(2);
    });

    it('should filter items by category query parameter', async () => {
      mockPrisma.faqItem.findMany.mockResolvedValue([sampleFaq1]);

      const res: SupertestResponse = await request(server)
        .get('/api/v1/faq')
        .query({ category: 'kargo' })
        .expect(200);

      const body = res.body as ApiSuccessResponse<ApiFaqItem[]>;
      expect(body.status).toBe('success');
      expect(body.data).toHaveLength(1);
      expect(mockPrisma.faqItem.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { category: 'kargo' },
          orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
        }),
      );
    });
  });

  describe('GET /api/v1/faq/:id (Single FAQ Item)', () => {
    it('should return 404 Not Found for non-existent FAQ ID', async () => {
      mockPrisma.faqItem.findUnique.mockResolvedValue(null);

      const res: SupertestResponse = await request(server)
        .get('/api/v1/faq/missing-uuid')
        .expect(404);

      const body = res.body as ApiErrorResponse;
      expect(body.status).toBe('error');
      expect(body.statusCode).toBe(404);
      expect(body.message).toContain('SSS maddesi bulunamadı');
    });

    it('should return 200 OK and FAQ details for valid ID', async () => {
      mockPrisma.faqItem.findUnique.mockResolvedValue(sampleFaq1);

      const res: SupertestResponse = await request(server)
        .get(`/api/v1/faq/${sampleFaq1.id}`)
        .expect(200);

      const body = res.body as ApiSuccessResponse<ApiFaqItem>;
      expect(body.status).toBe('success');
      expect(body.data.id).toBe(sampleFaq1.id);
      expect(body.data.question).toBe(sampleFaq1.question);
      expect(body.data.answer).toBe(sampleFaq1.answer);
    });
  });

  describe('POST /api/v1/faq (Admin Create FAQ)', () => {
    const validDto = {
      question: 'İade süreciniz nasıl işler?',
      answer: '14 gün içinde koşulsuz iade edebilirsiniz.',
      category: 'genel',
      sortOrder: 3,
    };

    it('should return 401 Unauthorized when request has no token', async () => {
      const res: SupertestResponse = await request(server)
        .post('/api/v1/faq')
        .send(validDto)
        .expect(401);

      const body = res.body as ApiErrorResponse;
      expect(body.status).toBe('error');
    });

    it('should return 403 Forbidden when requested by customer role', async () => {
      const res: SupertestResponse = await request(server)
        .post('/api/v1/faq')
        .set('Authorization', `Bearer ${customerAccessToken}`)
        .send(validDto)
        .expect(403);

      const body = res.body as ApiErrorResponse;
      expect(body.status).toBe('error');
    });

    it('should return 400 Bad Request when DTO is invalid or missing required fields', async () => {
      const res: SupertestResponse = await request(server)
        .post('/api/v1/faq')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ question: '', answer: '' })
        .expect(400);

      const body = res.body as ApiErrorResponse;
      expect(body.status).toBe('error');
      expect(body.statusCode).toBe(400);
    });

    it('should return 201 Created and created FAQ item when submitted by admin', async () => {
      const createdEntity = {
        id: 'faq-uuid-new',
        question: validDto.question,
        answer: validDto.answer,
        category: validDto.category,
        sortOrder: validDto.sortOrder,
        createdAt: new Date(),
      };

      mockPrisma.faqItem.create.mockResolvedValue(createdEntity);

      const res: SupertestResponse = await request(server)
        .post('/api/v1/faq')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(validDto)
        .expect(201);

      const body = res.body as ApiSuccessResponse<ApiFaqItem>;
      expect(body.status).toBe('success');
      expect(body.data.id).toBe('faq-uuid-new');
      expect(body.data.question).toBe(validDto.question);
      expect(body.data.category).toBe('genel');
      expect(body.data.sort_order).toBe(3);
    });
  });

  describe('PUT /api/v1/faq/:id (Admin Update FAQ)', () => {
    const updateDto = {
      question: 'Güncellenmiş Soru Başlığı',
      sortOrder: 5,
    };

    it('should return 401 Unauthorized when request has no token', async () => {
      const res: SupertestResponse = await request(server)
        .put(`/api/v1/faq/${sampleFaq1.id}`)
        .send(updateDto)
        .expect(401);

      const body = res.body as ApiErrorResponse;
      expect(body.status).toBe('error');
    });

    it('should return 403 Forbidden when requested by customer role', async () => {
      const res: SupertestResponse = await request(server)
        .put(`/api/v1/faq/${sampleFaq1.id}`)
        .set('Authorization', `Bearer ${customerAccessToken}`)
        .send(updateDto)
        .expect(403);

      const body = res.body as ApiErrorResponse;
      expect(body.status).toBe('error');
    });

    it('should return 404 Not Found when trying to update non-existent FAQ item', async () => {
      mockPrisma.faqItem.findUnique.mockResolvedValue(null);

      const res: SupertestResponse = await request(server)
        .put('/api/v1/faq/non-existent-faq')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateDto)
        .expect(404);

      const body = res.body as ApiErrorResponse;
      expect(body.status).toBe('error');
    });

    it('should update FAQ item successfully when requested by admin', async () => {
      mockPrisma.faqItem.findUnique.mockResolvedValue({ id: sampleFaq1.id });
      mockPrisma.faqItem.update.mockResolvedValue({
        ...sampleFaq1,
        question: updateDto.question,
        sortOrder: updateDto.sortOrder,
      });

      const res: SupertestResponse = await request(server)
        .put(`/api/v1/faq/${sampleFaq1.id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateDto)
        .expect(200);

      const body = res.body as ApiSuccessResponse<ApiFaqItem>;
      expect(body.status).toBe('success');
      expect(body.data.question).toBe('Güncellenmiş Soru Başlığı');
      expect(body.data.sort_order).toBe(5);
    });
  });

  describe('DELETE /api/v1/faq/:id (Admin Delete FAQ)', () => {
    it('should return 401 Unauthorized when request has no token', async () => {
      const res: SupertestResponse = await request(server)
        .delete(`/api/v1/faq/${sampleFaq1.id}`)
        .expect(401);

      const body = res.body as ApiErrorResponse;
      expect(body.status).toBe('error');
    });

    it('should return 403 Forbidden when requested by customer role', async () => {
      const res: SupertestResponse = await request(server)
        .delete(`/api/v1/faq/${sampleFaq1.id}`)
        .set('Authorization', `Bearer ${customerAccessToken}`)
        .expect(403);

      const body = res.body as ApiErrorResponse;
      expect(body.status).toBe('error');
    });

    it('should return 404 Not Found when trying to delete non-existent FAQ item', async () => {
      mockPrisma.faqItem.findUnique.mockResolvedValue(null);

      const res: SupertestResponse = await request(server)
        .delete('/api/v1/faq/missing-faq')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(404);

      const body = res.body as ApiErrorResponse;
      expect(body.status).toBe('error');
    });

    it('should delete FAQ item and return { id } when requested by admin', async () => {
      mockPrisma.faqItem.findUnique.mockResolvedValue({ id: sampleFaq1.id });
      mockPrisma.faqItem.delete.mockResolvedValue({ id: sampleFaq1.id });

      const res: SupertestResponse = await request(server)
        .delete(`/api/v1/faq/${sampleFaq1.id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200);

      const body = res.body as ApiSuccessResponse<{ id: string }>;
      expect(body.status).toBe('success');
      expect(body.data.id).toBe(sampleFaq1.id);
    });
  });
});
