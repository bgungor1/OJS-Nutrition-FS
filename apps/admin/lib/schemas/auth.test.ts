import { describe, it, expect } from 'vitest';
import { adminLoginSchema } from './auth';

describe('lib/schemas/auth', () => {
  it('validates a correct email and password', () => {
    const result = adminLoginSchema.safeParse({
      email: 'admin@ojsnutrition.com',
      password: 'password123',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe('admin@ojsnutrition.com');
      expect(result.data.password).toBe('password123');
    }
  });

  it('fails validation when email is invalid', () => {
    const result = adminLoginSchema.safeParse({
      email: 'not-an-email',
      password: 'password123',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toMatch(/geçerli bir e-posta/i);
    }
  });

  it('fails validation when email is empty', () => {
    const result = adminLoginSchema.safeParse({
      email: '',
      password: 'password123',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toMatch(/e-posta adresi gereklidir/i);
    }
  });

  it('fails validation when password is shorter than 6 characters', () => {
    const result = adminLoginSchema.safeParse({
      email: 'admin@ojsnutrition.com',
      password: '123',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toMatch(/en az 6 karakter/i);
    }
  });
});
