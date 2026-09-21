import { describe, expect, it } from 'vitest';
import { createReviewSchema } from './review';

describe('createReviewSchema', () => {
  const validReview = {
    rating: 5,
    title: 'Harika bir ürün!',
    text: 'Düzenli kullanıyorum ve çok memnunum, tavsiye ederim.',
    images: ['https://example.com/photo1.jpg'],
  };

  it('should validate valid review successfully', () => {
    const result = createReviewSchema.safeParse(validReview);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.rating).toBe(5);
      expect(result.data.title).toBe('Harika bir ürün!');
      expect(result.data.text).toBe('Düzenli kullanıyorum ve çok memnunum, tavsiye ederim.');
      expect(result.data.images).toEqual(['https://example.com/photo1.jpg']);
    }
  });

  it('should default images to empty array when omitted', () => {
    const withoutImages = {
      rating: validReview.rating,
      title: validReview.title,
      text: validReview.text,
    };
    const result = createReviewSchema.safeParse(withoutImages);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.images).toEqual([]);
    }
  });

  it('should trim whitespace from title and text fields', () => {
    const reviewWithSpaces = {
      ...validReview,
      title: '   Güzel Tat   ',
      text: '   Etkili ve kaliteli bir formülasyon.   ',
    };
    const result = createReviewSchema.safeParse(reviewWithSpaces);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe('Güzel Tat');
      expect(result.data.text).toBe('Etkili ve kaliteli bir formülasyon.');
    }
  });

  describe('rating validations', () => {
    it('should fail when rating is missing', () => {
      const result = createReviewSchema.safeParse({ ...validReview, rating: undefined });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.rating).toContain('Lütfen bir puan seçiniz.');
      }
    });

    it('should fail when rating is less than 1', () => {
      const result = createReviewSchema.safeParse({ ...validReview, rating: 0 });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.rating).toContain('Puan en az 1 olmalıdır.');
      }
    });

    it('should fail when rating is greater than 5', () => {
      const result = createReviewSchema.safeParse({ ...validReview, rating: 6 });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.rating).toContain('Puan en fazla 5 olabilir.');
      }
    });

    it('should fail when rating is not an integer', () => {
      const result = createReviewSchema.safeParse({ ...validReview, rating: 4.5 });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.rating).toContain('Puan tam sayı olmalıdır.');
      }
    });
  });

  describe('title validations', () => {
    it('should fail when title is shorter than 2 characters', () => {
      const result = createReviewSchema.safeParse({ ...validReview, title: 'A' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.title).toContain('Başlık en az 2 karakter olmalıdır.');
      }
    });

    it('should fail when title exceeds 150 characters', () => {
      const result = createReviewSchema.safeParse({ ...validReview, title: 'a'.repeat(151) });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.title).toContain('Başlık en fazla 150 karakter olabilir.');
      }
    });
  });

  describe('text validations', () => {
    it('should fail when text is shorter than 5 characters', () => {
      const result = createReviewSchema.safeParse({ ...validReview, text: 'Test' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.text).toContain('Yorum en az 5 karakter olmalıdır.');
      }
    });

    it('should fail when text exceeds 2000 characters', () => {
      const result = createReviewSchema.safeParse({ ...validReview, text: 'a'.repeat(2001) });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.text).toContain('Yorum en fazla 2000 karakter olabilir.');
      }
    });
  });

  describe('images validations', () => {
    it('should fail when image URL format is invalid', () => {
      const result = createReviewSchema.safeParse({ ...validReview, images: ['gecersiz-url'] });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.images).toContain('Geçerli bir görsel URL adresi giriniz.');
      }
    });

    it('should fail when more than 5 images are provided', () => {
      const result = createReviewSchema.safeParse({
        ...validReview,
        images: [
          'https://example.com/1.jpg',
          'https://example.com/2.jpg',
          'https://example.com/3.jpg',
          'https://example.com/4.jpg',
          'https://example.com/5.jpg',
          'https://example.com/6.jpg',
        ],
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.images).toContain('En fazla 5 görsel eklenebilir.');
      }
    });
  });
});
