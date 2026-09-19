import { describe, it, expect } from 'vitest';
import { decodeJwtPayload, isAdminToken, isTokenExpired } from './jwt';

function createMockJwt(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  const signature = 'mock-signature';
  return `${header}.${body}.${signature}`;
}

describe('lib/jwt', () => {
  describe('decodeJwtPayload()', () => {
    it('successfully decodes a valid JWT token payload', () => {
      const mockPayload = {
        sub: '123e4567-e89b-12d3-a456-426614174000',
        email: 'admin@ojsnutrition.com',
        role: 'admin',
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      const token = createMockJwt(mockPayload);
      const decoded = decodeJwtPayload(token);

      expect(decoded).not.toBeNull();
      expect(decoded?.sub).toBe(mockPayload.sub);
      expect(decoded?.email).toBe(mockPayload.email);
      expect(decoded?.role).toBe('admin');
    });

    it('returns null for malformed or invalid JWT strings', () => {
      expect(decodeJwtPayload('invalid-jwt')).toBeNull();
      expect(decodeJwtPayload('header.invalidbody.sig')).toBeNull();
      expect(decodeJwtPayload('')).toBeNull();
    });
  });

  describe('isTokenExpired()', () => {
    it('returns false for a token that has not expired yet', () => {
      const token = createMockJwt({
        sub: 'user-1',
        exp: Math.floor(Date.now() / 1000) + 3600,
      });
      expect(isTokenExpired(token)).toBe(false);
    });

    it('returns true for an expired token', () => {
      const token = createMockJwt({
        sub: 'user-1',
        exp: Math.floor(Date.now() / 1000) - 3600,
      });
      expect(isTokenExpired(token)).toBe(true);
    });

    it('returns true as a security precaution if exp field is missing', () => {
      const token = createMockJwt({ sub: 'user-1' });
      expect(isTokenExpired(token)).toBe(true);
    });
  });

  describe('isAdminToken()', () => {
    it('returns true for a valid non-expired token with admin role', () => {
      const token = createMockJwt({
        sub: 'user-admin',
        role: 'admin',
        exp: Math.floor(Date.now() / 1000) + 3600,
      });
      expect(isAdminToken(token)).toBe(true);
    });

    it('returns false for a token with customer role', () => {
      const token = createMockJwt({
        sub: 'user-customer',
        role: 'customer',
        exp: Math.floor(Date.now() / 1000) + 3600,
      });
      expect(isAdminToken(token)).toBe(false);
    });

    it('returns false for an expired admin token', () => {
      const token = createMockJwt({
        sub: 'user-admin',
        role: 'admin',
        exp: Math.floor(Date.now() / 1000) - 60,
      });
      expect(isAdminToken(token)).toBe(false);
    });

    it('returns false for undefined or empty token', () => {
      expect(isAdminToken(undefined)).toBe(false);
      expect(isAdminToken('')).toBe(false);
    });
  });
});
