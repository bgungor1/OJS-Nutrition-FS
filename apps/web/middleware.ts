import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ACCESS_TOKEN_COOKIE = 'ojs_access_token';
const REFRESH_TOKEN_COOKIE = 'ojs_refresh_token';
const ACCESS_TOKEN_MAX_AGE = 15 * 60;
const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60;

const PROTECTED_PREFIXES = ['/account', '/payment'];
const GUEST_ONLY_ROUTES = ['/login'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  const isGuestRoute = GUEST_ONLY_ROUTES.includes(pathname);
  const isProtectedRoute = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (isGuestRoute && (accessToken || refreshToken)) {
    return NextResponse.redirect(new URL('/account', request.url));
  }

  if (isProtectedRoute) {
    if (accessToken) {
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
            const response = NextResponse.next();
            const isProduction = process.env.NODE_ENV === 'production';

            response.cookies.set(ACCESS_TOKEN_COOKIE, json.data.access, {
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
      } catch {
      }

      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete(ACCESS_TOKEN_COOKIE);
      response.cookies.delete(REFRESH_TOKEN_COOKIE);
      return response;
    }

    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/account/:path*', '/payment/:path*', '/login'],
};
