import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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

  return response;
}
