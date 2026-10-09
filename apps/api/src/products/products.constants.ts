import { Prisma } from '@prisma/client';

/**
 * Ürün kartı projeksiyonu (Over-fetching & Memory bloat önleme).
 * Ürün listeleme (`list()`) ve en çok satanlar (`bestSellers()`) sorgularında
 * devasa JSON (`nutritionalContent`) ve uzun metin (`usage`, `features`, `description`)
 * kolonlarının veritabanından çekilmesini engelleyerek ağ transferini ve
 * Node.js bellek/CPU yükünü minimize eder.
 *
 * Sentry telemetrisi ile teyit edilen 204.30ms `SELECT "Product"` darboğazını
 * doğrudan hedef alır.
 */
export const PRODUCT_CARD_SELECT = {
  id: true,
  name: true,
  shortExplanation: true,
  slug: true,
  commentCount: true,
  averageStar: true,
  variants: {
    select: {
      id: true,
      totalPrice: true,
      discountedPrice: true,
      pricePerServing: true,
      photoSrc: true,
    },
    orderBy: { createdAt: 'asc' },
  },
} satisfies Prisma.ProductSelect;

export type ProductCardSelectPayload = Prisma.ProductGetPayload<{
  select: typeof PRODUCT_CARD_SELECT;
}>;
