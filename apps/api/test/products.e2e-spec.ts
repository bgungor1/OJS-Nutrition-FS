import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import request, { Response as SupertestResponse } from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import {
  ApiBestSellerProduct,
  ApiPaginatedProducts,
  ApiProductDetail,
  CategoryTree,
} from '../src/products/interfaces/product-response.interface';
import { createMockProduct } from '../src/products/test/products.fixture';

interface ApiSuccessResponse<T> {
  status: 'success';
  data: T;
}

interface ApiErrorResponse {
  status: 'error';
  message?: string;
  reason?: Record<string, string[]>;
}

describe('Products E2E Test Suite (/api/v1/products & /api/v1/categories)', () => {
  let app: INestApplication;
  let server: Parameters<typeof request>[0];

  let mockPrisma: {
    product: {
      count: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
    };
    category: {
      findMany: jest.Mock;
    };
  };

  const sampleProduct = createMockProduct();

  const mockCategoriesFromDb = [
    {
      id: 'cat-1',
      name: 'PROTEİN',
      slug: 'protein',
      subCategories: [
        {
          id: 'sub-1',
          name: 'WHEY PROTEİN',
          slug: 'whey-protein',
          categoryId: 'cat-1',
        },
        {
          id: 'sub-2',
          name: 'İZOLE PROTEİN',
          slug: 'izole-protein',
          categoryId: 'cat-1',
        },
      ],
    },
    {
      id: 'cat-2',
      name: 'VİTAMİNLER',
      slug: 'vitaminler',
      subCategories: [],
    },
  ];

  beforeAll(async () => {
    mockPrisma = {
      product: {
        count: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
      category: {
        findMany: jest.fn(),
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

  describe('GET /api/v1/products (Ürün Listesi & Sayfalama & Sıralama)', () => {
    it('Token olmadan public olarak 200 OK ve standart zarfta sayfalanmış liste dönmeli', async () => {
      mockPrisma.product.count.mockResolvedValue(1);
      mockPrisma.product.findMany.mockResolvedValue([sampleProduct]);

      const response: SupertestResponse = await request(server)
        .get('/api/v1/products')
        .expect(200);

      const body = response.body as ApiSuccessResponse<ApiPaginatedProducts>;
      expect(body.status).toBe('success');
      expect(body.data.count).toBe(1);
      expect(body.data.next).toBeNull();
      expect(body.data.previous).toBeNull();
      expect(body.data.results).toHaveLength(1);

      const item = body.data.results[0];
      expect(item.id).toBe('prod-1');
      expect(item.name).toBe('WHEY PROTEIN');
      expect(item.slug).toBe('whey-protein');
      expect(item.price_info).toEqual({
        total_price: 549,
        discounted_price: 499,
        profit: 50,
        discount_percentage: 9,
        price_per_servings: 31.18,
      });
      expect(item.photo_src).toBe('media/products/whey-protein.jpg');
    });

    it('limit ve offset query parametreleri ile sayfalama linklerini üretmeli', async () => {
      mockPrisma.product.count.mockResolvedValue(50);
      mockPrisma.product.findMany.mockResolvedValue([sampleProduct]);

      const response: SupertestResponse = await request(server)
        .get('/api/v1/products?limit=10&offset=10&category=protein')
        .expect(200);

      const body = response.body as ApiSuccessResponse<ApiPaginatedProducts>;
      expect(body.data.count).toBe(50);
      expect(body.data.next).toBe('?limit=10&offset=20&category=protein');
      expect(body.data.previous).toBe('?limit=10&offset=0&category=protein');
    });

    it('kategori filtresi verildiğinde Prisma sorgusuna kategori OR filtresi eklemeli', async () => {
      mockPrisma.product.count.mockResolvedValue(0);
      mockPrisma.product.findMany.mockResolvedValue([]);

      await request(server)
        .get('/api/v1/products?category=creatine')
        .expect(200);

      const expectedWhere = {
        OR: [
          { mainCategory: { slug: 'creatine' } },
          { subCategory: { slug: 'creatine' } },
        ],
      };
      expect(mockPrisma.product.count).toHaveBeenCalledWith({
        where: expectedWhere,
      });
      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expectedWhere,
        }),
      );
    });

    it('sort=price_asc ile ürünleri en düşük fiyata göre artan sırada listelemeli', async () => {
      const cheapProduct = createMockProduct({
        id: 'prod-cheap',
        name: 'UCUZ URUN',
        variants: [
          {
            id: 'v-cheap',
            totalPrice: new Prisma.Decimal(200),
            discountedPrice: null,
            pricePerServing: new Prisma.Decimal(10),
            photoSrc: '',
            isAvailable: true,
            stockQuantity: 10,
          },
        ],
      });
      const expensiveProduct = createMockProduct({
        id: 'prod-exp',
        name: 'PAHALI URUN',
        variants: [
          {
            id: 'v-exp',
            totalPrice: new Prisma.Decimal(800),
            discountedPrice: null,
            pricePerServing: new Prisma.Decimal(40),
            photoSrc: '',
            isAvailable: true,
            stockQuantity: 10,
          },
        ],
      });

      mockPrisma.product.count.mockResolvedValue(2);
      mockPrisma.product.findMany.mockResolvedValue([
        expensiveProduct,
        cheapProduct,
      ]);

      const response: SupertestResponse = await request(server)
        .get('/api/v1/products?sort=price_asc')
        .expect(200);

      const body = response.body as ApiSuccessResponse<ApiPaginatedProducts>;
      expect(body.data.results).toHaveLength(2);
      expect(body.data.results[0].id).toBe('prod-cheap');
      expect(body.data.results[1].id).toBe('prod-exp');
    });

    it('sort=rating ile averageStar azalan sırada sorgu yapmalı', async () => {
      mockPrisma.product.count.mockResolvedValue(1);
      mockPrisma.product.findMany.mockResolvedValue([sampleProduct]);

      await request(server).get('/api/v1/products?sort=rating').expect(200);

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { averageStar: 'desc' },
        }),
      );
    });

    it('Güvenlik: Whitelist dışı geçersiz sıralama parametresinde 400 Bad Request dönmeli (Query DoS engeli)', async () => {
      const response: SupertestResponse = await request(server)
        .get('/api/v1/products?sort=malicious_sql_injection')
        .expect(400);

      const body = response.body as ApiErrorResponse;
      expect(body.status).toBe('error');
      expect(body.reason).toBeDefined();
      expect(body.reason?.sort).toBeDefined();
    });

    it('Güvenlik: limit değeri negatif veya sınır (100) üstünde verildiğinde 400 dönmeli', async () => {
      const negativeLimitRes: SupertestResponse = await request(server)
        .get('/api/v1/products?limit=0')
        .expect(400);

      expect((negativeLimitRes.body as ApiErrorResponse).status).toBe('error');

      const maxLimitRes: SupertestResponse = await request(server)
        .get('/api/v1/products?limit=150')
        .expect(400);

      expect((maxLimitRes.body as ApiErrorResponse).status).toBe('error');
    });
  });

  describe('GET /api/v1/products/best-sellers (Çok Satan Ürünler)', () => {
    it('Token olmadan public olarak çok satanları dönmeli ve id içermemeli', async () => {
      mockPrisma.product.findMany.mockResolvedValue([sampleProduct]);

      const response: SupertestResponse = await request(server)
        .get('/api/v1/products/best-sellers')
        .expect(200);

      const body = response.body as ApiSuccessResponse<ApiBestSellerProduct[]>;
      expect(body.status).toBe('success');
      expect(body.data).toHaveLength(1);

      const bestSeller = body.data[0];
      expect(bestSeller.name).toBe('WHEY PROTEIN');
      expect(bestSeller.slug).toBe('whey-protein');
      expect(bestSeller.price_info.total_price).toBe(549);
      expect('id' in bestSeller).toBe(false);

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith({
        where: { isBestSeller: true },
        orderBy: { bestSellerRank: 'asc' },
        include: {
          variants: { orderBy: { createdAt: 'asc' } },
        },
      });
    });
  });

  describe('GET /api/v1/products/:slug (Ürün Detayı)', () => {
    it('Mevcut slug ile çağrıldığında 200 OK ve varyant detaylarını dönmeli', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(sampleProduct);

      const response: SupertestResponse = await request(server)
        .get('/api/v1/products/whey-protein')
        .expect(200);

      const body = response.body as ApiSuccessResponse<ApiProductDetail>;
      expect(body.status).toBe('success');
      expect(body.data.id).toBe('prod-1');
      expect(body.data.name).toBe('WHEY PROTEIN');
      expect(body.data.explanation.usage).toBe('1 ölçek su ile karıştırılır');
      expect(body.data.variants).toHaveLength(1);

      const variant = body.data.variants[0];
      expect(variant.id).toBe('var-1');
      expect(variant.size.gram).toBe(400);
      expect(variant.is_available).toBe(true);
      expect(variant.price.profit).toBe(50);
    });

    it('Bulunamayan slug ile çağrıldığında 404 Not Found dönmeli', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null);

      const response: SupertestResponse = await request(server)
        .get('/api/v1/products/olmayan-urun-slug')
        .expect(404);

      const body = response.body as ApiErrorResponse;
      expect(body.status).toBe('error');
      expect(body.message).toContain('"olmayan-urun-slug"');
    });
  });

  describe('GET /api/v1/categories (Kategori Ağacı)', () => {
    it('Token olmadan public olarak hiyerarşik kategori ağacını dönmeli', async () => {
      mockPrisma.category.findMany.mockResolvedValue(mockCategoriesFromDb);

      const response: SupertestResponse = await request(server)
        .get('/api/v1/categories')
        .expect(200);

      const body = response.body as ApiSuccessResponse<CategoryTree[]>;
      expect(body.status).toBe('success');
      expect(body.data).toHaveLength(2);

      const proteinCat = body.data[0];
      expect(proteinCat.name).toBe('PROTEİN');
      expect(proteinCat.slug).toBe('protein');
      expect(proteinCat.subCategories).toHaveLength(2);
      expect(proteinCat.subCategories[0].name).toBe('WHEY PROTEİN');

      const vitaminCat = body.data[1];
      expect(vitaminCat.name).toBe('VİTAMİNLER');
      expect(vitaminCat.subCategories).toHaveLength(0);
    });
  });
});
