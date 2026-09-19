import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  setAuthCookies,
  getAuthTokens,
  getAccessToken,
  getRefreshToken,
  clearAuthCookies,
  hasValidAdminToken,
} from './auth-cookies';
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  ACCESS_TOKEN_MAX_AGE,
  REFRESH_TOKEN_MAX_AGE,
} from './constants';

const mockCookieStore = {
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
};

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => mockCookieStore),
}));

function createMockJwt(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  const signature = 'mock-sig';
  return `${header}.${body}.${signature}`;
}

describe('lib/auth-cookies', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('setAuthCookies()', () => {
    it('sets access and refresh cookies with correct security options and maxAge', async () => {
      const tokens = {
        access: 'mock-access-token',
        refresh: 'mock-refresh-token',
      };

      await setAuthCookies(tokens);

      expect(mockCookieStore.set).toHaveBeenCalledTimes(2);
      expect(mockCookieStore.set).toHaveBeenNthCalledWith(
        1,
        ACCESS_TOKEN_COOKIE,
        'mock-access-token',
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'lax',
          path: '/',
          maxAge: ACCESS_TOKEN_MAX_AGE,
        }),
      );
      expect(mockCookieStore.set).toHaveBeenNthCalledWith(
        2,
        REFRESH_TOKEN_COOKIE,
        'mock-refresh-token',
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'lax',
          path: '/',
          maxAge: REFRESH_TOKEN_MAX_AGE,
        }),
      );
    });
  });

  describe('getAuthTokens()', () => {
    it('returns existing access and refresh token values', async () => {
      mockCookieStore.get.mockImplementation((name: string) => {
        if (name === ACCESS_TOKEN_COOKIE) return { value: 'access-123' };
        if (name === REFRESH_TOKEN_COOKIE) return { value: 'refresh-456' };
        return undefined;
      });

      const tokens = await getAuthTokens();
      expect(tokens.access).toBe('access-123');
      expect(tokens.refresh).toBe('refresh-456');
    });

    it('returns undefined values when cookies are absent', async () => {
      mockCookieStore.get.mockReturnValue(undefined);

      const tokens = await getAuthTokens();
      expect(tokens.access).toBeUndefined();
      expect(tokens.refresh).toBeUndefined();
    });
  });

  describe('getAccessToken() & getRefreshToken()', () => {
    it('reads the access token value directly', async () => {
      mockCookieStore.get.mockReturnValue({ value: 'only-access' });
      expect(await getAccessToken()).toBe('only-access');
    });

    it('reads the refresh token value directly', async () => {
      mockCookieStore.get.mockReturnValue({ value: 'only-refresh' });
      expect(await getRefreshToken()).toBe('only-refresh');
    });
  });

  describe('clearAuthCookies()', () => {
    it('deletes both access and refresh auth cookies', async () => {
      await clearAuthCookies();
      expect(mockCookieStore.delete).toHaveBeenCalledWith(ACCESS_TOKEN_COOKIE);
      expect(mockCookieStore.delete).toHaveBeenCalledWith(REFRESH_TOKEN_COOKIE);
    });
  });

  describe('hasValidAdminToken()', () => {
    it('returns true when a valid non-expired admin token exists', async () => {
      const validAdminToken = createMockJwt({
        sub: 'admin-1',
        role: 'admin',
        exp: Math.floor(Date.now() / 1000) + 3600,
      });

      mockCookieStore.get.mockReturnValue({ value: validAdminToken });
      expect(await hasValidAdminToken()).toBe(true);
    });

    it('returns false when the token has a customer role', async () => {
      const customerToken = createMockJwt({
        sub: 'customer-1',
        role: 'customer',
        exp: Math.floor(Date.now() / 1000) + 3600,
      });

      mockCookieStore.get.mockReturnValue({ value: customerToken });
      expect(await hasValidAdminToken()).toBe(false);
    });

    it('returns false when no token is present', async () => {
      mockCookieStore.get.mockReturnValue(undefined);
      expect(await hasValidAdminToken()).toBe(false);
    });
  });
});
