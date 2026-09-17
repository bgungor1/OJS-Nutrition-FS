import React from 'react';
import type { ApiProductDetail } from '@/types';
import { getImageUrl } from '@/lib/utils/image';

export interface ProductJsonLdProps {
  product: ApiProductDetail;
  baseUrl?: string;
}

export function safeJsonLdReplacer(json: unknown): string {
  return JSON.stringify(json).replace(/</g, '\\u003c');
}

export const ProductJsonLd: React.FC<ProductJsonLdProps> = ({
  product,
  baseUrl = process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3000',
}) => {
  const primaryVariant = product.variants?.[0];
  const images = (product.variants || [])
    .map((v) => v.photo_src)
    .filter(Boolean)
    .map((src) => getImageUrl(src));

  const offerPrice = primaryVariant?.price?.total_price ?? 0;
  const isAvailable = primaryVariant ? primaryVariant.is_available : true;

  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description:
      product.short_explanation ||
      product.explanation?.description ||
      `${product.name} - OJS Nutrition sporcu takviyesi`,
    image: images.length > 0 ? images : [getImageUrl('/placeholder-product.png')],
    sku: product.id || product.slug,
    brand: {
      '@type': 'Brand',
      name: 'OJS Nutrition',
    },
    offers: {
      '@type': 'Offer',
      url: `${baseUrl}/product/${product.slug}`,
      priceCurrency: 'TRY',
      price: offerPrice,
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
      availability: isAvailable
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
  };

  if (product.comment_count > 0 && product.average_star > 0) {
    jsonLd.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: product.average_star,
      reviewCount: product.comment_count,
      bestRating: '5',
      worstRating: '1',
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: safeJsonLdReplacer(jsonLd),
      }}
    />
  );
};

export default ProductJsonLd;
