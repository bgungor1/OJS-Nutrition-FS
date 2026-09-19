import { describe, it, expect } from 'vitest';
import { productSchema, variantSchema } from './product';

describe('lib/schemas/product', () => {
  describe('productSchema', () => {
    it('validates a correct product form input', () => {
      const validProduct = {
        name: 'Whey Protein Isolate',
        slug: 'whey-protein-isolate',
        shortExplanation: 'Premium pure whey isolate powder',
        usage: 'Mix 1 scoop with 250ml cold water.',
        features: '25g protein per serving\nZero sugar\nFast absorption',
        description: 'Supports high-intensity training recovery and muscle synthesis.',
        tags: ['PROTEIN', 'ISOLATE'],
        mainCategoryId: '11111111-1111-4111-8111-111111111111',
        subCategoryId: '22222222-2222-4222-8222-222222222222',
        isBestSeller: true,
        bestSellerRank: 1,
      };

      const result = productSchema.safeParse(validProduct);
      expect(result.success).toBe(true);
    });

    it('rejects invalid slugs containing spaces or uppercase letters', () => {
      const invalidProduct = {
        name: 'Whey Protein',
        slug: 'Whey Protein!',
        shortExplanation: 'Valid short explanation',
        usage: 'Valid usage instruction',
        features: 'Valid features',
        description: 'Valid long description for product',
        tags: ['TAG'],
        mainCategoryId: '11111111-1111-4111-8111-111111111111',
        subCategoryId: '22222222-2222-4222-8222-222222222222',
      };

      const result = productSchema.safeParse(invalidProduct);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.slug).toBeDefined();
      }
    });

    it('rejects invalid category UUIDs', () => {
      const invalidCategories = {
        name: 'Whey Protein',
        slug: 'whey-protein',
        shortExplanation: 'Valid explanation',
        usage: 'Valid usage',
        features: 'Valid features',
        description: 'Valid description',
        tags: ['TAG'],
        mainCategoryId: 'not-a-uuid',
        subCategoryId: 'invalid-uuid',
      };

      const result = productSchema.safeParse(invalidCategories);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.mainCategoryId).toBeDefined();
        expect(result.error.flatten().fieldErrors.subCategoryId).toBeDefined();
      }
    });
  });

  describe('variantSchema', () => {
    it('validates a correct variant object', () => {
      const validVariant = {
        aroma: 'Chocolate',
        gram: 1000,
        pieces: 1,
        totalServings: 33,
        totalPrice: 899.9,
        discountedPrice: 799.9,
        pricePerServing: 24.23,
        photoSrc: 'media/products/whey-chocolate.jpg',
        isAvailable: true,
        stockQuantity: 15,
      };

      const result = variantSchema.safeParse(validVariant);
      expect(result.success).toBe(true);
    });

    it('rejects when discounted price is greater than or equal to total price', () => {
      const invalidVariant = {
        aroma: 'Chocolate',
        gram: 1000,
        pieces: 1,
        totalServings: 33,
        totalPrice: 500,
        discountedPrice: 600, // Invalid: higher than regular price
        pricePerServing: 15.15,
        photoSrc: 'media/products/whey.jpg',
      };

      const result = variantSchema.safeParse(invalidVariant);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.discountedPrice).toContain(
          'İndirimli fiyat normal satış fiyatından düşük olmalıdır',
        );
      }
    });

    it('rejects negative stock quantity', () => {
      const invalidVariant = {
        aroma: 'Strawberry',
        gram: 1000,
        pieces: 1,
        totalServings: 30,
        totalPrice: 400,
        pricePerServing: 13.33,
        photoSrc: 'media/strawberry.jpg',
        stockQuantity: -5,
      };

      const result = variantSchema.safeParse(invalidVariant);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.stockQuantity).toBeDefined();
      }
    });
  });
});
