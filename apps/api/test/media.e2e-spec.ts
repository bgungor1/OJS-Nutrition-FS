import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthProvider, Role } from '@prisma/client';
import { HttpAdapterHost } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import request, { Response as SupertestResponse } from 'supertest';
import { AppModule } from '../src/app.module';
import { TokenService } from '../src/auth/token.service';
import { AppConfig } from '../src/config/configuration';
import { MediaUploadResponse } from '../src/media/interfaces/media-upload-response.interface';
import { PrismaService } from '../src/prisma/prisma.service';

interface ApiSuccessResponse<T> {
  status: 'success';
  data: T;
}

interface ApiErrorResponse {
  status: 'error';
  message?: string;
}

describe('Media E2E Test Suite (POST /api/v1/media/upload & Static Serving)', () => {
  let app: INestApplication;
  let server: Parameters<typeof request>[0];
  let tokenService: TokenService;
  let adminAccessToken: string;
  let customerAccessToken: string;
  let storageRootPath: string;

  const validJpegBuffer = Buffer.from([
    0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01,
  ]);

  const validPngBuffer = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
  ]);

  const mockAdminUser = {
    id: 'admin-uuid-1',
    email: 'admin@example.com',
    passwordHash: '$2b$10$dummyhashedpasswordvalue',
    firstName: 'Admin',
    lastName: 'User',
    phoneNumber: '+905550000000',
    role: Role.admin,
    authProvider: AuthProvider.local,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCustomerUser = {
    id: 'customer-uuid-1',
    email: 'customer@example.com',
    passwordHash: '$2b$10$dummyhashedpasswordvalue',
    firstName: 'Müşteri',
    lastName: 'Kullanıcı',
    phoneNumber: '+905551111111',
    role: Role.customer,
    authProvider: AuthProvider.local,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeAll(async () => {
    const mockPrisma = {
      user: {
        findUnique: jest
          .fn()
          .mockImplementation(({ where }: { where: { id: string } }) => {
            if (where.id === mockAdminUser.id) {
              return Promise.resolve(mockAdminUser);
            }
            if (where.id === mockCustomerUser.id) {
              return Promise.resolve(mockCustomerUser);
            }
            return Promise.resolve(null);
          }),
      },
      refreshToken: {
        create: jest.fn().mockResolvedValue({ id: 'rt-id' }),
      },
    };

    const expressApp = express();
    const adapter = new ExpressAdapter(expressApp);
    const httpAdapterHost = new HttpAdapterHost();
    httpAdapterHost.httpAdapter = adapter;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(HttpAdapterHost)
      .useValue(httpAdapterHost)
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .compile();

    app = moduleFixture.createNestApplication(adapter);
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
    server = expressApp as unknown as Parameters<typeof request>[0];

    tokenService = moduleFixture.get<TokenService>(TokenService);
    const configService =
      moduleFixture.get<ConfigService<AppConfig, true>>(ConfigService);
    const rawStorage = configService.get('media', { infer: true }).storagePath;
    storageRootPath = path.isAbsolute(rawStorage)
      ? rawStorage
      : path.join(process.cwd(), rawStorage);

    const adminTokens = await tokenService.generateTokens(
      mockAdminUser.id,
      mockAdminUser.email,
      mockAdminUser.role,
    );
    adminAccessToken = adminTokens.access;

    const customerTokens = await tokenService.generateTokens(
      mockCustomerUser.id,
      mockCustomerUser.email,
      mockCustomerUser.role,
    );
    customerAccessToken = customerTokens.access;
  });

  afterAll(async () => {
    await app.close();
    // Clean up uploaded files in test storage
    const uploadsDir = path.join(storageRootPath, 'uploads');
    if (fs.existsSync(uploadsDir)) {
      fs.rmSync(uploadsDir, { recursive: true, force: true });
    }
  });

  describe('Yetkilendirme ve Güvenlik Sınırları', () => {
    it('Token olmadan istek atıldığında 401 Unauthorized dönmeli', async () => {
      const res: SupertestResponse = await request(server)
        .post('/api/v1/media/upload')
        .attach('file', validJpegBuffer, 'test.jpg');

      expect(res.status).toBe(401);
      const body = res.body as ApiErrorResponse;
      expect(body.status).toBe('error');
    });

    it('Normal müşteri (customer rolü) ile istek atıldığında 403 Forbidden dönmeli', async () => {
      const res: SupertestResponse = await request(server)
        .post('/api/v1/media/upload')
        .set('Authorization', `Bearer ${customerAccessToken}`)
        .attach('file', validJpegBuffer, 'test.jpg');

      expect(res.status).toBe(403);
      const body = res.body as ApiErrorResponse;
      expect(body.status).toBe('error');
    });
  });

  describe('Girdi Doğrulama ve Dosya Güvenliği', () => {
    it('Dosya gövdesi olmadan istek atıldığında 400 Bad Request dönmeli', async () => {
      const res: SupertestResponse = await request(server)
        .post('/api/v1/media/upload')
        .set('Authorization', `Bearer ${adminAccessToken}`);

      expect(res.status).toBe(400);
      const body = res.body as ApiErrorResponse;
      expect(body.status).toBe('error');
      expect(body.message).toContain('Yüklenecek dosya bulunamadı');
    });

    it('SVG dosyası yüklendiğinde 400 Bad Request ile reddedilmeli', async () => {
      const svgBuffer = Buffer.from(
        '<svg xmlns="http://www.w3.org/2000/svg"><script>alert("xss")</script></svg>',
      );

      const res: SupertestResponse = await request(server)
        .post('/api/v1/media/upload')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .attach('file', svgBuffer, 'exploit.svg');

      expect(res.status).toBe(400);
      const body = res.body as ApiErrorResponse;
      expect(body.status).toBe('error');
      expect(body.message).toContain('SVG formatındaki dosyalar');
    });

    it('Sahte resim (uzantısı jpg ama içeriği düz metin) 400 Bad Request ile reddedilmeli', async () => {
      const fakeBuffer = Buffer.from('Plain text content that is not an image');

      const res: SupertestResponse = await request(server)
        .post('/api/v1/media/upload')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .attach('file', fakeBuffer, 'fake.jpg');

      expect(res.status).toBe(400);
      const body = res.body as ApiErrorResponse;
      expect(body.status).toBe('error');
      expect(body.message).toContain('Geçersiz dosya formatı');
    });
  });

  describe('Başarılı Dosya Yükleme ve Statik Sunum', () => {
    let uploadedFilename: string;

    it('Geçerli JPEG yüklendiğinde 201 Created ve doğru yanıt zarfı dönmeli', async () => {
      const res: SupertestResponse = await request(server)
        .post('/api/v1/media/upload')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .attach('file', validJpegBuffer, 'avatar.jpg');

      expect(res.status).toBe(201);
      const body = res.body as ApiSuccessResponse<MediaUploadResponse>;
      expect(body.status).toBe('success');
      expect(body.data).toBeDefined();

      const media = body.data;
      expect(media.photo_src).toMatch(/^media\/uploads\/[a-f0-9-]+\.jpg$/);
      expect(media.url).toMatch(
        /^http:\/\/localhost:3000\/media\/uploads\/[a-f0-9-]+\.jpg$/,
      );
      expect(media.filename).toMatch(/^[a-f0-9-]+\.jpg$/);
      expect(media.size).toBe(validJpegBuffer.length);
      expect(media.mimetype).toBe('image/jpeg');

      uploadedFilename = media.filename;
    });

    it('Geçerli PNG yüklendiğinde 201 Created dönmeli', async () => {
      const res: SupertestResponse = await request(server)
        .post('/api/v1/media/upload')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .attach('file', validPngBuffer, 'banner.png');

      expect(res.status).toBe(201);
      const body = res.body as ApiSuccessResponse<MediaUploadResponse>;
      expect(body.status).toBe('success');
      expect(body.data.mimetype).toBe('image/png');
      expect(body.data.filename.endsWith('.png')).toBe(true);
    });

    it('Yüklenen dosya ServeStaticModule üzerinden GET /media/uploads/... ile erişilebilir olmalı', async () => {
      expect(uploadedFilename).toBeDefined();

      const res: SupertestResponse = await request(server).get(
        `/media/uploads/${uploadedFilename}`,
      );

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('image/jpeg');
      expect(res.body).toBeDefined();
    });
  });
});
