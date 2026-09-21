import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request, { Response as SupertestResponse } from 'supertest';
import { AppModule } from '../src/app.module';
import {
  CountryResponseDto,
  RegionResponseDto,
  SubregionResponseDto,
} from '../src/locations/interfaces/locations-response.interface';
import { PrismaService } from '../src/prisma/prisma.service';

interface ApiSuccessResponse<T> {
  status: 'success';
  data: T;
}

interface ApiErrorResponse {
  status: 'error';
  message?: string;
}

describe('Locations E2E Test Suite (/api/v1/locations)', () => {
  let app: INestApplication;
  let server: Parameters<typeof request>[0];

  let mockPrisma: {
    country: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
    };
    region: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
    };
    subregion: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
    };
  };

  const mockCountry = { id: 1, name: 'Türkiye' };
  const mockRegion = { id: 1, name: 'İstanbul', countryId: 1 };
  const mockSubregion = { id: 1, name: 'Kadıköy', regionId: 1 };

  beforeAll(async () => {
    mockPrisma = {
      country: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
      region: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
      subregion: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
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

  describe('GET /api/v1/locations/countries', () => {
    it('should list all countries publicly with 200', async () => {
      mockPrisma.country.findMany.mockResolvedValue([mockCountry]);

      const response: SupertestResponse = await request(server)
        .get('/api/v1/locations/countries')
        .expect(200);

      const body = response.body as ApiSuccessResponse<CountryResponseDto[]>;
      expect(body.status).toBe('success');
      expect(body.data).toEqual([mockCountry]);
    });
  });

  describe('GET /api/v1/locations/countries/:countryId/regions', () => {
    it('should list regions for the specified country with 200', async () => {
      mockPrisma.country.findUnique.mockResolvedValue(mockCountry);
      mockPrisma.region.findMany.mockResolvedValue([mockRegion]);

      const response: SupertestResponse = await request(server)
        .get('/api/v1/locations/countries/1/regions')
        .expect(200);

      const body = response.body as ApiSuccessResponse<RegionResponseDto[]>;
      expect(body.status).toBe('success');
      expect(body.data).toEqual([
        {
          id: mockRegion.id,
          name: mockRegion.name,
          country_id: mockRegion.countryId,
        },
      ]);
    });

    it('should return 404 when country is not found', async () => {
      mockPrisma.country.findUnique.mockResolvedValue(null);

      const response: SupertestResponse = await request(server)
        .get('/api/v1/locations/countries/999/regions')
        .expect(404);

      const body = response.body as ApiErrorResponse;
      expect(body.status).toBe('error');
      expect(body.message).toBe('Ülke bulunamadı.');
    });

    it('should return 400 Bad Request for non-numeric countryId (ParseIntPipe)', async () => {
      const response: SupertestResponse = await request(server)
        .get('/api/v1/locations/countries/invalid-id/regions')
        .expect(400);

      const body = response.body as ApiErrorResponse;
      expect(body.status).toBe('error');
    });
  });

  describe('GET /api/v1/locations/regions/:regionId/subregions', () => {
    it('should list subregions for the specified region with 200', async () => {
      mockPrisma.region.findUnique.mockResolvedValue(mockRegion);
      mockPrisma.subregion.findMany.mockResolvedValue([mockSubregion]);

      const response: SupertestResponse = await request(server)
        .get('/api/v1/locations/regions/1/subregions')
        .expect(200);

      const body = response.body as ApiSuccessResponse<SubregionResponseDto[]>;
      expect(body.status).toBe('success');
      expect(body.data).toEqual([
        {
          id: mockSubregion.id,
          name: mockSubregion.name,
          region_id: mockSubregion.regionId,
        },
      ]);
    });

    it('should return 404 when region is not found', async () => {
      mockPrisma.region.findUnique.mockResolvedValue(null);

      const response: SupertestResponse = await request(server)
        .get('/api/v1/locations/regions/999/subregions')
        .expect(404);

      const body = response.body as ApiErrorResponse;
      expect(body.status).toBe('error');
      expect(body.message).toBe('İl bulunamadı.');
    });

    it('should return 400 Bad Request for non-numeric regionId (ParseIntPipe)', async () => {
      const response: SupertestResponse = await request(server)
        .get('/api/v1/locations/regions/invalid-id/subregions')
        .expect(400);

      const body = response.body as ApiErrorResponse;
      expect(body.status).toBe('error');
    });
  });
});
