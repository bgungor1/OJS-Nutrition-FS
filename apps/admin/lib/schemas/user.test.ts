import { describe, it, expect } from 'vitest';
import { updateUserRoleSchema, ROLE_VALUES } from './user';

describe('updateUserRoleSchema', () => {
  it('passes for valid role values', () => {
    for (const role of ROLE_VALUES) {
      const result = updateUserRoleSchema.safeParse({ role });
      expect(result.success).toBe(true);
    }
  });

  it('fails for invalid role value', () => {
    const result = updateUserRoleSchema.safeParse({ role: 'superadmin' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('Lütfen geçerli bir rol seçiniz.');
  });

  it('fails when role is missing', () => {
    const result = updateUserRoleSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
