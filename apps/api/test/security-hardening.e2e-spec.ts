import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
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

describe('Security Hardening E2E (Faz 4.5)', () => {
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
    it('istemci X-Correlation-ID gönderirse yanıt başlığında aynı değer dönmeli', async () => {
      const correlationId = 'client-trace-id-abc123';

      const res: SupertestResponse = await request(server)
        .get('/api/v1/products')
        .set(CORRELATION_ID_HEADER, correlationId);

      expect(res.headers[CORRELATION_ID_HEADER]).toBe(correlationId);
    });

    it('istemci X-Correlation-ID göndermezse sunucu UUID üretmeli ve yanıt başlığına eklemeli', async () => {
      const res: SupertestResponse =
        await request(server).get('/api/v1/products');

      const returnedId = res.headers[CORRELATION_ID_HEADER] as
        string | undefined;
      expect(returnedId).toBeDefined();
      expect(returnedId).toMatch(UUID_REGEX);
    });

    it('X-Request-ID varsa X-Correlation-ID olarak echo edilmeli (eski istemci uyumu)', async () => {
      const requestId = 'legacy-req-id-xyz';

      const res: SupertestResponse = await request(server)
        .get('/api/v1/products')
        .set('x-request-id', requestId);

      expect(res.headers[CORRELATION_ID_HEADER]).toBe(requestId);
    });

    it('her istek için farklı UUID üretilmeli (çakışma olmamalı)', async () => {
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

  describe('Hata zarfında correlationId ve statusCode', () => {
    it('hata yanıtı statusCode içermeli', async () => {
      const res: SupertestResponse = await request(server)
        .get('/api/v1/nonexistent-route')
        .expect(404);

      const body = res.body as ApiErrorResponse;
      expect(body.status).toBe('error');
      expect(body.statusCode).toBe(404);
    });

    it('istemci X-Correlation-ID gönderirse hata zarfında correlationId aynı değer olmalı', async () => {
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

    it('validation hatası (400) zarfında statusCode 400 olmalı', async () => {
      const res: SupertestResponse = await request(server)
        .post('/api/v1/contact')
        .send({ name: '' })
        .expect(400);

      const body = res.body as ApiErrorResponse;
      expect(body.status).toBe('error');
      expect(body.statusCode).toBe(400);
    });
  });

  describe('Rate Limiting — 429 kurumsal hata zarfı', () => {
    const contactPayload = {
      name: 'Test Kullanıcı',
      email: 'test@example.com',
      message: 'Test iletişim mesajı.',
    };

    it('hız sınırı aşıldığında 429 ve standart hata zarfı dönmeli', async () => {
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

    it('429 yanıtında X-Correlation-ID başlığı dönmeli', async () => {
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

  describe('Helmet Güvenlik Başlıkları', () => {
    it('X-Frame-Options başlığı SAMEORIGIN veya DENY olarak set edilmeli', async () => {
      const res: SupertestResponse =
        await request(server).get('/api/v1/products');

      const xFrameOptions = res.headers['x-frame-options'] as
        string | undefined;
      expect(xFrameOptions).toBeDefined();
      expect(['SAMEORIGIN', 'DENY']).toContain(xFrameOptions?.toUpperCase());
    });

    it('X-Content-Type-Options başlığı nosniff olarak set edilmeli', async () => {
      const res: SupertestResponse =
        await request(server).get('/api/v1/products');

      expect(res.headers['x-content-type-options']).toBe('nosniff');
    });
  });

  describe('JSON Payload Boyutu Sınırı (DoS Koruması)', () => {
    it('50kb üstü JSON payload 413 döndürmeli', async () => {
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

    it('50kb altı payload normal şekilde işlenmeli', async () => {
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

  describe('OrderQueryDto — Query Injection Koruması', () => {
    it('geçersiz status değeri (SQL-inject girişi) 400 veya 401 dönmeli (413 olmamalı)', async () => {
      const res: SupertestResponse = await request(server)
        .get('/api/v1/orders')
        .query({ status: "'; DROP TABLE orders; --" });

      expect([400, 401]).toContain(res.status);
    });

    it('geçersiz limit değeri (>100) 400 veya 401 dönmeli', async () => {
      const res: SupertestResponse = await request(server)
        .get('/api/v1/orders')
        .query({ limit: 9999 });

      expect([400, 401]).toContain(res.status);
    });

    it('negatif offset 400 veya 401 dönmeli', async () => {
      const res: SupertestResponse = await request(server)
        .get('/api/v1/orders')
        .query({ offset: -1 });

      expect([400, 401]).toContain(res.status);
    });
  });

  describe('Correlation ID — Uçtan uca iz takibi', () => {
    it("X-Correlation-ID başarılı yanıtta response header'da mevcut olmalı", async () => {
      const traceId = 'e2e-trace-success-001';

      const res: SupertestResponse = await request(server)
        .get('/api/v1/products')
        .set(CORRELATION_ID_HEADER, traceId);

      expect(res.headers[CORRELATION_ID_HEADER]).toBe(traceId);
    });

    it("hata yanıtında hem header hem body'de correlationId olmalı", async () => {
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
