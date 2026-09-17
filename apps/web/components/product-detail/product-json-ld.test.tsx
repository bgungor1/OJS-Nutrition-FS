import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@/test/test-utils';
import { ProductJsonLd, safeJsonLdReplacer } from './product-json-ld';
import type { ApiProductDetail } from '@/types';

const mockProduct: ApiProductDetail = {
  id: 'prod_123',
  name: 'Gold Whey Protein 1000g',
  slug: 'gold-whey-protein-1000g',
  short_explanation: 'Yüksek saflıkta konsantre whey proteini.',
  explanation: {
    description: 'Ayrıntılı ürün açıklaması burada yer alır.',
    usage: 'Günde 1 porsiyon (30g) 250ml su ile tüketiniz.',
    features: '24g protein per serving',
    nutritional_content: {
      ingredients: [{ aroma: 'Çikolata', value: 'Whey konsantresi' }],
      nutrition_facts: { ingredients: [], portion_sizes: ['30g'] },
    },
  },
  main_category_id: 'cat_protein',
  sub_category_id: 'sub_whey',
  tags: ['protein', 'whey', 'kas'],
  variants: [
    {
      id: 'var_1',
      size: { gram: 1000, pieces: 1, total_services: 33 },
      aroma: 'Çikolata',
      price: {
        total_price: 1299,
        discounted_price: null,
        discount_percentage: null,
        profit: null,
        price_per_servings: null,
      },
      photo_src: 'media/products/whey-cikolata.jpg',
      is_available: true,
    },
  ],
  comment_count: 14,
  average_star: 4.7,
};

describe('ProductJsonLd Component', () => {
  it('renders a valid Schema.org Product JSON-LD script', () => {
    const { container } = render(
      <ProductJsonLd product={mockProduct} baseUrl="https://ojsnutrition.com" />
    );

    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).toBeInTheDocument();

    const data = JSON.parse(script?.textContent || '{}');

    expect(data['@context']).toBe('https://schema.org');
    expect(data['@type']).toBe('Product');
    expect(data.name).toBe('Gold Whey Protein 1000g');
    expect(data.description).toBe('Yüksek saflıkta konsantre whey proteini.');
    expect(data.sku).toBe('prod_123');
    expect(data.brand).toEqual({ '@type': 'Brand', name: 'OJS Nutrition' });

    expect(data.offers).toBeDefined();
    expect(data.offers['@type']).toBe('Offer');
    expect(data.offers.priceCurrency).toBe('TRY');
    expect(data.offers.price).toBe(1299);
    expect(data.offers.availability).toBe('https://schema.org/InStock');
    expect(data.offers.url).toBe('https://ojsnutrition.com/product/gold-whey-protein-1000g');

    expect(data.aggregateRating).toBeDefined();
    expect(data.aggregateRating['@type']).toBe('AggregateRating');
    expect(data.aggregateRating.ratingValue).toBe(4.7);
    expect(data.aggregateRating.reviewCount).toBe(14);
  });

  it('omits aggregateRating when product has no reviews or average star is 0', () => {
    const productWithoutReviews: ApiProductDetail = {
      ...mockProduct,
      comment_count: 0,
      average_star: 0,
    };

    const { container } = render(
      <ProductJsonLd product={productWithoutReviews} baseUrl="https://ojsnutrition.com" />
    );

    const script = container.querySelector('script[type="application/ld+json"]');
    const data = JSON.parse(script?.textContent || '{}');

    expect(data.aggregateRating).toBeUndefined();
  });

  it('sets availability to OutOfStock when primary variant is not available', () => {
    const outOfStockProduct: ApiProductDetail = {
      ...mockProduct,
      variants: [
        {
          ...mockProduct.variants[0],
          is_available: false,
        },
      ],
    };

    const { container } = render(
      <ProductJsonLd product={outOfStockProduct} baseUrl="https://ojsnutrition.com" />
    );

    const script = container.querySelector('script[type="application/ld+json"]');
    const data = JSON.parse(script?.textContent || '{}');

    expect(data.offers.availability).toBe('https://schema.org/OutOfStock');
  });

  describe('safeJsonLdReplacer (XSS Prevention)', () => {
    it('escapes less-than characters to prevent script tag injection', () => {
      const maliciousPayload = {
        name: '</script><script>alert("XSS")</script>',
      };

      const serialized = safeJsonLdReplacer(maliciousPayload);

      expect(serialized).not.toContain('</script>');
      expect(serialized).toContain('\\u003c/script>');
    });
  });
});
