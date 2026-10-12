import { Prisma } from '@prisma/client';
import { ProductsMapper } from '../products.mapper';

export class ProductsQueryHelper {
  static buildWhereClause(
    category?: string,
    search?: string,
  ): Prisma.ProductWhereInput {
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

    if (conditions.length === 0) return {};
    if (conditions.length === 1) return conditions[0];
    return { AND: conditions };
  }

  static buildPriceSortRawQuery(params: {
    category?: string;
    search?: string;
    direction: 'ASC' | 'DESC';
    limit: number;
    offset: number;
  }): Prisma.Sql {
    const { category, search, direction, limit, offset } = params;
    const directionSql =
      direction === 'ASC' ? Prisma.sql`ASC` : Prisma.sql`DESC`;
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

    return Prisma.sql`
      SELECT p.id
      FROM "Product" p
      LEFT JOIN "ProductVariant" pv ON pv."productId" = p.id
      LEFT JOIN "Category" mc ON mc.id = p."mainCategoryId"
      LEFT JOIN "SubCategory" sc ON sc.id = p."subCategoryId"
      WHERE ${combinedWhere}
      GROUP BY p.id
      ORDER BY COALESCE(MIN(COALESCE(pv."discountedPrice", pv."totalPrice")), 0) ${directionSql}
      LIMIT ${limit} OFFSET ${offset}
    `;
  }

  static buildOrderBy(sort?: string): Prisma.ProductOrderByWithRelationInput {
    if (sort === 'rating') {
      return { averageStar: 'desc' };
    }
    return { createdAt: 'desc' };
  }

  static sortProductsByPrice<
    T extends { variants: Parameters<typeof ProductsMapper.getLowestPrice>[0] },
  >(products: T[], sort: 'price_asc' | 'price_desc'): T[] {
    return [...products].sort((a, b) => {
      const priceA = ProductsMapper.getLowestPrice(a.variants);
      const priceB = ProductsMapper.getLowestPrice(b.variants);
      return sort === 'price_asc' ? priceA - priceB : priceB - priceA;
    });
  }

  static orderProductsByIds<T extends { id: string }>(
    products: T[],
    orderedIds: string[],
  ): T[] {
    const productMap = new Map(products.map((p) => [p.id, p]));
    return orderedIds
      .map((id) => productMap.get(id))
      .filter((p): p is T => p !== undefined);
  }
}
