import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  ACCESS_TOKEN_COOKIE,
  ACCESS_TOKEN_MAX_AGE,
  REFRESH_TOKEN_COOKIE,
  REFRESH_TOKEN_MAX_AGE,
} from './lib/constants';
import { decodeJwtPayload, isAdminToken } from './lib/jwt';

const PUBLIC_ROUTES = ['/login'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname === route);

  if (isPublicRoute) {
    if (accessToken && isAdminToken(accessToken)) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  if (accessToken && isAdminToken(accessToken)) {
    return NextResponse.next();
  }
  if (refreshToken) {
    const apiUrl = process.env.API_BASE_URL || 'http://localhost:3000/api/v1';

    try {
      const refreshResponse = await fetch(`${apiUrl}/auth/token/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (refreshResponse.ok) {
        const json = await refreshResponse.json();

        if (json.status === 'success' && json.data?.access && json.data?.refresh) {
          const newAccess = json.data.access;
          const payload = decodeJwtPayload(newAccess);

          if (payload && payload.role === 'admin') {
            const response = NextResponse.next();
            const isProduction = process.env.NODE_ENV === 'production';

            response.cookies.set(ACCESS_TOKEN_COOKIE, newAccess, {
              httpOnly: true,
              secure: isProduction,
              sameSite: 'lax',
              path: '/',
              maxAge: ACCESS_TOKEN_MAX_AGE,
            });

            response.cookies.set(REFRESH_TOKEN_COOKIE, json.data.refresh, {
              httpOnly: true,
              secure: isProduction,
              sameSite: 'lax',
              path: '/',
              maxAge: REFRESH_TOKEN_MAX_AGE,
            });

            return response;
          }
        }
      }
    } catch {
    }

    const loginUrl = new URL('/login', request.url);
    if (pathname !== '/') {
      loginUrl.searchParams.set('redirect', pathname);
    }
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete(ACCESS_TOKEN_COOKIE);
    response.cookies.delete(REFRESH_TOKEN_COOKIE);
    return response;
  }

  const loginUrl = new URL('/login', request.url);
  if (pathname !== '/') {
    loginUrl.searchParams.set('redirect', pathname);
  }
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
