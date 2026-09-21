import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthProvider, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import request, { Response as SupertestResponse } from 'supertest';
import { AppModule } from '../src/app.module';
import {
  RegisterResponse,
  TokensResponse,
} from '../src/auth/interfaces/auth-response.interface';
import { PrismaService } from '../src/prisma/prisma.service';
import {
  ApiBestSellerProduct,
  ApiPaginatedProducts,
  ApiProductDetail,
  CategoryTree,
} from '../src/products/interfaces/product-response.interface';
import { createMockProduct } from '../src/products/test/products.fixture';
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

describe('Core Flow E2E Integration Suite (Phase 1 Core User Lifecycle)', () => {
  let app: INestApplication;
  let server: Parameters<typeof request>[0];

  let mockPrisma: {
    category: {
      findMany: jest.Mock;
    };
    product: {
      count: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
    };
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

  const mockCategories: CategoryTree[] = [
    {
      id: 'cat-protein',
      name: 'PROTEİN',
      slug: 'protein',
      subCategories: [
        {
          id: 'sub-whey',
          name: 'WHEY PROTEİN',
          slug: 'whey',
          categoryId: 'cat-protein',
        },
      ],
    },
  ];

  const mockProduct = createMockProduct({
    id: 'prod-core-1',
    name: 'WHEY PROTEIN CORE',
    slug: 'whey-protein-core',
    isBestSeller: true,
  });

  const registeredUser = {
    id: 'user-core-uuid',
    email: 'berk.coreflow@example.com',
    passwordHash: '',
    firstName: 'Berk',
    lastName: 'Güngör',
    phoneNumber: null,
    role: Role.customer,
    authProvider: AuthProvider.local,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeAll(async () => {
    testPasswordHash = await bcrypt.hash(testPassword, 10);
    registeredUser.passwordHash = testPasswordHash;

    mockPrisma = {
      category: {
        findMany: jest.fn(),
      },
      product: {
        count: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
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
        transformOptions: { enableImplicitConversion: true },
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

  describe('Phase 1 Integrated User Flow', () => {
    let accessToken: string;
    let refreshToken: string;

    it('1. Public Discovery: Anonymous visitor should list categories and best sellers', async () => {
      mockPrisma.category.findMany.mockResolvedValue(mockCategories);
      mockPrisma.product.findMany.mockResolvedValue([mockProduct]);

      // Kategorileri listele
      const catRes: SupertestResponse = await request(server)
        .get('/api/v1/categories')
        .expect(200);

      const catBody = catRes.body as ApiSuccessResponse<CategoryTree[]>;
      expect(catBody.status).toBe('success');
      expect(catBody.data).toHaveLength(1);
      expect(catBody.data[0].slug).toBe('protein');
      expect(catBody.data[0].subCategories[0].slug).toBe('whey');

      // Çok satanları listele
      const bestRes: SupertestResponse = await request(server)
        .get('/api/v1/products/best-sellers')
        .expect(200);

      const bestBody = bestRes.body as ApiSuccessResponse<
        ApiBestSellerProduct[]
      >;
      expect(bestBody.status).toBe('success');
      expect(bestBody.data).toHaveLength(1);
      expect(bestBody.data[0].name).toBe('WHEY PROTEIN CORE');
    });

    it('2. Product Inspection: Visitor should search with category filter and view details', async () => {
      mockPrisma.product.count.mockResolvedValue(1);
      mockPrisma.product.findMany.mockResolvedValue([mockProduct]);
      mockPrisma.product.findUnique.mockResolvedValue(mockProduct);

      // Kategori filtreli ürün listesi
      const listRes: SupertestResponse = await request(server)
        .get('/api/v1/products?category=whey&limit=10&offset=0')
        .expect(200);

      const listBody = listRes.body as ApiSuccessResponse<ApiPaginatedProducts>;
      expect(listBody.status).toBe('success');
      expect(listBody.data.results).toHaveLength(1);
      expect(listBody.data.results[0].slug).toBe('whey-protein-core');

      // Ürün detay sayfası
      const detailRes: SupertestResponse = await request(server)
        .get('/api/v1/products/whey-protein-core')
        .expect(200);

      const detailBody = detailRes.body as ApiSuccessResponse<ApiProductDetail>;
      expect(detailBody.status).toBe('success');
      expect(detailBody.data.id).toBe('prod-core-1');
      expect(detailBody.data.variants).toHaveLength(1);
      expect(detailBody.data.variants[0].is_available).toBe(true);
    });

    it('3. Security Firewall: Unauthenticated user must not access protected profile (401 Unauthorized)', async () => {
      const response: SupertestResponse = await request(server)
        .get('/api/v1/users/my-account')
        .expect(401);

      const body = response.body as ApiErrorResponse;
      expect(body.status).toBe('error');
      expect(body.message).toBe('Unauthorized');
    });

    it('4. Registration: Invalid password must be rejected, user created with valid data', async () => {
      // 4a. Hatalı şifre (küçük harf yok)
      const invalidRegisterRes: SupertestResponse = await request(server)
        .post('/api/v1/auth/register')
        .send({
          email: registeredUser.email,
          password: 'PASSWORD123',
          password2: 'PASSWORD123',
          first_name: 'Berk',
          last_name: 'Güngör',
        })
        .expect(400);

      const invalidBody = invalidRegisterRes.body as ApiErrorResponse;
      expect(invalidBody.status).toBe('error');
      expect(invalidBody.reason?.password).toBeDefined();

      // 4b. Başarılı kayıt (Prisma select: passwordHash dışlanır)
      const safeCreatedUser = {
        id: registeredUser.id,
        email: registeredUser.email,
        firstName: registeredUser.firstName,
        lastName: registeredUser.lastName,
        role: registeredUser.role,
        authProvider: registeredUser.authProvider,
        createdAt: registeredUser.createdAt,
      };
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue(safeCreatedUser);

      const validRegisterRes: SupertestResponse = await request(server)
        .post('/api/v1/auth/register')
        .send({
          email: registeredUser.email,
          password: testPassword,
          password2: testPassword,
          first_name: 'Berk',
          last_name: 'Güngör',
        })
        .expect(201);

      const validBody =
        validRegisterRes.body as ApiSuccessResponse<RegisterResponse>;
      expect(validBody.status).toBe('success');
      expect(validBody.data.user.email).toBe(registeredUser.email);
      expect(validBody.data.user.firstName).toBe('Berk');
      expect('passwordHash' in validBody.data.user).toBe(false);
    });

    it('5. Login: User should log in and receive access & refresh tokens', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(registeredUser);
      mockPrisma.refreshToken.create.mockResolvedValue({
        id: 'rt-uuid-1',
        tokenHash: 'hash-value',
        userId: registeredUser.id,
      });

      const loginRes: SupertestResponse = await request(server)
        .post('/api/v1/auth/login')
        .send({
          username: registeredUser.email,
          password: testPassword,
        })
        .expect(200);

      const loginBody = loginRes.body as ApiSuccessResponse<TokensResponse>;
      expect(loginBody.status).toBe('success');
      expect(loginBody.data.access).toBeDefined();
      expect(loginBody.data.refresh).toBeDefined();

      accessToken = loginBody.data.access;
      refreshToken = loginBody.data.refresh;
    });

    it('6. Profile Retrieval: Profile details (without leaking passwordHash) should be fetched with Bearer token', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: registeredUser.id,
        email: registeredUser.email,
        firstName: registeredUser.firstName,
        lastName: registeredUser.lastName,
        phoneNumber: registeredUser.phoneNumber,
      });

      const profileRes: SupertestResponse = await request(server)
        .get('/api/v1/users/my-account')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const profileBody = profileRes.body as ApiSuccessResponse<AccountProfile>;
      expect(profileBody.status).toBe('success');
      expect(profileBody.data.id).toBe(registeredUser.id);
      expect(profileBody.data.email).toBe(registeredUser.email);
      expect(profileBody.data.first_name).toBe('Berk');
      expect(profileBody.data.last_name).toBe('Güngör');
      expect(profileBody.data.phone_number).toBeNull();
      expect('passwordHash' in profileBody.data).toBe(false);
    });

    it('7. Profile Update: First name, last name, and phone number should be updatable', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(registeredUser);
      mockPrisma.user.update.mockResolvedValue({
        ...registeredUser,
        firstName: 'Berk Can',
        lastName: 'Güngör',
        phoneNumber: '+905551112233',
      });

      const updateRes: SupertestResponse = await request(server)
        .put('/api/v1/users/my-account')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          first_name: 'Berk Can',
          phone_number: '+905551112233',
        })
        .expect(200);

      const updateBody = updateRes.body as ApiSuccessResponse<AccountProfile>;
      expect(updateBody.status).toBe('success');
      expect(updateBody.data.first_name).toBe('Berk Can');
      expect(updateBody.data.phone_number).toBe('+905551112233');
    });

    it('8. Token Rotation: New token pair should be obtained with refresh token', async () => {
      mockPrisma.refreshToken.findUnique.mockResolvedValue({
        id: 'rt-db-1',
        tokenHash: 'hash',
        userId: registeredUser.id,
        revokedAt: null,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
        user: registeredUser,
      });
      mockPrisma.refreshToken.update.mockResolvedValue({});
      mockPrisma.refreshToken.create.mockResolvedValue({
        id: 'rt-db-2',
        tokenHash: 'new-hash',
        userId: registeredUser.id,
      });

      const refreshRes: SupertestResponse = await request(server)
        .post('/api/v1/auth/token/refresh')
        .send({ refresh: refreshToken })
        .expect(200);

      const refreshBody = refreshRes.body as ApiSuccessResponse<TokensResponse>;
      expect(refreshBody.status).toBe('success');
      expect(typeof refreshBody.data.access).toBe('string');
      expect(typeof refreshBody.data.refresh).toBe('string');
      expect(refreshBody.data.access.length).toBeGreaterThan(10);
      expect(refreshBody.data.refresh.length).toBeGreaterThan(10);
      expect(mockPrisma.refreshToken.update).toHaveBeenCalled();
    });

    it('9. Unauthorized Token Blocker: Requests with invalid/forged token must be blocked with 401', async () => {
      const invalidTokenRes: SupertestResponse = await request(server)
        .get('/api/v1/users/my-account')
        .set('Authorization', 'Bearer invalid.forged.jwt.token')
        .expect(401);

      const invalidBody = invalidTokenRes.body as ApiErrorResponse;
      expect(invalidBody.status).toBe('error');
      expect(invalidBody.message).toBe('Unauthorized');
    });
  });
});
