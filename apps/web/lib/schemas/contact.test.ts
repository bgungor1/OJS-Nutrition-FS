import { describe, expect, it } from 'vitest';
import { contactSchema } from './contact';

describe('contactSchema', () => {
  const validPayload = {
    name: 'Ahmet Yılmaz',
    email: 'ahmet.yilmaz@example.com',
    message: 'Siparişimle ilgili teslimat durumunu öğrenmek istiyorum.',
  };

  it('should validate valid contact form inputs successfully', () => {
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

  it('should trim inputs with whitespace', () => {
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

  describe('name validations', () => {
    it('should fail when name is shorter than 2 characters', () => {
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

    it('should fail when name exceeds 100 characters', () => {
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

    it('should fail when name is missing', () => {
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

  describe('email validations', () => {
    it('should fail when email format is invalid', () => {
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

    it('should fail when email is missing', () => {
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

  describe('message validations', () => {
    it('should fail when message is shorter than 10 characters', () => {
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

    it('should fail when message exceeds 3000 characters', () => {
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

    it('should fail when message is missing', () => {
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
