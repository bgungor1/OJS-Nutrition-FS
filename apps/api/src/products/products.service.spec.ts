import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ProductsService } from './products.service';
import { createMockProduct } from './test/products.fixture';

describe('ProductsService', () => {
  let service: ProductsService;
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

  beforeEach(async () => {
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

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  describe('list', () => {
    it('sayfalama ve varsayılan parametrelerle ürünleri listelemeli', async () => {
      const mockProduct = createMockProduct();
      mockPrisma.product.count.mockResolvedValue(1);
      mockPrisma.product.findMany.mockResolvedValue([mockProduct]);

      const result = await service.list({ limit: 10, offset: 0 });

      expect(mockPrisma.product.count).toHaveBeenCalledWith({ where: {} });
      expect(mockPrisma.product.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { variants: { orderBy: { createdAt: 'asc' } } },
      });

      expect(result.count).toBe(1);
      expect(result.next).toBeNull();
      expect(result.previous).toBeNull();
      expect(result.results).toHaveLength(1);
      expect(result.results[0].name).toBe('WHEY PROTEIN');
      expect(result.results[0].price_info).toEqual({
        total_price: 549,
        discounted_price: 499,
        profit: 50,
        discount_percentage: 9,
        price_per_servings: 31.18,
      });
    });

    it('sayfalama sonraki (next) ve önceki (previous) linklerini üretmeli', async () => {
      mockPrisma.product.count.mockResolvedValue(50);
      mockPrisma.product.findMany.mockResolvedValue([createMockProduct()]);

      const result = await service.list({
        limit: 10,
        offset: 10,
        category: 'protein',
      });

      expect(result.next).toBe('?limit=10&offset=20&category=protein');
      expect(result.previous).toBe('?limit=10&offset=0&category=protein');
    });

    it('kategori filtresi verildiğinde ana ve alt kategoride aramalı', async () => {
      mockPrisma.product.count.mockResolvedValue(0);
      mockPrisma.product.findMany.mockResolvedValue([]);

      await service.list({ limit: 20, offset: 0, category: 'whey' });

      expect(mockPrisma.product.count).toHaveBeenCalledWith({
        where: {
          OR: [
            { mainCategory: { slug: 'whey' } },
            { subCategory: { slug: 'whey' } },
          ],
        },
      });
    });

    it('sort: price_asc ile fiyata göre artan sıralamayı doğru yapmalı', async () => {
      const cheapProduct = createMockProduct({
        id: 'p-cheap',
        name: 'Ucuz Ürün',
        variants: [
          {
            id: 'v-cheap',
            totalPrice: new Prisma.Decimal(200),
            discountedPrice: null,
            pricePerServing: new Prisma.Decimal(10),
            isAvailable: true,
            stockQuantity: 10,
          },
        ],
      });
      const expensiveProduct = createMockProduct({
        id: 'p-exp',
        name: 'Pahalı Ürün',
        variants: [
          {
            id: 'v-exp',
            totalPrice: new Prisma.Decimal(900),
            discountedPrice: null,
            pricePerServing: new Prisma.Decimal(50),
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

      const result = await service.list({
        limit: 10,
        offset: 0,
        sort: 'price_asc',
      });

      expect(result.results[0].name).toBe('Ucuz Ürün');
      expect(result.results[1].name).toBe('Pahalı Ürün');
    });

    it('sort: rating ile puana göre azalan sıralama parametresini iletmeli', async () => {
      mockPrisma.product.count.mockResolvedValue(0);
      mockPrisma.product.findMany.mockResolvedValue([]);

      await service.list({ limit: 10, offset: 0, sort: 'rating' });

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { averageStar: 'desc' },
        }),
      );
    });
  });

  describe('getBySlug', () => {
    it('var olan bir slug için varyantları ve besin değerleri ile detay dönmeli', async () => {
      const mockProduct = createMockProduct();
      mockPrisma.product.findUnique.mockResolvedValue(mockProduct);

      const result = await service.getBySlug('whey-protein');

      expect(mockPrisma.product.findUnique).toHaveBeenCalledWith({
        where: { slug: 'whey-protein' },
        include: { variants: { orderBy: { createdAt: 'asc' } } },
      });

      expect(result.id).toBe('prod-1');
      expect(result.name).toBe('WHEY PROTEIN');
      expect(result.explanation.features).toBe('Yüksek protein\nDüşük yağ');
      expect(result.variants).toHaveLength(1);
      expect(result.variants[0].is_available).toBe(true);
      expect(result.variants[0].size.total_services).toBe(16);
    });

    it('stok 0 veya isAvailable false olduğunda is_available false dönmeli', async () => {
      const outOfStockProduct = createMockProduct({
        variants: [
          {
            id: 'v-oos',
            gram: 400,
            pieces: 1,
            totalServings: 16,
            aroma: 'Muz',
            totalPrice: new Prisma.Decimal(500),
            discountedPrice: null,
            pricePerServing: new Prisma.Decimal(30),
            photoSrc: 'media/test.jpg',
            isAvailable: true,
            stockQuantity: 0, // stok bitti
          },
          {
            id: 'v-disabled',
            gram: 400,
            pieces: 1,
            totalServings: 16,
            aroma: 'Çilek',
            totalPrice: new Prisma.Decimal(500),
            discountedPrice: null,
            pricePerServing: new Prisma.Decimal(30),
            photoSrc: 'media/test.jpg',
            isAvailable: false, // admin kapattı
            stockQuantity: 50,
          },
        ],
      });

      mockPrisma.product.findUnique.mockResolvedValue(outOfStockProduct);

      const result = await service.getBySlug('whey-protein');

      expect(result.variants[0].is_available).toBe(false);
      expect(result.variants[1].is_available).toBe(false);
    });

    it('olmayan bir slug arandığında NotFoundException fırlatmalı', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null);

      await expect(service.getBySlug('olmayan-urun')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('bestSellers', () => {
    it('yalnızca çok satan ürünleri rank sırasıyla dönmeli', async () => {
      const mockProduct = createMockProduct({ isBestSeller: true });
      mockPrisma.product.findMany.mockResolvedValue([mockProduct]);

      const result = await service.bestSellers();

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith({
        where: { isBestSeller: true },
        orderBy: { bestSellerRank: 'asc' },
        include: { variants: { orderBy: { createdAt: 'asc' } } },
      });

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('WHEY PROTEIN');
    });
  });

  describe('categories', () => {
    it('alt kategorileriyle birlikte kategori ağacını dönmeli', async () => {
      const mockCategories = [
        {
          id: 'cat-1',
          name: 'Protein',
          slug: 'protein',
          subCategories: [
            {
              id: 'sub-1',
              name: 'Whey Protein',
              slug: 'whey',
              categoryId: 'cat-1',
            },
          ],
        },
      ];

      mockPrisma.category.findMany.mockResolvedValue(mockCategories);

      const result = await service.categories();

      expect(mockPrisma.category.findMany).toHaveBeenCalledWith({
        include: { subCategories: { orderBy: { name: 'asc' } } },
        orderBy: { name: 'asc' },
      });

      expect(result).toEqual([
        {
          id: 'cat-1',
          name: 'Protein',
          slug: 'protein',
          subCategories: [
            {
              id: 'sub-1',
              name: 'Whey Protein',
              slug: 'whey',
              categoryId: 'cat-1',
            },
          ],
        },
      ]);
    });
  });
});
