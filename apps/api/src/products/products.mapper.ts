import { Product, ProductVariant } from '@prisma/client';
import {
  ApiBestSellerProduct,
  ApiNutritionalContent,
  ApiPriceInfo,
  ApiProduct,
  ApiProductDetail,
  ApiProductVariant,
} from './interfaces/product-response.interface';

export type ProductWithVariants = Product & {
  variants: ProductVariant[];
};

/**
 * OJS Nutrition — Ürün & Katalog Dönüştürücü Katmanı (Mapper).
 * Veritabanı modellerini frontend API sözleşmesine dönüştürür ve
 * backend'e ait fiyat, indirim, kâr ve stok uygunluk hesaplamalarını yapar.
 */
export class ProductsMapper {
  /**
   * Birincil varyant üzerinden fiyat, indirim oranı ve kâr (profit) hesaplamalarını üretir.
   */
  static toPriceInfo(variants: ProductVariant[]): ApiPriceInfo {
    const primary = variants[0];
    if (!primary) {
      return {
        profit: null,
        total_price: 0,
        discounted_price: null,
        price_per_servings: null,
        discount_percentage: null,
      };
    }

    const totalPrice = Number(primary.totalPrice);
    const discountedPrice = primary.discountedPrice
      ? Number(primary.discountedPrice)
      : null;

    const profit =
      discountedPrice !== null
        ? Number((totalPrice - discountedPrice).toFixed(2))
        : null;

    const discountPercentage =
      discountedPrice !== null && totalPrice > 0
        ? Math.round(((totalPrice - discountedPrice) / totalPrice) * 100)
        : null;

    const pricePerServings = Number(primary.pricePerServing);

    return {
      profit,
      total_price: totalPrice,
      discounted_price: discountedPrice,
      price_per_servings: pricePerServings,
      discount_percentage: discountPercentage,
    };
  }

  /**
   * Tekil ürün varyantını dönüştürür.
   * is_available: admin onayı (isAvailable) VE gerçek stok (stockQuantity > 0).
   */
  static toVariant(variant: ProductVariant): ApiProductVariant {
    const totalPrice = Number(variant.totalPrice);
    const discountedPrice = variant.discountedPrice
      ? Number(variant.discountedPrice)
      : null;

    const profit =
      discountedPrice !== null
        ? Number((totalPrice - discountedPrice).toFixed(2))
        : null;

    const discountPercentage =
      discountedPrice !== null && totalPrice > 0
        ? Math.round(((totalPrice - discountedPrice) / totalPrice) * 100)
        : null;

    const pricePerServings = Number(variant.pricePerServing);
    const isAvailable = variant.isAvailable && variant.stockQuantity > 0;

    return {
      id: variant.id,
      size: {
        gram: variant.gram,
        pieces: variant.pieces,
        total_services: variant.totalServings,
      },
      aroma: variant.aroma,
      price: {
        profit,
        total_price: totalPrice,
        discounted_price: discountedPrice,
        price_per_servings: pricePerServings,
        discount_percentage: discountPercentage,
      },
      photo_src: variant.photoSrc,
      is_available: isAvailable,
    };
  }

  static toProduct(product: ProductWithVariants): ApiProduct {
    return {
      id: product.id,
      name: product.name,
      short_explanation: product.shortExplanation,
      slug: product.slug,
      price_info: this.toPriceInfo(product.variants),
      photo_src: product.variants[0]?.photoSrc ?? '',
      comment_count: product.commentCount,
      average_star: product.averageStar,
    };
  }

  static toBestSeller(product: ProductWithVariants): ApiBestSellerProduct {
    return {
      name: product.name,
      short_explanation: product.shortExplanation,
      slug: product.slug,
      price_info: this.toPriceInfo(product.variants),
      photo_src: product.variants[0]?.photoSrc ?? '',
      comment_count: product.commentCount,
      average_star: product.averageStar,
    };
  }

  static toProductDetail(product: ProductWithVariants): ApiProductDetail {
    const nutritionalContent =
      (product.nutritionalContent as unknown as ApiNutritionalContent) ?? {
        ingredients: [],
        nutrition_facts: { ingredients: [], portion_sizes: [] },
        amino_acid_facts: { ingredients: [], portion_sizes: [] },
      };

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      short_explanation: product.shortExplanation,
      explanation: {
        usage: product.usage,
        features: product.features,
        description: product.description,
        nutritional_content: nutritionalContent,
      },
      main_category_id: product.mainCategoryId,
      sub_category_id: product.subCategoryId,
      tags: product.tags,
      variants: product.variants.map((v) => this.toVariant(v)),
      comment_count: product.commentCount,
      average_star: product.averageStar,
    };
  }

  static getLowestPrice(variants: ProductVariant[]): number {
    if (variants.length === 0) return 0;
    return Math.min(
      ...variants.map((v) =>
        v.discountedPrice ? Number(v.discountedPrice) : Number(v.totalPrice),
      ),
    );
  }

  static buildPaginationQuery(
    limit: number,
    offset: number,
    category?: string,
    sort?: string,
  ): string {
    const params = new URLSearchParams();
    params.set('limit', limit.toString());
    params.set('offset', offset.toString());
    if (category) params.set('category', category);
    if (sort) params.set('sort', sort);
    return `?${params.toString()}`;
  }
}
