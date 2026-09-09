import { CartItem, Product, ProductVariant } from '@prisma/client';
import {
  CartItemResponse,
  CartProductSummary,
  CartVariantSummary,
} from './interfaces/cart-item-response.interface';

export type CartItemWithRelations = CartItem & {
  product: Product;
  productVariant: ProductVariant;
};

export class CartMapper {
  static toVariantSummary(variant: ProductVariant): CartVariantSummary {
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
      aroma: variant.aroma,
      size: {
        gram: variant.gram,
        pieces: variant.pieces,
        total_services: variant.totalServings,
      },
      price: {
        profit,
        total_price: totalPrice,
        discounted_price: discountedPrice,
        price_per_servings: pricePerServings,
        discount_percentage: discountPercentage,
      },
      photo_src: variant.photoSrc,
      is_available: isAvailable,
      stock_quantity: variant.stockQuantity,
    };
  }

  static toProductSummary(
    product: Product,
    variant: ProductVariant,
  ): CartProductSummary {
    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      photo_src: variant.photoSrc,
      photo: variant.photoSrc,
    };
  }

  static toCartItemResponse(item: CartItemWithRelations): CartItemResponse {
    return {
      id: item.id,
      product_id: item.productId,
      product_variant_id: item.productVariantId,
      pieces: item.pieces,
      created_at: item.createdAt.toISOString(),
      updated_at: item.updatedAt.toISOString(),
      product: this.toProductSummary(item.product, item.productVariant),
      variant: this.toVariantSummary(item.productVariant),
    };
  }

  static toCartResponseList(
    items: CartItemWithRelations[],
  ): CartItemResponse[] {
    return items.map((item) => this.toCartItemResponse(item));
  }
}
