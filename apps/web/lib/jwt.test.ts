import { describe, it, expect } from 'vitest';
import { decodeJwtPayload, isTokenExpired, isAdminToken } from './jwt';

function createMockJwt(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  const signature = 'mock-sig';
  return `${header}.${body}.${signature}`;
}

describe('apps/web/lib/jwt', () => {
  it('decodes valid JWT payload correctly', () => {
    const token = createMockJwt({ sub: 'user-123', email: 'test@example.com', role: 'admin' });
    const payload = decodeJwtPayload(token);

    expect(payload).not.toBeNull();
    expect(payload?.sub).toBe('user-123');
    expect(payload?.email).toBe('test@example.com');
    expect(payload?.role).toBe('admin');
  });

  it('returns null for malformed tokens', () => {
    expect(decodeJwtPayload('invalid-token')).toBeNull();
    expect(decodeJwtPayload('')).toBeNull();
  });

  it('correctly identifies expired and non-expired tokens', () => {
    const expiredToken = createMockJwt({
      sub: 'user-123',
      exp: Math.floor(Date.now() / 1000) - 60,
    });
    const validToken = createMockJwt({
      sub: 'user-123',
      exp: Math.floor(Date.now() / 1000) + 3600,
    });

    expect(isTokenExpired(expiredToken)).toBe(true);
    expect(isTokenExpired(validToken)).toBe(false);
  });

  it('isAdminToken verifies admin role and expiration', () => {
    const adminToken = createMockJwt({
      sub: 'admin-123',
      role: 'admin',
      exp: Math.floor(Date.now() / 1000) + 3600,
    });
    const customerToken = createMockJwt({
      sub: 'cust-123',
      role: 'customer',
      exp: Math.floor(Date.now() / 1000) + 3600,
    });

    expect(isAdminToken(adminToken)).toBe(true);
    expect(isAdminToken(customerToken)).toBe(false);
    expect(isAdminToken(undefined)).toBe(false);
  });
});
