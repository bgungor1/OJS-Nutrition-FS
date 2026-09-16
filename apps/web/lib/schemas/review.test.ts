import { describe, expect, it } from 'vitest';
import { createReviewSchema } from './review';

describe('createReviewSchema', () => {
  const validReview = {
    rating: 5,
    title: 'Harika bir ürün!',
    text: 'Düzenli kullanıyorum ve çok memnunum, tavsiye ederim.',
    images: ['https://example.com/photo1.jpg'],
  };

  it('geçerli veriyi başarıyla doğrular', () => {
    const result = createReviewSchema.safeParse(validReview);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.rating).toBe(5);
      expect(result.data.title).toBe('Harika bir ürün!');
      expect(result.data.text).toBe('Düzenli kullanıyorum ve çok memnunum, tavsiye ederim.');
      expect(result.data.images).toEqual(['https://example.com/photo1.jpg']);
    }
  });

  it('görsel dizisi verilmediğinde boş dizi varsayılanını atar', () => {
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

  it('başlık ve metin alanlarındaki boşlukları trim eder', () => {
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

  describe('puan (rating) doğrulamaları', () => {
    it('puan eksik olduğunda hata verir', () => {
      const result = createReviewSchema.safeParse({ ...validReview, rating: undefined });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.rating).toContain('Lütfen bir puan seçiniz.');
      }
    });

    it('puan 1-den küçük olduğunda hata verir', () => {
      const result = createReviewSchema.safeParse({ ...validReview, rating: 0 });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.rating).toContain('Puan en az 1 olmalıdır.');
      }
    });

    it('puan 5-ten büyük olduğunda hata verir', () => {
      const result = createReviewSchema.safeParse({ ...validReview, rating: 6 });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.rating).toContain('Puan en fazla 5 olabilir.');
      }
    });

    it('puan ondalıklı olduğunda hata verir', () => {
      const result = createReviewSchema.safeParse({ ...validReview, rating: 4.5 });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.rating).toContain('Puan tam sayı olmalıdır.');
      }
    });
  });

  describe('başlık (title) doğrulamaları', () => {
    it('başlık 2 karakterden kısa olduğunda hata verir', () => {
      const result = createReviewSchema.safeParse({ ...validReview, title: 'A' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.title).toContain('Başlık en az 2 karakter olmalıdır.');
      }
    });

    it('başlık 150 karakterden uzun olduğunda hata verir', () => {
      const result = createReviewSchema.safeParse({ ...validReview, title: 'a'.repeat(151) });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.title).toContain('Başlık en fazla 150 karakter olabilir.');
      }
    });
  });

  describe('yorum metni (text) doğrulamaları', () => {
    it('yorum 5 karakterden kısa olduğunda hata verir', () => {
      const result = createReviewSchema.safeParse({ ...validReview, text: 'Test' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.text).toContain('Yorum en az 5 karakter olmalıdır.');
      }
    });

    it('yorum 2000 karakterden uzun olduğunda hata verir', () => {
      const result = createReviewSchema.safeParse({ ...validReview, text: 'a'.repeat(2001) });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.text).toContain('Yorum en fazla 2000 karakter olabilir.');
      }
    });
  });

  describe('görseller (images) doğrulamaları', () => {
    it('geçersiz url formatında hata verir', () => {
      const result = createReviewSchema.safeParse({ ...validReview, images: ['gecersiz-url'] });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.images).toContain('Geçerli bir görsel URL adresi giriniz.');
      }
    });

    it('5-ten fazla görsel eklendiğinde hata verir', () => {
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
