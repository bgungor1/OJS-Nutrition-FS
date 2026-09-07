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

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Sayfalanmış, filtrelenmiş ve sıralanmış ürün listesini döner.
   * N+1 sorgu engeli: varyantlar tek sorguda include edilir.
   */
  async list(query: ProductsQueryDto): Promise<ApiPaginatedProducts> {
    const limit = query.limit ?? 20;
    const offset = query.offset ?? 0;
    const { category, sort } = query;

    const where: Prisma.ProductWhereInput = category
      ? {
          OR: [
            { mainCategory: { slug: category } },
            { subCategory: { slug: category } },
          ],
        }
      : {};

    const count = await this.prisma.product.count({ where });

    let results: ApiPaginatedProducts['results'] = [];

    // Fiyat sıralaması Prisma 1-N ilişkisinde relation üzerinden doğrudan yapılamadığı için
    // eşleşen ürünler çekilip en düşük varyant fiyatına göre bellekte sıralanır ve sayfalanır.
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
          )
        : null;

    const previous =
      offset > 0
        ? ProductsMapper.buildPaginationQuery(
            limit,
            Math.max(0, offset - limit),
            category,
            sort,
          )
        : null;

    return {
      count,
      next,
      previous,
      results,
    };
  }

  /**
   * Slug değerine göre tekil ürün detayını varyantları ile birlikte döner.
   * Bulunamazsa 404 NotFoundException fırlatır.
   */
  async getBySlug(slug: string): Promise<ApiProductDetail> {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        variants: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`"${slug}" slug'ına sahip ürün bulunamadı`);
    }

    return ProductsMapper.toProductDetail(product);
  }

  async bestSellers(): Promise<ApiBestSellerProduct[]> {
    const products = await this.prisma.product.findMany({
      where: { isBestSeller: true },
      orderBy: { bestSellerRank: 'asc' },
      include: {
        variants: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    return products.map((p) => ProductsMapper.toBestSeller(p));
  }

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
