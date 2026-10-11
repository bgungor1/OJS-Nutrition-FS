import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PRODUCT_CARD_SELECT } from './products.constants';
import { ProductsService } from './products.service';
import { createMockProduct, createMockVariant } from './test/products.fixture';

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
    $queryRaw?: jest.Mock;
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
    it('should list products with pagination and default parameters', async () => {
      mockPrisma.product.count.mockResolvedValue(1);
      mockPrisma.product.findMany.mockResolvedValue([createMockProduct()]);

      const result = await service.list({ limit: 10, offset: 0 });

      expect(mockPrisma.product.count).toHaveBeenCalledWith({ where: {} });
      expect(result.count).toBe(1);
      expect(result.results).toHaveLength(1);
      expect(result.results[0].name).toBe('WHEY PROTEIN');
    });

    it('should query products using PRODUCT_CARD_SELECT to prevent over-fetching', async () => {
      mockPrisma.product.count.mockResolvedValue(1);
      mockPrisma.product.findMany.mockResolvedValue([createMockProduct()]);

      await service.list({ limit: 10, offset: 0 });

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          select: PRODUCT_CARD_SELECT,
        }),
      );
    });

    it('should generate next and previous pagination links when applicable', async () => {
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

    it('should filter by search query term with case-insensitive contains', async () => {
      mockPrisma.product.count.mockResolvedValue(0);
      mockPrisma.product.findMany.mockResolvedValue([]);

      await service.list({ limit: 20, offset: 0, search: 'protein' });

      expect(mockPrisma.product.count).toHaveBeenCalledWith({
        where: {
          OR: [
            { name: { contains: 'protein', mode: 'insensitive' } },
            { shortExplanation: { contains: 'protein', mode: 'insensitive' } },
            { slug: { contains: 'protein', mode: 'insensitive' } },
            { description: { contains: 'protein', mode: 'insensitive' } },
          ],
        },
      });
    });

    it('should combine category and search filters with AND logic', async () => {
      mockPrisma.product.count.mockResolvedValue(0);
      mockPrisma.product.findMany.mockResolvedValue([]);

      await service.list({
        limit: 20,
        offset: 0,
        category: 'protein',
        search: 'whey',
      });

      expect(mockPrisma.product.count).toHaveBeenCalledWith({
        where: {
          AND: [
            {
              OR: [
                { mainCategory: { slug: 'protein' } },
                { subCategory: { slug: 'protein' } },
              ],
            },
            {
              OR: [
                { name: { contains: 'whey', mode: 'insensitive' } },
                { shortExplanation: { contains: 'whey', mode: 'insensitive' } },
                { slug: { contains: 'whey', mode: 'insensitive' } },
                { description: { contains: 'whey', mode: 'insensitive' } },
              ],
            },
          ],
        },
      });
    });

    it('should preserve search parameter in pagination links', async () => {
      mockPrisma.product.count.mockResolvedValue(30);
      mockPrisma.product.findMany.mockResolvedValue([createMockProduct()]);

      const result = await service.list({
        limit: 10,
        offset: 10,
        search: 'isolate',
      });

      expect(result.next).toBe('?limit=10&offset=20&search=isolate');
      expect(result.previous).toBe('?limit=10&offset=0&search=isolate');
    });

    it('should sort in-memory correctly for price_asc and price_desc', async () => {
      const cheap = createMockProduct({
        id: 'p-cheap',
        name: 'Cheap',
        variants: [
          createMockVariant({
            id: 'v-cheap',
            totalPrice: new Prisma.Decimal(200),
            discountedPrice: null,
          }),
        ],
      });
      const expensive = createMockProduct({
        id: 'p-exp',
        name: 'Expensive',
        variants: [
          createMockVariant({
            id: 'v-exp',
            totalPrice: new Prisma.Decimal(900),
            discountedPrice: null,
          }),
        ],
      });

      mockPrisma.product.count.mockResolvedValue(2);
      mockPrisma.product.findMany.mockResolvedValue([expensive, cheap]);

      const ascResult = await service.list({
        limit: 10,
        offset: 0,
        sort: 'price_asc',
      });
      expect(ascResult.results[0].name).toBe('Cheap');

      const descResult = await service.list({
        limit: 10,
        offset: 0,
        sort: 'price_desc',
      });
      expect(descResult.results[0].name).toBe('Expensive');
    });

    it('should sort at database level via $queryRaw when available', async () => {
      const cheap = createMockProduct({
        id: 'p-cheap',
        name: 'Cheap',
        variants: [
          createMockVariant({
            id: 'v-cheap',
            totalPrice: new Prisma.Decimal(200),
          }),
        ],
      });
      const expensive = createMockProduct({
        id: 'p-exp',
        name: 'Expensive',
        variants: [
          createMockVariant({
            id: 'v-exp',
            totalPrice: new Prisma.Decimal(900),
          }),
        ],
      });

      mockPrisma.product.count.mockResolvedValue(2);
      mockPrisma.$queryRaw = jest
        .fn()
        .mockResolvedValue([{ id: 'p-cheap' }, { id: 'p-exp' }]);
      mockPrisma.product.findMany.mockResolvedValue([expensive, cheap]);

      const result = await service.list({
        limit: 10,
        offset: 0,
        sort: 'price_asc',
      });

      expect(mockPrisma.$queryRaw).toHaveBeenCalled();
      expect(result.results[0].name).toBe('Cheap');
      expect(result.results[1].name).toBe('Expensive');
    });

    it('should pass rating sort as orderBy averageStar desc', async () => {
      mockPrisma.product.count.mockResolvedValue(0);
      mockPrisma.product.findMany.mockResolvedValue([]);

      await service.list({ limit: 10, offset: 0, sort: 'rating' });

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { averageStar: 'desc' } }),
      );
    });

    it('should pass newest sort as orderBy createdAt desc', async () => {
      mockPrisma.product.count.mockResolvedValue(0);
      mockPrisma.product.findMany.mockResolvedValue([]);

      await service.list({ limit: 10, offset: 0, sort: 'newest' });

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { createdAt: 'desc' } }),
      );
    });

    it('should execute count and findMany concurrently via Promise.all', async () => {
      let countStarted = false;
      let findManyStarted = false;
      let countResolvedConcurrently = false;

      mockPrisma.product.count.mockImplementation(async () => {
        countStarted = true;
        await new Promise((resolve) => setTimeout(resolve, 10));
        countResolvedConcurrently = findManyStarted;
        return 1;
      });

      mockPrisma.product.findMany.mockImplementation(async () => {
        findManyStarted = true;
        await new Promise((resolve) => setTimeout(resolve, 10));
        return [createMockProduct()];
      });

      const result = await service.list({ limit: 10, offset: 0 });

      expect(countStarted).toBe(true);
      expect(findManyStarted).toBe(true);
      expect(countResolvedConcurrently).toBe(true);
      expect(result.count).toBe(1);
      expect(result.results).toHaveLength(1);
    });

    it('should execute count and $queryRaw concurrently during price sorting', async () => {
      let countStarted = false;
      let queryRawStarted = false;
      let queryRawStartedDuringCount = false;

      mockPrisma.product.count.mockImplementation(async () => {
        countStarted = true;
        await new Promise((resolve) => setTimeout(resolve, 10));
        queryRawStartedDuringCount = queryRawStarted;
        return 2;
      });

      mockPrisma.$queryRaw = jest.fn().mockImplementation(async () => {
        queryRawStarted = true;
        await new Promise((resolve) => setTimeout(resolve, 10));
        return [{ id: 'p1' }];
      });

      mockPrisma.product.findMany.mockResolvedValue([
        createMockProduct({ id: 'p1' }),
      ]);

      const result = await service.list({
        limit: 10,
        offset: 0,
        sort: 'price_asc',
      });

      expect(countStarted).toBe(true);
      expect(queryRawStarted).toBe(true);
      expect(queryRawStartedDuringCount).toBe(true);
      expect(result.count).toBe(2);
      expect(result.results).toHaveLength(1);
    });
  });

  describe('bestSellers', () => {
    it('should return products flagged as best seller ordered by rank', async () => {
      mockPrisma.product.findMany.mockResolvedValue([createMockProduct()]);

      const result = await service.bestSellers();

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith({
        where: { isBestSeller: true },
        orderBy: { bestSellerRank: 'asc' },
        select: PRODUCT_CARD_SELECT,
      });
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('WHEY PROTEIN');
    });
  });

  describe('getBySlug', () => {
    it('should return product detail for existing slug', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(createMockProduct());

      const result = await service.getBySlug('whey-protein');

      expect(result.id).toBe('prod-1');
      expect(result.name).toBe('WHEY PROTEIN');
      expect(result.variants).toHaveLength(1);
    });

    it('should throw NotFoundException for non-existent slug', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null);

      await expect(service.getBySlug('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('categories', () => {
    it('should return hierarchical category tree', async () => {
      mockPrisma.category.findMany.mockResolvedValue([
        {
          id: 'cat-1',
          name: 'Protein',
          slug: 'protein',
          subCategories: [
            { id: 'sub-1', name: 'Whey', slug: 'whey', categoryId: 'cat-1' },
          ],
        },
      ]);

      const result = await service.categories();

      expect(result).toEqual([
        {
          id: 'cat-1',
          name: 'Protein',
          slug: 'protein',
          subCategories: [
            { id: 'sub-1', name: 'Whey', slug: 'whey', categoryId: 'cat-1' },
          ],
        },
      ]);
    });
  });

  describe('caching behavior', () => {
    let cachedService: ProductsService;
    let mockCache: {
      get: jest.Mock;
      set: jest.Mock;
      del: jest.Mock;
    };

    beforeEach(async () => {
      mockCache = {
        get: jest.fn(),
        set: jest.fn(),
        del: jest.fn().mockResolvedValue(true),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          ProductsService,
          { provide: PrismaService, useValue: mockPrisma },
          { provide: 'CACHE_MANAGER', useValue: mockCache },
        ],
      }).compile();

      cachedService = module.get<ProductsService>(ProductsService);
    });

    it('should return cached bestSellers without database query on cache hit', async () => {
      const cachedBestSellers = [{ id: 'p-1', name: 'Best Seller' }];
      mockCache.get.mockResolvedValue(cachedBestSellers);

      const result = await cachedService.bestSellers();

      expect(result).toEqual(cachedBestSellers);
      expect(mockCache.get).toHaveBeenCalledWith('products:best-sellers');
      expect(mockPrisma.product.findMany).not.toHaveBeenCalled();
    });

    it('should query database and set cache on bestSellers cache miss', async () => {
      mockCache.get.mockResolvedValue(undefined);
      mockPrisma.product.findMany.mockResolvedValue([createMockProduct()]);

      const result = await cachedService.bestSellers();

      expect(result).toHaveLength(1);
      expect(mockCache.get).toHaveBeenCalledWith('products:best-sellers');
      expect(mockPrisma.product.findMany).toHaveBeenCalled();
      expect(mockCache.set).toHaveBeenCalledWith(
        'products:best-sellers',
        expect.any(Array),
        5 * 60 * 1000,
      );
    });

    it('should return cached categories without database query on cache hit', async () => {
      const cachedTree = [
        { id: 'c-1', name: 'Cat', slug: 'cat', subCategories: [] },
      ];
      mockCache.get.mockResolvedValue(cachedTree);

      const result = await cachedService.categories();

      expect(result).toEqual(cachedTree);
      expect(mockCache.get).toHaveBeenCalledWith('products:categories');
      expect(mockPrisma.category.findMany).not.toHaveBeenCalled();
    });

    it('should query database and set cache on categories cache miss', async () => {
      mockCache.get.mockResolvedValue(undefined);
      mockPrisma.category.findMany.mockResolvedValue([
        {
          id: 'cat-1',
          name: 'Protein',
          slug: 'protein',
          subCategories: [],
        },
      ]);

      const result = await cachedService.categories();

      expect(result).toHaveLength(1);
      expect(mockCache.get).toHaveBeenCalledWith('products:categories');
      expect(mockPrisma.category.findMany).toHaveBeenCalled();
      expect(mockCache.set).toHaveBeenCalledWith(
        'products:categories',
        expect.any(Array),
        60 * 60 * 1000,
      );
    });

    it('should invalidate best sellers and categories cache via helper methods', async () => {
      await cachedService.invalidateBestSellersCache();
      expect(mockCache.del).toHaveBeenCalledWith('products:best-sellers');

      await cachedService.invalidateCategoriesCache();
      expect(mockCache.del).toHaveBeenCalledWith('products:categories');
    });
  });
});
