/** Sihirli sabitler tek yerde — bkz. ENGINEERING_STANDARDS §1. */

export const BCRYPT_SALT_ROUNDS = 12;

export const PAGINATION = {
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  DEFAULT_OFFSET: 0,
} as const;

/** Misafir sepeti için HttpOnly cookie adı — bkz. BACKEND_PLAN §5.5. */
export const GUEST_CART_COOKIE = 'guest_cart_id';

export const REQUEST_ID_HEADER = 'x-request-id';
