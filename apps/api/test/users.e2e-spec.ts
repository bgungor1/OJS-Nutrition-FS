import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthProvider, Role } from '@prisma/client';
import request, { Response as SupertestResponse } from 'supertest';
import { AppModule } from '../src/app.module';
import { TokenService } from '../src/auth/token.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { AccountProfile } from '../src/users/interfaces/account-profile.interface';

interface ApiSuccessResponse<T> {
  status: 'success';
  data: T;
}

interface ApiErrorResponse {
  status: 'error';
  message?: string;
  reason?: Record<string, string[]>;
}

describe('Users E2E Test Suite (/api/v1/users)', () => {
  let app: INestApplication;
  let server: Parameters<typeof request>[0];
  let tokenService: TokenService;
  let validAccessToken: string;

  let mockPrisma: {
    user: {
      findUnique: jest.Mock;
      update: jest.Mock;
    };
    refreshToken: {
      create: jest.Mock;
    };
  };

  const mockUser = {
    id: 'user-uuid-1',
    email: 'berk@example.com',
    passwordHash: '$2b$10$dummyhashedpasswordvalue',
    firstName: 'Berk',
    lastName: 'Güngör',
    phoneNumber: '+905551112233',
    role: Role.customer,
    authProvider: AuthProvider.local,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeAll(async () => {
    mockPrisma = {
      user: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      refreshToken: {
        create: jest.fn().mockResolvedValue({ id: 'rt-id' }),
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

    tokenService = moduleFixture.get<TokenService>(TokenService);
    const tokens = await tokenService.generateTokens(
      mockUser.id,
      mockUser.email,
      mockUser.role,
    );
    validAccessToken = tokens.access;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/users/my-account (Profil Görüntüleme)', () => {
    it('Bearer token olmadan yapılan isteklerde 401 Unauthorized dönmeli', async () => {
      const response: SupertestResponse = await request(server)
        .get('/api/v1/users/my-account')
        .expect(401);

      const body = response.body as ApiErrorResponse;
      expect(body.status).toBe('error');
    });

    it('geçersiz Bearer token ile yapılan isteklerde 401 Unauthorized dönmeli', async () => {
      const response: SupertestResponse = await request(server)
        .get('/api/v1/users/my-account')
        .set('Authorization', 'Bearer invalid.token.value')
        .expect(401);

      const body = response.body as ApiErrorResponse;
      expect(body.status).toBe('error');
    });

    it('geçerli Bearer token ile 200 ve güvenli AccountProfile dönmeli (passwordHash sızdırılmamalı)', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const response: SupertestResponse = await request(server)
        .get('/api/v1/users/my-account')
        .set('Authorization', `Bearer ${validAccessToken}`)
        .expect(200);

      const body = response.body as ApiSuccessResponse<AccountProfile>;

      expect(body.status).toBe('success');
      expect(body.data).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        first_name: mockUser.firstName,
        last_name: mockUser.lastName,
        phone_number: mockUser.phoneNumber,
      });

      expect('passwordHash' in body.data).toBe(false);
      expect('role' in body.data).toBe(false);
      expect('authProvider' in body.data).toBe(false);
    });

    it('kullanıcı veritabanından silinmişse 401 veya 404 dönmeli', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await request(server)
        .get('/api/v1/users/my-account')
        .set('Authorization', `Bearer ${validAccessToken}`)
        .expect(401);
    });
  });

  describe('PUT /api/v1/users/my-account (Profil Güncelleme)', () => {
    it('Bearer token olmadan yapılan güncelleme isteğinde 401 dönmeli', async () => {
      const response: SupertestResponse = await request(server)
        .put('/api/v1/users/my-account')
        .send({ first_name: 'YeniAd' })
        .expect(401);

      const body = response.body as ApiErrorResponse;
      expect(body.status).toBe('error');
    });

    it('geçerli verilerle profil başarıyla güncellenmeli ve 200 dönmeli', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.user.update.mockResolvedValue({
        ...mockUser,
        firstName: 'Ahmet',
        lastName: 'Yılmaz',
        phoneNumber: '+905559998877',
      });

      const updatePayload = {
        first_name: 'Ahmet',
        last_name: 'Yılmaz',
        phone_number: '+905559998877',
      };

      const response: SupertestResponse = await request(server)
        .put('/api/v1/users/my-account')
        .set('Authorization', `Bearer ${validAccessToken}`)
        .send(updatePayload)
        .expect(200);

      const body = response.body as ApiSuccessResponse<AccountProfile>;

      expect(body.status).toBe('success');
      expect(body.data).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        first_name: 'Ahmet',
        last_name: 'Yılmaz',
        phone_number: '+905559998877',
      });

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: {
          firstName: 'Ahmet',
          lastName: 'Yılmaz',
          phoneNumber: '+905559998877',
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phoneNumber: true,
        },
      });
    });

    it('kısmi güncellemede sadece verilen alan güncellenmeli', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.user.update.mockResolvedValue({
        ...mockUser,
        phoneNumber: '+905554443322',
      });

      const response: SupertestResponse = await request(server)
        .put('/api/v1/users/my-account')
        .set('Authorization', `Bearer ${validAccessToken}`)
        .send({ phone_number: '+905554443322' })
        .expect(200);

      const body = response.body as ApiSuccessResponse<AccountProfile>;

      expect(body.status).toBe('success');
      expect(body.data.phone_number).toBe('+905554443322');
      expect(body.data.first_name).toBe(mockUser.firstName);
      expect(body.data.last_name).toBe(mockUser.lastName);
    });

    it('ad 2 karakterden kısa olduğunda 400 Bad Request dönmeli', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const response: SupertestResponse = await request(server)
        .put('/api/v1/users/my-account')
        .set('Authorization', `Bearer ${validAccessToken}`)
        .send({ first_name: 'A' })
        .expect(400);

      const body = response.body as ApiErrorResponse;
      expect(body.status).toBe('error');
      expect(body.reason).toBeDefined();
    });

    it('geçersiz telefon numarası formatında 400 Bad Request dönmeli', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const response: SupertestResponse = await request(server)
        .put('/api/v1/users/my-account')
        .set('Authorization', `Bearer ${validAccessToken}`)
        .send({ phone_number: 'gecersiz-telefon-harfler' })
        .expect(400);

      const body = response.body as ApiErrorResponse;
      expect(body.status).toBe('error');
      expect(body.reason).toBeDefined();
    });

    it('yasaklı alanlar (email, role) gönderildiğinde forbidNonWhitelisted gereği 400 dönmeli', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const response: SupertestResponse = await request(server)
        .put('/api/v1/users/my-account')
        .set('Authorization', `Bearer ${validAccessToken}`)
        .send({
          first_name: 'Hakan',
          email: 'changed@example.com',
          role: 'admin',
        })
        .expect(400);

      const body = response.body as ApiErrorResponse;
      expect(body.status).toBe('error');
      expect(body.reason).toBeDefined();
    });
  });
});
