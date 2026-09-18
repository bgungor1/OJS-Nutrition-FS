import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthProvider, Role } from '@prisma/client';
import request, { Response as SupertestResponse } from 'supertest';
import { AppModule } from '../src/app.module';
import { TokenService } from '../src/auth/token.service';
import { PrismaService } from '../src/prisma/prisma.service';
import {
  ContactListResponse,
  ContactMessageResponse,
  ContactSubmitResponse,
} from '../src/contact/interfaces';

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

describe('Contact E2E Test Suite (/api/v1/contact)', () => {
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
    firstName: 'Zeynep',
    lastName: 'Çelik',
    role: Role.customer,
    authProvider: AuthProvider.local,
    createdAt: new Date(),
  };

  const sampleContactMessage1 = {
    id: 'contact-uuid-1',
    name: 'Ahmet Can',
    email: 'ahmet@example.com',
    message: 'Ürünlerin son kullanma tarihi nedir acaba?',
    handled: false,
    createdAt: new Date('2026-09-01T08:00:00Z'),
  };

  interface MockPrismaContact {
    user: {
      findUnique: jest.Mock;
    };
    contactMessage: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      count: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
    refreshToken: {
      findUnique: jest.Mock;
      create: jest.Mock;
    };
  }

  let mockPrisma: MockPrismaContact;

  beforeAll(async () => {
    mockPrisma = {
      user: {
        findUnique: jest.fn(),
      },
      contactMessage: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        count: jest.fn(),
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

  describe('POST /api/v1/contact (Public Contact Form Submission)', () => {
    const validPayload = {
      name: 'Kemal Sunal',
      email: 'kemal@example.com',
      message: 'Ürün çeşitliliği artırılacak mı?',
    };

    it('should return 400 Bad Request when request body has missing or invalid fields', async () => {
      const res: SupertestResponse = await request(server)
        .post('/api/v1/contact')
        .send({ name: 'A', email: 'invalid-email', message: 'kısa' })
        .expect(400);

      const body = res.body as ApiErrorResponse;
      expect(body.status).toBe('error');
      expect(body.statusCode).toBe(400);
    });

    it('should return 201 Created and success envelope with valid payload', async () => {
      mockPrisma.contactMessage.create.mockResolvedValue({
        id: 'new-contact-id',
        name: validPayload.name,
        email: validPayload.email,
        message: validPayload.message,
        handled: false,
        createdAt: new Date(),
      });

      const res: SupertestResponse = await request(server)
        .post('/api/v1/contact')
        .send(validPayload)
        .expect(201);

      const body = res.body as ApiSuccessResponse<ContactSubmitResponse>;
      expect(body.status).toBe('success');
      expect(body.data.id).toBe('new-contact-id');
      expect(body.data.message).toBe('Mesajınız alındı');
      expect(mockPrisma.contactMessage.create).toHaveBeenCalledWith({
        data: {
          name: validPayload.name,
          email: validPayload.email,
          message: validPayload.message,
          handled: false,
        },
      });
    });

    it('should return 429 Too Many Requests when rate limit of 3 requests per minute is exceeded', async () => {
      // 1st request (400), 2nd request (201) were sent. Send 3rd valid request:
      await request(server).post('/api/v1/contact').send(validPayload);

      // 4th request should exceed the limit:
      const res: SupertestResponse = await request(server)
        .post('/api/v1/contact')
        .send(validPayload)
        .expect(429);

      const body = res.body as ApiErrorResponse;
      expect(body.status).toBe('error');
      expect(body.statusCode).toBe(429);
      expect(body.message).toContain('Çok fazla istek gönderildi');
    });
  });

  describe('GET /api/v1/contact (Admin Contact Messages Listing)', () => {
    it('should return 401 Unauthorized when request has no token', async () => {
      const res: SupertestResponse = await request(server)
        .get('/api/v1/contact')
        .expect(401);

      const body = res.body as ApiErrorResponse;
      expect(body.status).toBe('error');
    });

    it('should return 403 Forbidden when requested by customer role', async () => {
      const res: SupertestResponse = await request(server)
        .get('/api/v1/contact')
        .set('Authorization', `Bearer ${customerAccessToken}`)
        .expect(403);

      const body = res.body as ApiErrorResponse;
      expect(body.status).toBe('error');
    });

    it('should list messages and filter by handled status correctly when requested by admin', async () => {
      mockPrisma.contactMessage.findMany.mockResolvedValue([
        sampleContactMessage1,
      ]);
      mockPrisma.contactMessage.count.mockResolvedValue(1);

      const res: SupertestResponse = await request(server)
        .get('/api/v1/contact')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ handled: false, limit: 10, offset: 0 })
        .expect(200);

      const body = res.body as ApiSuccessResponse<ContactListResponse>;
      expect(body.status).toBe('success');
      expect(body.data.count).toBe(1);
      expect(body.data.results).toHaveLength(1);
      expect(body.data.results[0].id).toBe(sampleContactMessage1.id);
      expect(body.data.results[0].name).toBe(sampleContactMessage1.name);
      expect(body.data.results[0].handled).toBe(false);

      expect(mockPrisma.contactMessage.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { handled: false },
          take: 10,
          skip: 0,
        }),
      );
    });
  });

  describe('GET /api/v1/contact/:id (Admin Single Message Lookup)', () => {
    it('should return 403 Forbidden when requested by customer role', async () => {
      const res: SupertestResponse = await request(server)
        .get(`/api/v1/contact/${sampleContactMessage1.id}`)
        .set('Authorization', `Bearer ${customerAccessToken}`)
        .expect(403);

      const body = res.body as ApiErrorResponse;
      expect(body.status).toBe('error');
    });

    it('should return 404 Not Found for non-existent ID', async () => {
      mockPrisma.contactMessage.findUnique.mockResolvedValue(null);

      const res: SupertestResponse = await request(server)
        .get('/api/v1/contact/non-existent-contact')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(404);

      const body = res.body as ApiErrorResponse;
      expect(body.status).toBe('error');
      expect(body.message).toContain('İletişim mesajı bulunamadı');
    });

    it('should return message details when requested by admin', async () => {
      mockPrisma.contactMessage.findUnique.mockResolvedValue(
        sampleContactMessage1,
      );

      const res: SupertestResponse = await request(server)
        .get(`/api/v1/contact/${sampleContactMessage1.id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200);

      const body = res.body as ApiSuccessResponse<ContactMessageResponse>;
      expect(body.status).toBe('success');
      expect(body.data.id).toBe(sampleContactMessage1.id);
      expect(body.data.email).toBe(sampleContactMessage1.email);
    });
  });

  describe('PUT /api/v1/contact/:id (Admin Update Message Status)', () => {
    it('should return 403 Forbidden when requested by customer role', async () => {
      const res: SupertestResponse = await request(server)
        .put(`/api/v1/contact/${sampleContactMessage1.id}`)
        .set('Authorization', `Bearer ${customerAccessToken}`)
        .send({ handled: true })
        .expect(403);

      const body = res.body as ApiErrorResponse;
      expect(body.status).toBe('error');
    });

    it('should return 404 Not Found for non-existent message ID', async () => {
      mockPrisma.contactMessage.findUnique.mockResolvedValue(null);

      const res: SupertestResponse = await request(server)
        .put('/api/v1/contact/missing-id')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ handled: true })
        .expect(404);

      const body = res.body as ApiErrorResponse;
      expect(body.status).toBe('error');
    });

    it('should update handled status successfully when requested by admin', async () => {
      mockPrisma.contactMessage.findUnique.mockResolvedValue({
        id: sampleContactMessage1.id,
      });
      mockPrisma.contactMessage.update.mockResolvedValue({
        ...sampleContactMessage1,
        handled: true,
      });

      const res: SupertestResponse = await request(server)
        .put(`/api/v1/contact/${sampleContactMessage1.id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ handled: true })
        .expect(200);

      const body = res.body as ApiSuccessResponse<ContactMessageResponse>;
      expect(body.status).toBe('success');
      expect(body.data.handled).toBe(true);
      expect(mockPrisma.contactMessage.update).toHaveBeenCalledWith({
        where: { id: sampleContactMessage1.id },
        data: { handled: true },
      });
    });
  });

  describe('DELETE /api/v1/contact/:id (Admin Delete Message)', () => {
    it('should return 403 Forbidden when requested by customer role', async () => {
      const res: SupertestResponse = await request(server)
        .delete(`/api/v1/contact/${sampleContactMessage1.id}`)
        .set('Authorization', `Bearer ${customerAccessToken}`)
        .expect(403);

      const body = res.body as ApiErrorResponse;
      expect(body.status).toBe('error');
    });

    it('should return 404 Not Found for non-existent message ID', async () => {
      mockPrisma.contactMessage.findUnique.mockResolvedValue(null);

      const res: SupertestResponse = await request(server)
        .delete('/api/v1/contact/missing-id')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(404);

      const body = res.body as ApiErrorResponse;
      expect(body.status).toBe('error');
    });

    it('should delete message and return { id } when requested by admin', async () => {
      mockPrisma.contactMessage.findUnique.mockResolvedValue({
        id: sampleContactMessage1.id,
      });
      mockPrisma.contactMessage.delete.mockResolvedValue({
        id: sampleContactMessage1.id,
      });

      const res: SupertestResponse = await request(server)
        .delete(`/api/v1/contact/${sampleContactMessage1.id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200);

      const body = res.body as ApiSuccessResponse<{ id: string }>;
      expect(body.status).toBe('success');
      expect(body.data.id).toBe(sampleContactMessage1.id);
    });
  });
});
