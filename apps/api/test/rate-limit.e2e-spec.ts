import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request, { Response as SupertestResponse } from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

interface ApiSuccessResponse<T> {
  status: 'success';
  data: T;
}

interface ApiErrorResponse {
  status: 'error';
  message?: string;
  reason?: Record<string, string[]>;
}

describe('Rate Limiting E2E Test Suite (429 & Standard Envelope)', () => {
  let app: INestApplication;
  let server: Parameters<typeof request>[0];
  let mockPrisma: {
    contactMessage: {
      create: jest.Mock;
    };
  };

  beforeAll(async () => {
    mockPrisma = {
      contactMessage: {
        create: jest.fn().mockResolvedValue({
          id: 'contact-msg-1',
          name: 'Ahmet Yılmaz',
          email: 'ahmet@example.com',
          message: 'Test iletişim mesajı içeriği',
          handled: false,
          createdAt: new Date(),
        }),
      },
    };

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
      }),
    );

    await app.init();
    server = app.getHttpServer() as Parameters<typeof request>[0];
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/v1/contact hız sınırı kontrolü (limit: 3 / min)', () => {
    const contactPayload = {
      name: 'Ahmet Yılmaz',
      email: 'ahmet@example.com',
      message: 'Sipariş durumum hakkında bilgi almak istiyorum.',
    };

    it('3 ardışık istek başarıyla 201 dönmeli, 4. istekte standart 429 hata zarfı dönmeli', async () => {
      // 1. İstek (Başarılı)
      const res1: SupertestResponse = await request(server)
        .post('/api/v1/contact')
        .send(contactPayload)
        .expect(201);
      expect((res1.body as ApiSuccessResponse<unknown>).status).toBe('success');

      // 2. İstek (Başarılı)
      const res2: SupertestResponse = await request(server)
        .post('/api/v1/contact')
        .send(contactPayload)
        .expect(201);
      expect((res2.body as ApiSuccessResponse<unknown>).status).toBe('success');

      // 3. İstek (Başarılı)
      const res3: SupertestResponse = await request(server)
        .post('/api/v1/contact')
        .send(contactPayload)
        .expect(201);
      expect((res3.body as ApiSuccessResponse<unknown>).status).toBe('success');

      // 4. İstek (Hız sınırı aşıldı -> 429 Too Many Requests)
      const res4: SupertestResponse = await request(server)
        .post('/api/v1/contact')
        .send(contactPayload)
        .expect(429);

      const errorBody = res4.body as ApiErrorResponse;
      expect(errorBody.status).toBe('error');
      expect(errorBody.message).toBe(
        'Çok fazla istek gönderildi. Lütfen bir süre sonra tekrar deneyiniz.',
      );
    });
  });
});
