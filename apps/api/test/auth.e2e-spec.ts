import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthProvider } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import request, { Response as SupertestResponse } from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import {
  RegisterResponse,
  TokensResponse,
} from '../src/auth/interfaces/auth-response.interface';

interface ApiSuccessResponse<T> {
  status: 'success';
  data: T;
}

interface ApiErrorResponse {
  status: 'error';
  message?: string;
  reason?: Record<string, string[]>;
}

describe('Auth E2E Test Suite (/api/v1/auth)', () => {
  let app: INestApplication;
  let server: Parameters<typeof request>[0];
  let mockPrisma: {
    user: {
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
    refreshToken: {
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      updateMany: jest.Mock;
    };
  };

  const testPassword = 'Password123';
  let testPasswordHash: string;

  const mockUser = {
    id: 'user-uuid-1',
    email: 'test@example.com',
    passwordHash: '',
    firstName: 'Test',
    lastName: 'User',
    role: 'customer',
    authProvider: AuthProvider.local,
    createdAt: new Date(),
  };

  beforeAll(async () => {
    testPasswordHash = await bcrypt.hash(testPassword, 10);
    mockUser.passwordHash = testPasswordHash;

    mockPrisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      refreshToken: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
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

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/auth/register', () => {
    const validRegisterPayload = {
      email: 'newuser@example.com',
      password: 'StrongPassword1',
      password2: 'StrongPassword1',
      first_name: 'Ahmet',
      last_name: 'Yilmaz',
    };

    it('başarılı kayıt akışında 201 ve güvenli kullanıcı nesnesi dönmeli (passwordHash sızdırılmamalı)', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 'new-user-id',
        email: validRegisterPayload.email,
        firstName: validRegisterPayload.first_name,
        lastName: validRegisterPayload.last_name,
        role: 'customer',
        createdAt: new Date().toISOString(),
      });

      const response: SupertestResponse = await request(server)
        .post('/api/v1/auth/register')
        .send(validRegisterPayload)
        .expect(201);

      const body = response.body as ApiSuccessResponse<
        RegisterResponse & { user: { passwordHash?: string } }
      >;

      expect(body).toMatchObject({
        status: 'success',
        data: {
          user: {
            id: 'new-user-id',
            email: validRegisterPayload.email,
            firstName: validRegisterPayload.first_name,
            lastName: validRegisterPayload.last_name,
            role: 'customer',
          },
          message: 'Kayıt başarıyla tamamlandı.',
        },
      });
      expect(body.data.user.passwordHash).toBeUndefined();
    });

    it('şifreler uyuşmadığında 400 Bad Request dönmeli', async () => {
      const invalidPayload = {
        ...validRegisterPayload,
        password2: 'DifferentPassword2',
      };

      const response: SupertestResponse = await request(server)
        .post('/api/v1/auth/register')
        .send(invalidPayload)
        .expect(400);

      const body = response.body as ApiErrorResponse;
      expect(body.status).toBe('error');
      expect(body.message).toBe('Şifreler eşleşmiyor.');
    });

    it('DTO kurallarına uymayan gövdede 400 ve alan hataları dönmeli', async () => {
      const invalidDtoPayload = {
        email: 'not-an-email',
        password: 'short',
        password2: 'short',
      };

      const response: SupertestResponse = await request(server)
        .post('/api/v1/auth/register')
        .send(invalidDtoPayload)
        .expect(400);

      const body = response.body as ApiErrorResponse;
      expect(body.status).toBe('error');
      expect(body.reason).toBeDefined();
      expect(Object.keys(body.reason ?? {}).length).toBeGreaterThan(0);
    });

    it('e-posta zaten kayıtlıysa 409 Conflict dönmeli', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'existing-id' });

      const response: SupertestResponse = await request(server)
        .post('/api/v1/auth/register')
        .send(validRegisterPayload)
        .expect(409);

      const body = response.body as ApiErrorResponse;
      expect(body.status).toBe('error');
      expect(body.message).toBe('Bu e-posta adresi zaten kullanımda.');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('doğru bilgilerle 200 ve JWT access & refresh token çifti dönmeli', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.refreshToken.create.mockResolvedValue({
        id: 'token-id-1',
        tokenHash: 'hash',
        userId: mockUser.id,
      });

      const response: SupertestResponse = await request(server)
        .post('/api/v1/auth/login')
        .send({
          username: mockUser.email,
          password: testPassword,
        })
        .expect(200);

      const body = response.body as ApiSuccessResponse<TokensResponse>;
      expect(body.status).toBe('success');
      expect(typeof body.data.access).toBe('string');
      expect(typeof body.data.refresh).toBe('string');
      expect(body.data.access.length).toBeGreaterThan(10);
      expect(body.data.refresh.length).toBeGreaterThan(10);
    });

    it('hatalı şifre veya olmayan kullanıcı için tekil 401 dönmeli (User Enumeration engeli)', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const response: SupertestResponse = await request(server)
        .post('/api/v1/auth/login')
        .send({
          username: 'unknown@example.com',
          password: 'WrongPassword1',
        })
        .expect(401);

      const body = response.body as ApiErrorResponse;
      expect(body.status).toBe('error');
      expect(body.message).toBe('Geçersiz e-posta veya şifre.');
    });
  });

  describe('POST /api/v1/auth/token/refresh', () => {
    it('geçerli refresh token ile yeni token çifti dönmeli (Rotation)', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.refreshToken.create.mockResolvedValue({
        id: 'token-id-1',
        tokenHash: 'hash',
        userId: mockUser.id,
      });

      const loginRes: SupertestResponse = await request(server)
        .post('/api/v1/auth/login')
        .send({
          username: mockUser.email,
          password: testPassword,
        })
        .expect(200);

      const loginBody = loginRes.body as ApiSuccessResponse<TokensResponse>;
      const activeRefreshToken = loginBody.data.refresh;

      mockPrisma.refreshToken.findUnique.mockResolvedValue({
        id: 'token-db-id',
        tokenHash: 'some-hash',
        userId: mockUser.id,
        revokedAt: null,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
        user: mockUser,
      });
      mockPrisma.refreshToken.update.mockResolvedValue({});

      const refreshRes: SupertestResponse = await request(server)
        .post('/api/v1/auth/token/refresh')
        .send({ refresh: activeRefreshToken })
        .expect(200);

      const refreshBody = refreshRes.body as ApiSuccessResponse<TokensResponse>;
      expect(refreshBody.status).toBe('success');
      expect(typeof refreshBody.data.access).toBe('string');
      expect(typeof refreshBody.data.refresh).toBe('string');
      expect(refreshBody.data.access.length).toBeGreaterThan(10);
      expect(refreshBody.data.refresh.length).toBeGreaterThan(10);
    });

    it('iptal edilmiş token tekrar kullanıldığında 401 dönmeli ve oturumları sonlandırmalı', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.refreshToken.create.mockResolvedValue({
        id: 'token-id-1',
        tokenHash: 'hash',
        userId: mockUser.id,
      });

      const loginRes: SupertestResponse = await request(server)
        .post('/api/v1/auth/login')
        .send({
          username: mockUser.email,
          password: testPassword,
        })
        .expect(200);

      const loginBody = loginRes.body as ApiSuccessResponse<TokensResponse>;
      const usedRefreshToken = loginBody.data.refresh;

      mockPrisma.refreshToken.findUnique.mockResolvedValue({
        id: 'token-db-id',
        tokenHash: 'some-hash',
        userId: mockUser.id,
        revokedAt: new Date(),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
        user: mockUser,
      });

      const response: SupertestResponse = await request(server)
        .post('/api/v1/auth/token/refresh')
        .send({ refresh: usedRefreshToken })
        .expect(401);

      const body = response.body as ApiErrorResponse;
      expect(body.status).toBe('error');
      expect(mockPrisma.refreshToken.updateMany).toHaveBeenCalled();
      const lastCall = mockPrisma.refreshToken.updateMany.mock.calls[0] as
        [{ where: { userId: string }; data: { revokedAt: Date } }] | undefined;
      expect(lastCall?.[0].where.userId).toBe(mockUser.id);
      expect(lastCall?.[0].data.revokedAt).toBeInstanceOf(Date);
    });
  });

  describe('GET /api/v1/auth/google', () => {
    it('Google kimlik bilgileri ortamda tanımlı değilse 503 ServiceUnavailable dönmeli (Graceful Degradation)', async () => {
      const response: SupertestResponse = await request(server)
        .get('/api/v1/auth/google')
        .expect(503);

      const body = response.body as ApiErrorResponse;
      expect(body.status).toBe('error');
      expect(body.message).toContain(
        'Google OAuth servisi henüz yapılandırılmamış',
      );
    });
  });
});
