import { describe, expect, it } from 'vitest';
import { contactSchema } from './contact';

describe('contactSchema', () => {
  const validPayload = {
    name: 'Ahmet Yılmaz',
    email: 'ahmet.yilmaz@example.com',
    message: 'Siparişimle ilgili teslimat durumunu öğrenmek istiyorum.',
  };

  it('geçerli iletişim form girdilerini başarıyla doğrular', () => {
    const result = contactSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('Ahmet Yılmaz');
      expect(result.data.email).toBe('ahmet.yilmaz@example.com');
      expect(result.data.message).toBe(
        'Siparişimle ilgili teslimat durumunu öğrenmek istiyorum.',
      );
    }
  });

  it('boşluklu girdileri trim eder', () => {
    const result = contactSchema.safeParse({
      name: '   Mehmet Demir   ',
      email: '  mehmet@example.com  ',
      message: '   Ürünlerinizi çok beğendim, tebrikler.   ',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('Mehmet Demir');
      expect(result.data.email).toBe('mehmet@example.com');
      expect(result.data.message).toBe('Ürünlerinizi çok beğendim, tebrikler.');
    }
  });

  describe('isim (name) doğrulamaları', () => {
    it('isim 2 karakterden kısa olduğunda hata verir', () => {
      const result = contactSchema.safeParse({
        ...validPayload,
        name: 'A',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.name).toContain(
          'İsim en az 2 karakter olmalıdır.',
        );
      }
    });

    it('isim 100 karakterden uzun olduğunda hata verir', () => {
      const result = contactSchema.safeParse({
        ...validPayload,
        name: 'a'.repeat(101),
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.name).toContain(
          'İsim en fazla 100 karakter olabilir.',
        );
      }
    });

    it('isim eksik olduğunda hata verir', () => {
      const result = contactSchema.safeParse({
        ...validPayload,
        name: undefined,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.name).toContain(
          'İsim alanı boş bırakılamaz.',
        );
      }
    });
  });

  describe('e-posta (email) doğrulamaları', () => {
    it('geçersiz e-posta formatında hata verir', () => {
      const result = contactSchema.safeParse({
        ...validPayload,
        email: 'gecersiz-eposta',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.email).toContain(
          'Geçerli bir e-posta adresi giriniz.',
        );
      }
    });

    it('e-posta eksik olduğunda hata verir', () => {
      const result = contactSchema.safeParse({
        ...validPayload,
        email: undefined,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.email).toContain(
          'E-posta alanı boş bırakılamaz.',
        );
      }
    });
  });

  describe('mesaj (message) doğrulamaları', () => {
    it('mesaj 10 karakterden kısa olduğunda hata verir', () => {
      const result = contactSchema.safeParse({
        ...validPayload,
        message: 'Kısa',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.message).toContain(
          'Mesaj en az 10 karakter olmalıdır.',
        );
      }
    });

    it('mesaj 3000 karakterden uzun olduğunda hata verir', () => {
      const result = contactSchema.safeParse({
        ...validPayload,
        message: 'a'.repeat(3001),
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.message).toContain(
          'Mesaj en fazla 3000 karakter olabilir.',
        );
      }
    });

    it('mesaj eksik olduğunda hata verir', () => {
      const result = contactSchema.safeParse({
        ...validPayload,
        message: undefined,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.message).toContain(
          'Mesaj alanı boş bırakılamaz.',
        );
      }
    });
  });
});
