import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ProductsQueryDto } from './dto/products-query.dto';
import {
  ApiBestSellerProduct,
  ApiPaginatedProducts,
  ApiProductDetail,
  CategoryTree,
} from './interfaces/product-response.interface';
import { ProductsMapper } from './products.mapper';

/**
 * OJS Nutrition — Storefront Ürün & Katalog Servisi.
 * Sayfalanmış ürün listeleme, filtreleme, sıralama, en çok satanlar ve
 * kategori ağacı okuma işlemlerini yürütür (Salt-okunur / Public).
 */
@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Sayfalanmış, filtrelenmiş ve sıralanmış ürün listesini döner.
   * N+1 guard: varyantlar tek sorguda include edilir.
   */
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

    // Fiyata göre sıralama ilişkisel varyant üzerinden bellekte yapılır
    if (sort === 'price_asc' || sort === 'price_desc') {
      const allMatching = await this.prisma.product.findMany({
        where,
        include: {
          variants: { orderBy: { createdAt: 'asc' } },
        },
      });

      const sorted = allMatching.sort((a, b) => {
        const priceA = ProductsMapper.getLowestPrice(a.variants);
        const priceB = ProductsMapper.getLowestPrice(b.variants);
        return sort === 'price_asc' ? priceA - priceB : priceB - priceA;
      });

      const paginated = sorted.slice(offset, offset + limit);
      results = paginated.map((p) => ProductsMapper.toProduct(p));
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
        include: {
          variants: { orderBy: { createdAt: 'asc' } },
        },
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

  /**
   * En çok satan ürünleri döner (isBestSeller=true).
   */
  async bestSellers(): Promise<ApiBestSellerProduct[]> {
    const products = await this.prisma.product.findMany({
      where: { isBestSeller: true },
      orderBy: { bestSellerRank: 'asc' },
      include: {
        variants: { orderBy: { createdAt: 'asc' } },
      },
    });

    return products.map((p) => ProductsMapper.toBestSeller(p));
  }

  /**
   * Slug ile tekil ürün detayını varyantlarıyla birlikte döner.
   */
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

  /**
   * Hiyerarşik kategori ağacını döner (ana kategori -> alt kategoriler).
   */
  async categories(): Promise<CategoryTree[]> {
    const categories = await this.prisma.category.findMany({
      include: {
        subCategories: {
          orderBy: { name: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    });

    return categories.map((c) => ({
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
  }
}
