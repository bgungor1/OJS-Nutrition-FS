import {
  Inject,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Prisma } from '@prisma/client';
import { CACHE_KEYS, CACHE_TTL } from '../common/constants';
import { PrismaService } from '../prisma/prisma.service';
import { ProductsQueryDto } from './dto/products-query.dto';
import {
  ApiBestSellerProduct,
  ApiPaginatedProducts,
  ApiProductDetail,
  CategoryTree,
} from './interfaces/product-response.interface';
import { PRODUCT_CARD_SELECT } from './products.constants';
import { ProductsMapper } from './products.mapper';
import { ProductsQueryHelper } from './helpers/products-query.helper';

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    @Optional()
    @Inject(CACHE_MANAGER)
    private readonly cacheManager?: Cache,
  ) {}

  async list(query: ProductsQueryDto): Promise<ApiPaginatedProducts> {
    const limit = query.limit ?? 20;
    const offset = query.offset ?? 0;
    const { category, sort } = query;
    const search = query.search?.trim();

    const where = ProductsQueryHelper.buildWhereClause(category, search);

    const { count, results } =
      sort === 'price_asc' || sort === 'price_desc'
        ? await this.listByPriceSort(where, {
            category,
            search,
            sort,
            limit,
            offset,
          })
        : await this.listByDefaultSort(where, { sort, limit, offset });

    const next =
      offset + limit < count
        ? ProductsMapper.buildPaginationQuery(
            limit,
            offset + limit,
            category,
            sort,
            search,
          )
        : null;

    const previous =
      offset > 0
        ? ProductsMapper.buildPaginationQuery(
            limit,
            Math.max(0, offset - limit),
            category,
            sort,
            search,
          )
        : null;

    return { count, next, previous, results };
  }

  private async listByPriceSort(
    where: Prisma.ProductWhereInput,
    params: {
      category?: string;
      search?: string;
      sort: 'price_asc' | 'price_desc';
      limit: number;
      offset: number;
    },
  ): Promise<{ count: number; results: ApiPaginatedProducts['results'] }> {
    const { category, search, sort, limit, offset } = params;
    const rawQuery = ProductsQueryHelper.buildPriceSortRawQuery({
      category,
      search,
      direction: sort === 'price_asc' ? 'ASC' : 'DESC',
      limit,
      offset,
    });

    let count: number;
    let sortedRows: Array<{ id: string }> = [];
    const countPromise = this.prisma.product.count({ where });

    try {
      if (typeof this.prisma.$queryRaw === 'function') {
        const [countResult, rows] = await Promise.all([
          countPromise,
          this.prisma.$queryRaw<Array<{ id: string }>>(rawQuery),
        ]);
        count = countResult;
        sortedRows = rows;
      } else {
        count = await countPromise;
      }
    } catch {
      count = await countPromise;
    }

    if (sortedRows && sortedRows.length > 0) {
      const ids = sortedRows.map((r) => r.id);
      const products = await this.prisma.product.findMany({
        where: { id: { in: ids } },
        select: PRODUCT_CARD_SELECT,
      });

      const ordered = ProductsQueryHelper.orderProductsByIds(products, ids);
      return {
        count,
        results: ordered.map((p) => ProductsMapper.toProduct(p)),
      };
    }

    const allMatching = await this.prisma.product.findMany({
      where,
      select: PRODUCT_CARD_SELECT,
    });

    const sorted = ProductsQueryHelper.sortProductsByPrice(allMatching, sort);
    const paginated = sorted.slice(offset, offset + limit);
    return {
      count,
      results: paginated.map((p) => ProductsMapper.toProduct(p)),
    };
  }

  private async listByDefaultSort(
    where: Prisma.ProductWhereInput,
    params: { sort?: string; limit: number; offset: number },
  ): Promise<{ count: number; results: ApiPaginatedProducts['results'] }> {
    const { sort, limit, offset } = params;
    const orderBy = ProductsQueryHelper.buildOrderBy(sort);

    const [count, products] = await Promise.all([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy,
        select: PRODUCT_CARD_SELECT,
      }),
    ]);

    return {
      count,
      results: products.map((p) => ProductsMapper.toProduct(p)),
    };
  }

  async bestSellers(): Promise<ApiBestSellerProduct[]> {
    const cacheKey = CACHE_KEYS.BEST_SELLERS;
    if (this.cacheManager) {
      try {
        const cached =
          await this.cacheManager.get<ApiBestSellerProduct[]>(cacheKey);
        if (cached) return cached;
      } catch {}
    }

    const products = await this.prisma.product.findMany({
      where: { isBestSeller: true },
      orderBy: { bestSellerRank: 'asc' },
      select: PRODUCT_CARD_SELECT,
    });

    const result = products.map((p) => ProductsMapper.toBestSeller(p));

    if (this.cacheManager) {
      try {
        await this.cacheManager.set(
          cacheKey,
          result,
          CACHE_TTL.BEST_SELLERS_MS,
        );
      } catch {}
    }

    return result;
  }

  async getBySlug(slug: string): Promise<ApiProductDetail> {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        variants: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!product) {
      throw new NotFoundException(`"${slug}" slug'ına sahip ürün bulunamadı`);
    }

    return ProductsMapper.toProductDetail(product);
  }

  async categories(): Promise<CategoryTree[]> {
    const cacheKey = CACHE_KEYS.CATEGORIES_TREE;
    if (this.cacheManager) {
      try {
        const cached = await this.cacheManager.get<CategoryTree[]>(cacheKey);
        if (cached) return cached;
      } catch {}
    }

    const categories = await this.prisma.category.findMany({
      include: {
        subCategories: {
          orderBy: { name: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    });

    const result = categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      subCategories: c.subCategories.map((s) => ({
        id: s.id,
        name: s.name,
        slug: s.slug,
        categoryId: s.categoryId,
      })),
    }));

    if (this.cacheManager) {
      try {
        await this.cacheManager.set(cacheKey, result, CACHE_TTL.CATEGORIES_MS);
      } catch {}
    }

    return result;
  }

  async invalidateBestSellersCache(): Promise<void> {
    if (!this.cacheManager) return;
    try {
      await this.cacheManager.del(CACHE_KEYS.BEST_SELLERS);
    } catch {}
  }

  async invalidateCategoriesCache(): Promise<void> {
    if (!this.cacheManager) return;
    try {
      await this.cacheManager.del(CACHE_KEYS.CATEGORIES_TREE);
    } catch {}
  }
}
