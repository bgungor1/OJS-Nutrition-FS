import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { serverFetch } from '@/lib/api-client';

const ACCESS_TOKEN_COOKIE = 'ojs_access_token';
const REFRESH_TOKEN_COOKIE = 'ojs_refresh_token';
const ACCESS_TOKEN_MAX_AGE = 15 * 60;
const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60;

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;

  const access = searchParams.get('access');
  const refresh = searchParams.get('refresh');

  if (!access || !refresh) {
    const loginUrl = new URL('/login?error=oauth_failed', origin);
    return NextResponse.redirect(loginUrl);
  }

  const isProduction = process.env.NODE_ENV === 'production';
  const response = NextResponse.redirect(new URL('/account', origin));

  response.cookies.set(ACCESS_TOKEN_COOKIE, access, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: ACCESS_TOKEN_MAX_AGE,
  });

  response.cookies.set(REFRESH_TOKEN_COOKIE, refresh, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: REFRESH_TOKEN_MAX_AGE,
  });

  const guestCartId = request.cookies.get('guest_cart_id')?.value;
  if (guestCartId) {
    try {
      await serverFetch('/cart/merge', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${access}`,
          Cookie: `guest_cart_id=${guestCartId}`,
        },
        cache: 'no-store',
      });
      response.cookies.delete('guest_cart_id');
    } catch {
    }
  }

  return response;
}
