import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthProvider } from '@prisma/client';
import request, { Response as SupertestResponse } from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { TokenService } from '../src/auth/token.service';

interface ApiSuccessResponse<T> {
  status: 'success';
  data: T;
}

interface ApiErrorResponse {
  status: 'error';
  message?: string;
  reason?: Record<string, string[]>;
}

describe('Auth Session Lifecycle E2E Test Suite (/api/v1/auth)', () => {
  let app: INestApplication;
  let server: Parameters<typeof request>[0];
  let tokenService: TokenService;
  let mockPrisma: {
    user: {
      findUnique: jest.Mock;
    };
    refreshToken: {
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      updateMany: jest.Mock;
      deleteMany: jest.Mock;
    };
  };

  const mockUser = {
    id: 'user-uuid-1',
    email: 'test@example.com',
    passwordHash: 'some-hash',
    firstName: 'Test',
    lastName: 'User',
    role: 'customer',
    authProvider: AuthProvider.local,
    createdAt: new Date(),
  };

  beforeAll(async () => {
    mockPrisma = {
      user: {
        findUnique: jest.fn(),
      },
      refreshToken: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        deleteMany: jest.fn(),
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
    tokenService = app.get(TokenService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/auth/logout', () => {
    it('geçerli refresh token ile 200 dönmeli ve veritabanında revokedAt güncellenmeli', async () => {
      mockPrisma.refreshToken.findUnique.mockResolvedValue({
        id: 'token-logout-id',
        tokenHash: 'some-hash',
        userId: mockUser.id,
        revokedAt: null,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
        user: mockUser,
      });
      mockPrisma.refreshToken.update.mockResolvedValue({});

      const response: SupertestResponse = await request(server)
        .post('/api/v1/auth/logout')
        .send({ refresh: 'valid-sample-refresh-token' })
        .expect(200);

      const body = response.body as ApiSuccessResponse<{ message: string }>;
      expect(body.status).toBe('success');
      expect(body.data.message).toBe('Oturum başarıyla sonlandırıldı.');
      expect(mockPrisma.refreshToken.update).toHaveBeenCalled();
      const updateCall = mockPrisma.refreshToken.update.mock.calls[0] as
        [{ where: { id: string }; data: { revokedAt: Date } }] | undefined;
      expect(updateCall?.[0].where.id).toBe('token-logout-id');
      expect(updateCall?.[0].data.revokedAt).toBeInstanceOf(Date);
    });

    it('refresh_token alan adıyla da geriye dönük uyumlu çalışmalı', async () => {
      mockPrisma.refreshToken.findUnique.mockResolvedValue({
        id: 'token-legacy-id',
        tokenHash: 'legacy-hash',
        userId: mockUser.id,
        revokedAt: null,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
        user: mockUser,
      });
      mockPrisma.refreshToken.update.mockResolvedValue({});

      const response: SupertestResponse = await request(server)
        .post('/api/v1/auth/logout')
        .send({ refresh_token: 'valid-sample-refresh-token' })
        .expect(200);

      const body = response.body as ApiSuccessResponse<{ message: string }>;
      expect(body.status).toBe('success');
      expect(body.data.message).toBe('Oturum başarıyla sonlandırıldı.');
    });

    it('zaten iptal edilmiş refresh token ile çağrıldığında idempotent olarak 200 dönmeli', async () => {
      mockPrisma.refreshToken.findUnique.mockResolvedValue({
        id: 'token-already-revoked',
        tokenHash: 'revoked-hash',
        userId: mockUser.id,
        revokedAt: new Date(),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
        user: mockUser,
      });

      const response: SupertestResponse = await request(server)
        .post('/api/v1/auth/logout')
        .send({ refresh: 'already-revoked-token' })
        .expect(200);

      const body = response.body as ApiSuccessResponse<{ message: string }>;
      expect(body.status).toBe('success');
      expect(body.data.message).toBe('Oturum başarıyla sonlandırıldı.');
      expect(mockPrisma.refreshToken.update).not.toHaveBeenCalled();
    });

    it('veritabanında bulunmayan token için 401 dönmeli', async () => {
      mockPrisma.refreshToken.findUnique.mockResolvedValue(null);

      const response: SupertestResponse = await request(server)
        .post('/api/v1/auth/logout')
        .send({ refresh: 'non-existent-refresh-token' })
        .expect(401);

      const body = response.body as ApiErrorResponse;
      expect(body.status).toBe('error');
      expect(body.message).toBe('Geçersiz yenileme anahtarı.');
    });

    it('gövdede refresh veya refresh_token sağlanmadığında 400 dönmeli', async () => {
      const response: SupertestResponse = await request(server)
        .post('/api/v1/auth/logout')
        .send({})
        .expect(400);

      const body = response.body as ApiErrorResponse;
      expect(body.status).toBe('error');
      expect(body.reason).toBeDefined();
    });
  });

  describe('POST /api/v1/auth/revoke-all', () => {
    it('kimlik doğrulaması olmadan çağrıldığında 401 dönmeli', async () => {
      const response: SupertestResponse = await request(server)
        .post('/api/v1/auth/revoke-all')
        .expect(401);

      const body = response.body as ApiErrorResponse;
      expect(body.status).toBe('error');
    });

    it('geçerli Bearer token ile kullanıcının tüm oturumlarını sonlandırmalı ve 200 dönmeli', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      const tokens = await tokenService.generateTokens(
        mockUser.id,
        mockUser.email,
        mockUser.role,
      );

      mockPrisma.refreshToken.updateMany.mockResolvedValue({ count: 3 });

      const response: SupertestResponse = await request(server)
        .post('/api/v1/auth/revoke-all')
        .set('Authorization', `Bearer ${tokens.access}`)
        .expect(200);

      const body = response.body as ApiSuccessResponse<{ message: string }>;
      expect(body.status).toBe('success');
      expect(body.data.message).toBe(
        'Tüm aktif oturumlar başarıyla sonlandırıldı.',
      );
      expect(mockPrisma.refreshToken.updateMany).toHaveBeenCalled();
      const revokeAllCall = mockPrisma.refreshToken.updateMany.mock.calls[0] as
        | [
            {
              where: { userId: string; revokedAt: null };
              data: { revokedAt: Date };
            },
          ]
        | undefined;
      expect(revokeAllCall?.[0].where.userId).toBe(mockUser.id);
      expect(revokeAllCall?.[0].where.revokedAt).toBeNull();
      expect(revokeAllCall?.[0].data.revokedAt).toBeInstanceOf(Date);
    });
  });
});
