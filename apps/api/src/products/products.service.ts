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

    const conditions: Prisma.ProductWhereInput[] = [];

    if (category) {
      conditions.push({
        OR: [
          { mainCategory: { slug: category } },
          { subCategory: { slug: category } },
        ],
      });
    }

    if (search) {
      conditions.push({
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { shortExplanation: { contains: search, mode: 'insensitive' } },
          { slug: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      });
    }

    const where: Prisma.ProductWhereInput =
      conditions.length === 0
        ? {}
        : conditions.length === 1
          ? conditions[0]
          : { AND: conditions };

    const count = await this.prisma.product.count({ where });

    let results: ApiPaginatedProducts['results'] = [];

    if (sort === 'price_asc' || sort === 'price_desc') {
      const direction =
        sort === 'price_asc' ? Prisma.sql`ASC` : Prisma.sql`DESC`;
      const whereClauses: Prisma.Sql[] = [Prisma.sql`1=1`];

      if (category) {
        whereClauses.push(
          Prisma.sql`(mc.slug = ${category} OR sc.slug = ${category})`,
        );
      }

      if (search) {
        const pattern = `%${search}%`;
        whereClauses.push(
          Prisma.sql`(p.name ILIKE ${pattern} OR p."shortExplanation" ILIKE ${pattern} OR p.slug ILIKE ${pattern} OR p.description ILIKE ${pattern})`,
        );
      }

      const combinedWhere = Prisma.join(whereClauses, ' AND ');
      let sortedRows: Array<{ id: string }> = [];

      try {
        if (typeof this.prisma.$queryRaw === 'function') {
          sortedRows = await this.prisma.$queryRaw<Array<{ id: string }>>`
            SELECT p.id
            FROM "Product" p
            LEFT JOIN "ProductVariant" pv ON pv."productId" = p.id
            LEFT JOIN "Category" mc ON mc.id = p."mainCategoryId"
            LEFT JOIN "SubCategory" sc ON sc.id = p."subCategoryId"
            WHERE ${combinedWhere}
            GROUP BY p.id
            ORDER BY COALESCE(MIN(COALESCE(pv."discountedPrice", pv."totalPrice")), 0) ${direction}
            LIMIT ${limit} OFFSET ${offset}
          `;
        }
      } catch {}

      if (sortedRows && sortedRows.length > 0) {
        const ids = sortedRows.map((r) => r.id);
        const products = await this.prisma.product.findMany({
          where: { id: { in: ids } },
          select: PRODUCT_CARD_SELECT,
        });

        const productMap = new Map(products.map((p) => [p.id, p]));
        const ordered = ids
          .map((id) => productMap.get(id))
          .filter((p): p is NonNullable<typeof p> => p !== undefined);

        results = ordered.map((p) => ProductsMapper.toProduct(p));
      } else {
        const allMatching = await this.prisma.product.findMany({
          where,
          select: PRODUCT_CARD_SELECT,
        });

        const sorted = allMatching.sort((a, b) => {
          const priceA = ProductsMapper.getLowestPrice(a.variants);
          const priceB = ProductsMapper.getLowestPrice(b.variants);
          return sort === 'price_asc' ? priceA - priceB : priceB - priceA;
        });

        const paginated = sorted.slice(offset, offset + limit);
        results = paginated.map((p) => ProductsMapper.toProduct(p));
      }
    } else {
      let orderBy: Prisma.ProductOrderByWithRelationInput = {
        createdAt: 'desc',
      };
      if (sort === 'rating') {
        orderBy = { averageStar: 'desc' };
      } else if (sort === 'newest') {
        orderBy = { createdAt: 'desc' };
      }

      const products = await this.prisma.product.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy,
        select: PRODUCT_CARD_SELECT,
      });

      results = products.map((p) => ProductsMapper.toProduct(p));
    }

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

  async bestSellers(): Promise<ApiBestSellerProduct[]> {
    const cacheKey = CACHE_KEYS.BEST_SELLERS;
    if (this.cacheManager) {
      try {
        const cached =
          await this.cacheManager.get<ApiBestSellerProduct[]>(cacheKey);
        if (cached) {
          return cached;
        }
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
        if (cached) {
          return cached;
        }
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
