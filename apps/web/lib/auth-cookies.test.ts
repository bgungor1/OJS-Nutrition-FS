import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  setAuthCookies,
  getAuthTokens,
  getAccessToken,
  getRefreshToken,
  clearAuthCookies,
  hasAuthToken,
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  ACCESS_TOKEN_MAX_AGE,
  REFRESH_TOKEN_MAX_AGE,
} from './auth-cookies';

const mockCookieStore = {
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
};

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => mockCookieStore),
}));

describe('auth-cookies', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('setAuthCookies', () => {
    it('sets access and refresh cookies with correct options and maxAge', async () => {
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

  describe('getAuthTokens', () => {
    it('returns both access and refresh tokens when cookies are present', async () => {
      mockCookieStore.get.mockImplementation((name: string) => {
        if (name === ACCESS_TOKEN_COOKIE) return { value: 'access-123' };
        if (name === REFRESH_TOKEN_COOKIE) return { value: 'refresh-456' };
        return undefined;
      });

      const tokens = await getAuthTokens();

      expect(tokens).toEqual({
        access: 'access-123',
        refresh: 'refresh-456',
      });
      expect(mockCookieStore.get).toHaveBeenCalledWith(ACCESS_TOKEN_COOKIE);
      expect(mockCookieStore.get).toHaveBeenCalledWith(REFRESH_TOKEN_COOKIE);
    });

    it('returns undefined for tokens when cookies are missing', async () => {
      mockCookieStore.get.mockReturnValue(undefined);

      const tokens = await getAuthTokens();

      expect(tokens).toEqual({
        access: undefined,
        refresh: undefined,
      });
    });
  });

  describe('getAccessToken', () => {
    it('returns the access token value when present', async () => {
      mockCookieStore.get.mockReturnValue({ value: 'token-abc' });

      const token = await getAccessToken();

      expect(token).toBe('token-abc');
      expect(mockCookieStore.get).toHaveBeenCalledWith(ACCESS_TOKEN_COOKIE);
    });

    it('returns undefined when access token cookie is not set', async () => {
      mockCookieStore.get.mockReturnValue(undefined);

      const token = await getAccessToken();

      expect(token).toBeUndefined();
    });
  });

  describe('getRefreshToken', () => {
    it('returns the refresh token value when present', async () => {
      mockCookieStore.get.mockReturnValue({ value: 'refresh-xyz' });

      const token = await getRefreshToken();

      expect(token).toBe('refresh-xyz');
      expect(mockCookieStore.get).toHaveBeenCalledWith(REFRESH_TOKEN_COOKIE);
    });

    it('returns undefined when refresh token cookie is not set', async () => {
      mockCookieStore.get.mockReturnValue(undefined);

      const token = await getRefreshToken();

      expect(token).toBeUndefined();
    });
  });

  describe('clearAuthCookies', () => {
    it('deletes both access and refresh token cookies from store', async () => {
      await clearAuthCookies();

      expect(mockCookieStore.delete).toHaveBeenCalledTimes(2);
      expect(mockCookieStore.delete).toHaveBeenCalledWith(ACCESS_TOKEN_COOKIE);
      expect(mockCookieStore.delete).toHaveBeenCalledWith(REFRESH_TOKEN_COOKIE);
    });
  });

  describe('hasAuthToken', () => {
    it('returns true when access token is present', async () => {
      mockCookieStore.get.mockImplementation((name: string) => {
        if (name === ACCESS_TOKEN_COOKIE) return { value: 'access-active' };
        return undefined;
      });

      const result = await hasAuthToken();

      expect(result).toBe(true);
    });

    it('returns true when refresh token is present even if access token is missing', async () => {
      mockCookieStore.get.mockImplementation((name: string) => {
        if (name === REFRESH_TOKEN_COOKIE) return { value: 'refresh-active' };
        return undefined;
      });

      const result = await hasAuthToken();

      expect(result).toBe(true);
    });

    it('returns false when neither access nor refresh token is present', async () => {
      mockCookieStore.get.mockReturnValue(undefined);

      const result = await hasAuthToken();

      expect(result).toBe(false);
    });
  });
});
