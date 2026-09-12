import { describe, it, expect } from 'vitest';
import { loginSchema, registerSchema } from './auth';

describe('auth validation schemas', () => {
  describe('loginSchema', () => {
    it('validates correct email and password successfully', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        password: 'Password123',
      });

      expect(result.success).toBe(true);
    });

    it('fails when email is empty', () => {
      const result = loginSchema.safeParse({
        email: '',
        password: 'Password123',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0]?.message).toBe('E-posta adresi zorunludur.');
      }
    });

    it('fails when email format is invalid', () => {
      const result = loginSchema.safeParse({
        email: 'invalid-email',
        password: 'Password123',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0]?.message).toBe('Geçerli bir e-posta adresi giriniz.');
      }
    });

    it('fails when password is empty', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        password: '',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0]?.message).toBe('Şifre alanı zorunludur.');
      }
    });
  });

  describe('registerSchema', () => {
    const validRegisterInput = {
      first_name: 'Ahmet',
      last_name: 'Yılmaz',
      email: 'ahmet.yilmaz@example.com',
      password: 'Password123',
      password2: 'Password123',
    };

    it('validates full valid registration data successfully', () => {
      const result = registerSchema.safeParse(validRegisterInput);
      expect(result.success).toBe(true);
    });

    it('fails when first_name is shorter than 2 characters', () => {
      const result = registerSchema.safeParse({ ...validRegisterInput, first_name: 'A' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((i) => i.message === 'Ad en az 2 karakter olmalıdır.')).toBe(true);
      }
    });

    it('fails when last_name is shorter than 2 characters', () => {
      const result = registerSchema.safeParse({ ...validRegisterInput, last_name: 'Y' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((i) => i.message === 'Soyad en az 2 karakter olmalıdır.')).toBe(true);
      }
    });

    it('fails when password is shorter than 8 characters', () => {
      const result = registerSchema.safeParse({
        ...validRegisterInput,
        password: 'Pass123',
        password2: 'Pass123',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((i) => i.message === 'Şifre en az 8 karakter olmalıdır.')).toBe(true);
      }
    });

    it('fails when password lacks uppercase letter', () => {
      const result = registerSchema.safeParse({
        ...validRegisterInput,
        password: 'password123',
        password2: 'password123',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((i) =>
          i.message === 'Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermelidir.',
        )).toBe(true);
      }
    });

    it('fails when password lacks digit', () => {
      const result = registerSchema.safeParse({
        ...validRegisterInput,
        password: 'PasswordXYZ',
        password2: 'PasswordXYZ',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((i) =>
          i.message === 'Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermelidir.',
        )).toBe(true);
      }
    });

    it('fails when password and password2 do not match', () => {
      const result = registerSchema.safeParse({
        ...validRegisterInput,
        password: 'Password123',
        password2: 'DifferentPassword123',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        const mismatchError = result.error.issues.find((i) => i.path.includes('password2'));
        expect(mismatchError).toBeDefined();
        expect(mismatchError?.message).toBe('Şifreler eşleşmiyor.');
      }
    });
  });
});
