import type { Request, Response } from 'express';
import { Role } from '@prisma/client';
import { AuthenticatedUser } from '../common/types/authenticated-user';
import {
  clearGuestCartCookie,
  getGuestCartCookieOptions,
  GUEST_CART_COOKIE,
  GUEST_CART_COOKIE_MAX_AGE,
  resolveCartSession,
} from './cart-session.helper';

describe('CartSessionHelper', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    mockReq = {
      cookies: {},
    };
    mockRes = {
      cookie: jest.fn(),
      clearCookie: jest.fn(),
    };
  });

  describe('getGuestCartCookieOptions', () => {
    it('should return secure=true and security options in production', () => {
      const options = getGuestCartCookieOptions(true);

      expect(options).toEqual({
        httpOnly: true,
        sameSite: 'lax',
        secure: true,
        maxAge: GUEST_CART_COOKIE_MAX_AGE,
        path: '/',
      });
    });

    it('should return secure=false in development environment', () => {
      const options = getGuestCartCookieOptions(false);

      expect(options.secure).toBe(false);
      expect(options.httpOnly).toBe(true);
      expect(options.sameSite).toBe('lax');
      expect(options.path).toBe('/');
    });
  });

  describe('resolveCartSession', () => {
    it('should return userId directly and not write cookie when user is authenticated', () => {
      const user: AuthenticatedUser = {
        id: 'usr-123',
        email: 'test@example.com',
        role: Role.customer,
      };

      const result = resolveCartSession(
        mockReq as Request,
        mockRes as Response,
        user,
      );

      expect(result).toEqual({ userId: 'usr-123' });
      expect(mockRes.cookie).not.toHaveBeenCalled();
    });

    it('should return existing guestSessionId when user is not present and valid cookie exists', () => {
      mockReq.cookies = {
        [GUEST_CART_COOKIE]: 'existing-guest-uuid-123',
      };

      const result = resolveCartSession(
        mockReq as Request,
        mockRes as Response,
      );

      expect(result).toEqual({ guestSessionId: 'existing-guest-uuid-123' });
      expect(mockRes.cookie).not.toHaveBeenCalled();
    });

    it('should generate new UUID, set cookie, and return guestSessionId when no user and no cookie', () => {
      mockReq.cookies = {};

      const result = resolveCartSession(
        mockReq as Request,
        mockRes as Response,
      );

      expect(result.guestSessionId).toBeDefined();
      expect(typeof result.guestSessionId).toBe('string');
      expect(result.guestSessionId!.length).toBeGreaterThan(10);
      expect(mockRes.cookie).toHaveBeenCalledWith(
        GUEST_CART_COOKIE,
        result.guestSessionId,
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'lax',
          path: '/',
        }),
      );
    });

    it('should generate new UUID when cookie is whitespace or invalid string', () => {
      mockReq.cookies = {
        [GUEST_CART_COOKIE]: '   ',
      };

      const result = resolveCartSession(
        mockReq as Request,
        mockRes as Response,
      );

      expect(result.guestSessionId).toBeDefined();
      expect(result.guestSessionId).not.toBe('   ');
      expect(mockRes.cookie).toHaveBeenCalled();
    });
  });

  describe('clearGuestCartCookie', () => {
    it('should call res.clearCookie with correct parameters', () => {
      clearGuestCartCookie(mockRes as Response);

      expect(mockRes.clearCookie).toHaveBeenCalledWith(
        GUEST_CART_COOKIE,
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'lax',
          path: '/',
        }),
      );
    });
  });
});
