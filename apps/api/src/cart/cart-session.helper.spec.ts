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
    it('üretim ortamında secure=true ve güvenlik parametreleri dönmeli', () => {
      const options = getGuestCartCookieOptions(true);

      expect(options).toEqual({
        httpOnly: true,
        sameSite: 'lax',
        secure: true,
        maxAge: GUEST_CART_COOKIE_MAX_AGE,
        path: '/',
      });
    });

    it('geliştirme ortamında secure=false dönmeli', () => {
      const options = getGuestCartCookieOptions(false);

      expect(options.secure).toBe(false);
      expect(options.httpOnly).toBe(true);
      expect(options.sameSite).toBe('lax');
      expect(options.path).toBe('/');
    });
  });

  describe('resolveCartSession', () => {
    it('giriş yapmış kullanıcı varsa doğrudan userId dönmeli ve çerez yazmamalı', () => {
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

    it('kullanıcı yoksa ve istekte geçerli guest_cart_id çerezi varsa mevcut ID dönmeli', () => {
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

    it('kullanıcı yoksa ve çerez yoksa yeni UUID üretip çereze yazmalı ve dönmeli', () => {
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

    it('çerez boşluk veya geçersiz string olduğunda yeni UUID üretmeli', () => {
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
    it('res.clearCookie fonksiyonunu doğru parametrelerle tetiklemeli', () => {
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
