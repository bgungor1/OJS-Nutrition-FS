import { randomUUID } from 'node:crypto';
import type { CookieOptions, Request, Response } from 'express';
import { AuthenticatedUser } from '../common/types/authenticated-user';
import { CartSession } from './interfaces/cart-session.interface';

export const GUEST_CART_COOKIE = 'guest_cart_id';
export const GUEST_CART_COOKIE_MAX_AGE = 30 * 24 * 60 * 60 * 1000;

export function getGuestCartCookieOptions(
  isProduction: boolean,
): CookieOptions {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProduction,
    maxAge: GUEST_CART_COOKIE_MAX_AGE,
    path: '/',
  };
}

export function resolveCartSession(
  req: Request,
  res: Response,
  user?: AuthenticatedUser,
): CartSession {
  if (user?.id) {
    return { userId: user.id };
  }

  const cookies = req.cookies as Record<string, unknown> | undefined;
  const existingGuestId = cookies?.[GUEST_CART_COOKIE];
  if (
    typeof existingGuestId === 'string' &&
    existingGuestId.trim().length > 0
  ) {
    return { guestSessionId: existingGuestId.trim() };
  }

  const newGuestId = randomUUID();
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie(
    GUEST_CART_COOKIE,
    newGuestId,
    getGuestCartCookieOptions(isProduction),
  );

  return { guestSessionId: newGuestId };
}

export function clearGuestCartCookie(res: Response): void {
  const isProduction = process.env.NODE_ENV === 'production';
  res.clearCookie(GUEST_CART_COOKIE, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProduction,
    path: '/',
  });
}
