import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import express from 'express';
import helmet from 'helmet';
import request, { Response as SupertestResponse } from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { CORRELATION_ID_HEADER } from '../src/common/constants';

interface ApiErrorResponse {
  status: 'error';
  statusCode: number;
  correlationId?: string;
  message?: string;
  reason?: Record<string, string[]>;
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

describe('Security Hardening E2E (Phase 4.5)', () => {
  let app: INestApplication;
  let server: Parameters<typeof request>[0];

  const mockPrisma = {
    contactMessage: {
      create: jest.fn().mockResolvedValue({
        id: 'contact-1',
        name: 'Test',
        email: 'test@example.com',
        message: 'Test mesajı',
        handled: false,
        createdAt: new Date(),
      }),
    },
    order: {
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
    },
    product: {
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
    },
    user: {
      findUnique: jest.fn().mockResolvedValue(null),
    },
    refreshToken: {
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      deleteMany: jest.fn(),
    },
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.use(helmet());
    app.use(express.json({ limit: '50kb' }));
    app.use(express.urlencoded({ extended: true, limit: '50kb' }));
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
  });

  afterAll(async () => {
    await app.close();
  });

  describe('X-Correlation-ID Observability', () => {
    it('should echo the same correlation ID in response header when client sends X-Correlation-ID', async () => {
      const correlationId = 'client-trace-id-abc123';

      const res: SupertestResponse = await request(server)
        .get('/api/v1/products')
        .set(CORRELATION_ID_HEADER, correlationId);

      expect(res.headers[CORRELATION_ID_HEADER]).toBe(correlationId);
    });

    it('should generate a UUID and add it to response headers when client does not send X-Correlation-ID', async () => {
      const res: SupertestResponse =
        await request(server).get('/api/v1/products');

      const returnedId = res.headers[CORRELATION_ID_HEADER] as
        string | undefined;
      expect(returnedId).toBeDefined();
      expect(returnedId).toMatch(UUID_REGEX);
    });

    it('should echo X-Request-ID as X-Correlation-ID for legacy client compatibility', async () => {
      const requestId = 'legacy-req-id-xyz';

      const res: SupertestResponse = await request(server)
        .get('/api/v1/products')
        .set('x-request-id', requestId);

      expect(res.headers[CORRELATION_ID_HEADER]).toBe(requestId);
    });

    it('should generate unique UUIDs for each request with no collisions', async () => {
      const [res1, res2] = await Promise.all([
        request(server).get('/api/v1/products'),
        request(server).get('/api/v1/products'),
      ]);

      const id1 = res1.headers[CORRELATION_ID_HEADER];
      const id2 = res2.headers[CORRELATION_ID_HEADER];

      expect(id1).toMatch(UUID_REGEX);
      expect(id2).toMatch(UUID_REGEX);
      expect(id1).not.toBe(id2);
    });
  });

  describe('CorrelationId and StatusCode in Error Envelope', () => {
    it('should include statusCode in error response envelope', async () => {
      const res: SupertestResponse = await request(server)
        .get('/api/v1/nonexistent-route')
        .expect(404);

      const body = res.body as ApiErrorResponse;
      expect(body.status).toBe('error');
      expect(body.statusCode).toBe(404);
    });

    it('should match client X-Correlation-ID in error response body', async () => {
      const correlationId = 'error-trace-test-456';

      const res: SupertestResponse = await request(server)
        .post('/api/v1/auth/login')
        .set(CORRELATION_ID_HEADER, correlationId)
        .send({ username: 'invalid@test.com', password: 'wrongpass' })
        .expect(401);

      const body = res.body as ApiErrorResponse;
      expect(body.status).toBe('error');
      expect(body.statusCode).toBe(401);
      expect(body.correlationId).toBe(correlationId);
    });

    it('should include statusCode 400 in validation error envelope', async () => {
      const res: SupertestResponse = await request(server)
        .post('/api/v1/contact')
        .send({ name: '' })
        .expect(400);

      const body = res.body as ApiErrorResponse;
      expect(body.status).toBe('error');
      expect(body.statusCode).toBe(400);
    });
  });

  describe('Rate Limiting — 429 Enterprise Error Envelope', () => {
    const contactPayload = {
      name: 'Test Kullanıcı',
      email: 'test@example.com',
      message: 'Test iletişim mesajı.',
    };

    it('should return 429 and standard error envelope when rate limit is exceeded', async () => {
      for (let i = 0; i < 3; i++) {
        await request(server).post('/api/v1/contact').send(contactPayload);
      }

      const res: SupertestResponse = await request(server)
        .post('/api/v1/contact')
        .send(contactPayload)
        .expect(429);

      const body = res.body as ApiErrorResponse;
      expect(body.status).toBe('error');
      expect(body.statusCode).toBe(429);
      expect(body.message).toBe(
        'Çok fazla istek gönderildi. Lütfen bir süre sonra tekrar deneyiniz.',
      );
    });

    it('should include X-Correlation-ID header on 429 responses', async () => {
      const correlationId = 'rate-limit-test-id';

      for (let i = 0; i < 3; i++) {
        await request(server).post('/api/v1/contact').send(contactPayload);
      }

      const res: SupertestResponse = await request(server)
        .post('/api/v1/contact')
        .set(CORRELATION_ID_HEADER, correlationId)
        .send(contactPayload)
        .expect(429);

      expect(res.headers[CORRELATION_ID_HEADER]).toBe(correlationId);
    });
  });

  describe('Helmet Security Headers', () => {
    it('should set X-Frame-Options header to SAMEORIGIN or DENY', async () => {
      const res: SupertestResponse =
        await request(server).get('/api/v1/products');

      const xFrameOptions = res.headers['x-frame-options'] as
        string | undefined;
      expect(xFrameOptions).toBeDefined();
      expect(['SAMEORIGIN', 'DENY']).toContain(xFrameOptions?.toUpperCase());
    });

    it('should set X-Content-Type-Options header to nosniff', async () => {
      const res: SupertestResponse =
        await request(server).get('/api/v1/products');

      expect(res.headers['x-content-type-options']).toBe('nosniff');
    });
  });

  describe('JSON Payload Size Limit (DoS Protection)', () => {
    it('should return 413 Payload Too Large when JSON payload exceeds 50kb', async () => {
      const largePayload = {
        name: 'A'.repeat(61_440),
        email: 'test@example.com',
        message: 'DoS test',
      };

      await request(server)
        .post('/api/v1/contact')
        .send(largePayload)
        .expect(413);
    });

    it('should process payloads under 50kb normally', async () => {
      const normalPayload = {
        name: 'Test Kullanıcı',
        email: 'test@example.com',
        message: 'Normal boyutlu mesaj.',
      };

      const res: SupertestResponse = await request(server)
        .post('/api/v1/contact')
        .send(normalPayload);

      expect(res.status).not.toBe(413);
    });
  });

  describe('OrderQueryDto — Query Injection Protection', () => {
    it('should return 400 or 401 for SQL-injection style status values (not 413)', async () => {
      const res: SupertestResponse = await request(server)
        .get('/api/v1/orders')
        .query({ status: "'; DROP TABLE orders; --" });

      expect([400, 401]).toContain(res.status);
    });

    it('should return 400 or 401 for invalid limit value (>100)', async () => {
      const res: SupertestResponse = await request(server)
        .get('/api/v1/orders')
        .query({ limit: 9999 });

      expect([400, 401]).toContain(res.status);
    });

    it('should return 400 or 401 for negative offset value', async () => {
      const res: SupertestResponse = await request(server)
        .get('/api/v1/orders')
        .query({ offset: -1 });

      expect([400, 401]).toContain(res.status);
    });
  });

  describe('Correlation ID — End-to-End Trace Tracking', () => {
    it('should present X-Correlation-ID in response header on successful responses', async () => {
      const traceId = 'e2e-trace-success-001';

      const res: SupertestResponse = await request(server)
        .get('/api/v1/products')
        .set(CORRELATION_ID_HEADER, traceId);

      expect(res.headers[CORRELATION_ID_HEADER]).toBe(traceId);
    });

    it('should present correlationId in both header and body on error responses', async () => {
      const traceId = 'e2e-trace-error-002';

      const res: SupertestResponse = await request(server)
        .post('/api/v1/auth/login')
        .set(CORRELATION_ID_HEADER, traceId)
        .send({ username: 'not-found@test.com', password: 'WrongPass1' });

      expect(res.headers[CORRELATION_ID_HEADER]).toBe(traceId);

      const body = res.body as ApiErrorResponse;
      expect(body.correlationId).toBe(traceId);
    });
  });
});
