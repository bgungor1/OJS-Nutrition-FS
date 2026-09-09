import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '@prisma/client';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { TokenService } from '../src/auth/token.service';
import { PrismaService } from '../src/prisma/prisma.service';
import {
  AddressResponseDto,
  PaginatedAddressesResponseDto,
} from '../src/addresses/interfaces/address-response.interface';

interface ApiSuccess<T> {
  status: 'success';
  data: T;
}

interface ApiError {
  status: 'error';
  message?: string;
  reason?: Record<string, string[]>;
}

describe('Addresses E2E Test Suite (/api/v1/users/addresses)', () => {
  let app: INestApplication;
  let server: Parameters<typeof request>[0];
  let tokenA: string;
  let tokenB: string;

  let mockPrisma: {
    subregion: { findFirst: jest.Mock };
    address: {
      findMany: jest.Mock;
      findFirst: jest.Mock;
      count: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
    user: { findUnique: jest.Mock };
    refreshToken: { create: jest.Mock };
  };

  const mockUserA = {
    id: 'user-uuid-1',
    email: 'usera@example.com',
    role: Role.customer,
  };
  const mockUserB = {
    id: 'user-uuid-2',
    email: 'userb@example.com',
    role: Role.customer,
  };

  const mockAddress = {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    userId: mockUserA.id,
    title: 'Ev Adresim',
    firstName: 'Berkant',
    lastName: 'Güngör',
    countryId: 1,
    regionId: 1,
    subregionId: 1,
    fullAddress: 'Caferağa Mah. Moda Cad. No:12 D:4',
    phoneNumber: '05551234567',
    createdAt: new Date('2026-09-09T12:00:00.000Z'),
    country: { id: 1, name: 'Türkiye' },
    region: { id: 1, name: 'İstanbul', countryId: 1 },
    subregion: { id: 1, name: 'Kadıköy', regionId: 1 },
  };

  const createPayload = {
    title: 'Ev Adresim',
    first_name: 'Berkant',
    last_name: 'Güngör',
    country_id: 1,
    region_id: 1,
    subregion_id: 1,
    full_address: 'Caferağa Mah. Moda Cad. No:12 D:4',
    phone_number: '05551234567',
  };

  const auth = (token = tokenA) => ({
    get: (url: string) =>
      request(server).get(url).set('Authorization', `Bearer ${token}`),
    post: (url: string) =>
      request(server).post(url).set('Authorization', `Bearer ${token}`),
    put: (url: string) =>
      request(server).put(url).set('Authorization', `Bearer ${token}`),
    delete: (url: string) =>
      request(server).delete(url).set('Authorization', `Bearer ${token}`),
  });

  beforeAll(async () => {
    mockPrisma = {
      subregion: { findFirst: jest.fn() },
      address: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      user: { findUnique: jest.fn() },
      refreshToken: { create: jest.fn().mockResolvedValue({ id: 'rt-id' }) },
    };

    const fixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .compile();

    app = fixture.createNestApplication();
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

    const tokenService = fixture.get<TokenService>(TokenService);
    tokenA = (
      await tokenService.generateTokens(
        mockUserA.id,
        mockUserA.email,
        mockUserA.role,
      )
    ).access;
    tokenB = (
      await tokenService.generateTokens(
        mockUserB.id,
        mockUserB.email,
        mockUserB.role,
      )
    ).access;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma.user.findUnique.mockImplementation(
      ({ where }: { where: { id?: string } }) => {
        if (where.id === mockUserA.id) return Promise.resolve(mockUserA);
        if (where.id === mockUserB.id) return Promise.resolve(mockUserB);
        return Promise.resolve(null);
      },
    );
  });

  describe('Yetkilendirme Koruması', () => {
    it('Bearer token olmadan yapılan isteklerde 401 dönmeli', async () => {
      const res = await request(server)
        .get('/api/v1/users/addresses')
        .expect(401);
      expect((res.body as ApiError).status).toBe('error');
    });

    it('Geçersiz Bearer token ile yapılan isteklerde 401 dönmeli', async () => {
      const res = await request(server)
        .get('/api/v1/users/addresses')
        .set('Authorization', 'Bearer invalid')
        .expect(401);
      expect((res.body as ApiError).status).toBe('error');
    });
  });

  describe('POST /api/v1/users/addresses (Adres Oluşturma)', () => {
    it('geçerli veriler ve doğru hiyerarşi ile 201 Created dönmeli', async () => {
      mockPrisma.subregion.findFirst.mockResolvedValue(mockAddress.subregion);
      mockPrisma.address.create.mockResolvedValue(mockAddress);

      const res = await auth()
        .post('/api/v1/users/addresses')
        .send(createPayload)
        .expect(201);
      const body = res.body as ApiSuccess<AddressResponseDto>;

      expect(body.status).toBe('success');
      expect(body.data.id).toBe(mockAddress.id);
      expect(body.data.country).toEqual({ id: 1, name: 'Türkiye' });
      expect(mockPrisma.address.create).toHaveBeenCalledTimes(1);
    });

    it('coğrafi hiyerarşi eşleşmediğinde 400 Bad Request dönmeli', async () => {
      mockPrisma.subregion.findFirst.mockResolvedValue(null);

      const res = await auth()
        .post('/api/v1/users/addresses')
        .send({ ...createPayload, subregion_id: 999 })
        .expect(400);
      expect((res.body as ApiError).message).toBe(
        'Seçilen ilçe, il ve ülke hiyerarşisi birbiriyle eşleşmiyor.',
      );
      expect(mockPrisma.address.create).not.toHaveBeenCalled();
    });

    it('zorunlu alanlar eksik olduğunda 400 Bad Request dönmeli', async () => {
      const res = await auth()
        .post('/api/v1/users/addresses')
        .send({ first_name: 'Berkant' })
        .expect(400);
      expect((res.body as ApiError).status).toBe('error');
    });

    it('geçersiz telefon formatında 400 Bad Request dönmeli', async () => {
      const res = await auth()
        .post('/api/v1/users/addresses')
        .send({ ...createPayload, phone_number: '123' })
        .expect(400);
      expect((res.body as ApiError).status).toBe('error');
    });

    it('yasaklı alan gönderildiğinde (forbidNonWhitelisted) 400 dönmeli', async () => {
      const res = await auth()
        .post('/api/v1/users/addresses')
        .send({ ...createPayload, userId: 'evil' })
        .expect(400);
      expect((res.body as ApiError).status).toBe('error');
    });
  });

  describe('GET /api/v1/users/addresses (Adres Listeleme & Sayfalama)', () => {
    it('kullanıcı adreslerini sayfalı ve toplam count ile 200 dönmeli', async () => {
      mockPrisma.address.findMany.mockResolvedValue([mockAddress]);
      mockPrisma.address.count.mockResolvedValue(1);

      const res = await auth()
        .get('/api/v1/users/addresses?limit=10&offset=0')
        .expect(200);
      const body = res.body as ApiSuccess<PaginatedAddressesResponseDto>;

      expect(body.status).toBe('success');
      expect(body.data.count).toBe(1);
      expect(body.data.results[0].id).toBe(mockAddress.id);
    });

    it('limit 100 üstü olduğunda 400 Bad Request dönmeli', async () => {
      const res = await auth()
        .get('/api/v1/users/addresses?limit=150')
        .expect(400);
      expect((res.body as ApiError).status).toBe('error');
    });
  });

  describe('GET /api/v1/users/addresses/:id (Adres Detay & IDOR)', () => {
    it('kullanıcı kendi adres detayını başarıyla 200 ile alabilmeli', async () => {
      mockPrisma.address.findFirst.mockResolvedValue(mockAddress);

      const res = await auth()
        .get(`/api/v1/users/addresses/${mockAddress.id}`)
        .expect(200);
      expect((res.body as ApiSuccess<AddressResponseDto>).data.id).toBe(
        mockAddress.id,
      );
    });

    it('IDOR: farklı kullanıcı adresi istediğinde 404 dönmeli (403 değil)', async () => {
      mockPrisma.address.findFirst.mockResolvedValue(null);

      const res = await auth(tokenB)
        .get(`/api/v1/users/addresses/${mockAddress.id}`)
        .expect(404);
      expect((res.body as ApiError).message).toBe('Adres bulunamadı.');
    });

    it('geçersiz UUID formatı için 400 dönmeli (ParseUUIDPipe)', async () => {
      const res = await auth()
        .get('/api/v1/users/addresses/invalid-uuid')
        .expect(400);
      expect((res.body as ApiError).status).toBe('error');
    });
  });

  describe('PUT /api/v1/users/addresses/:id (Adres Güncelleme & IDOR)', () => {
    it('kullanıcı kendi adresini başarıyla güncelleyebilmeli ve 200 dönmeli', async () => {
      mockPrisma.address.findFirst.mockResolvedValue(mockAddress);
      mockPrisma.address.update.mockResolvedValue({
        ...mockAddress,
        title: 'İş',
      });

      const res = await auth()
        .put(`/api/v1/users/addresses/${mockAddress.id}`)
        .send({ title: 'İş' })
        .expect(200);
      expect((res.body as ApiSuccess<AddressResponseDto>).data.title).toBe(
        'İş',
      );
    });

    it('IDOR: başkasının adresi güncellenmek istendiğinde 404 dönmeli', async () => {
      mockPrisma.address.findFirst.mockResolvedValue(null);

      await auth(tokenB)
        .put(`/api/v1/users/addresses/${mockAddress.id}`)
        .send({ title: 'Hack' })
        .expect(404);
      expect(mockPrisma.address.update).not.toHaveBeenCalled();
    });

    it('lokasyon güncellemesinde geçersiz hiyerarşi için 400 dönmeli', async () => {
      mockPrisma.address.findFirst.mockResolvedValue(mockAddress);
      mockPrisma.subregion.findFirst.mockResolvedValue(null);

      const res = await auth()
        .put(`/api/v1/users/addresses/${mockAddress.id}`)
        .send({ subregion_id: 999 })
        .expect(400);
      expect((res.body as ApiError).message).toBe(
        'Seçilen ilçe, il ve ülke hiyerarşisi birbiriyle eşleşmiyor.',
      );
    });
  });

  describe('DELETE /api/v1/users/addresses/:id (Adres Silme & IDOR)', () => {
    it('IDOR: başkasının adresi silinmek istendiğinde 404 dönmeli', async () => {
      mockPrisma.address.findFirst.mockResolvedValue(null);

      await auth(tokenB)
        .delete(`/api/v1/users/addresses/${mockAddress.id}`)
        .expect(404);
      expect(mockPrisma.address.delete).not.toHaveBeenCalled();
    });

    it('kullanıcı kendi adresini sildiğinde 200 ve { id } dönmeli', async () => {
      mockPrisma.address.findFirst.mockResolvedValue(mockAddress);
      mockPrisma.address.delete.mockResolvedValue(mockAddress);

      const res = await auth()
        .delete(`/api/v1/users/addresses/${mockAddress.id}`)
        .expect(200);
      expect((res.body as ApiSuccess<{ id: string }>).data).toEqual({
        id: mockAddress.id,
      });
    });

    it('silinmiş adrese sonraki istekte 404 Not Found dönmeli', async () => {
      mockPrisma.address.findFirst.mockResolvedValue(null);

      const res = await auth()
        .get(`/api/v1/users/addresses/${mockAddress.id}`)
        .expect(404);
      expect((res.body as ApiError).message).toBe('Adres bulunamadı.');
    });

    it('geçersiz UUID formatı için 400 dönmeli (ParseUUIDPipe)', async () => {
      const res = await auth()
        .delete('/api/v1/users/addresses/invalid-uuid-123')
        .expect(400);
      expect((res.body as ApiError).status).toBe('error');
    });
  });
});
