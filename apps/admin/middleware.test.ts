import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { middleware } from './middleware';
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from './lib/constants';

function createMockJwt(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  const signature = 'mock-sig';
  return `${header}.${body}.${signature}`;
}

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('Admin Middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('allows access to protected routes when a valid admin token is present', async () => {
    const adminToken = createMockJwt({
      sub: 'admin-1',
      role: 'admin',
      exp: Math.floor(Date.now() / 1000) + 3600,
    });

    const req = new NextRequest('http://localhost:3001/', {
      headers: {
        cookie: `${ACCESS_TOKEN_COOKIE}=${adminToken}`,
      },
    });

    const res = await middleware(req);
    expect(res.headers.get('location')).toBeNull();
  });

  it('redirects to /login when no auth token is present', async () => {
    const req = new NextRequest('http://localhost:3001/products');
    const res = await middleware(req);

    expect(res.headers.get('location')).toBe('http://localhost:3001/login?redirect=%2Fproducts');
  });

  it('redirects to /login when user has a customer role token', async () => {
    const customerToken = createMockJwt({
      sub: 'customer-1',
      role: 'customer',
      exp: Math.floor(Date.now() / 1000) + 3600,
    });

    const req = new NextRequest('http://localhost:3001/orders', {
      headers: {
        cookie: `${ACCESS_TOKEN_COOKIE}=${customerToken}`,
      },
    });

    const res = await middleware(req);
    expect(res.headers.get('location')).toBe('http://localhost:3001/login?redirect=%2Forders');
  });

  it('redirects to / when an authenticated admin visits /login', async () => {
    const adminToken = createMockJwt({
      sub: 'admin-1',
      role: 'admin',
      exp: Math.floor(Date.now() / 1000) + 3600,
    });

    const req = new NextRequest('http://localhost:3001/login', {
      headers: {
        cookie: `${ACCESS_TOKEN_COOKIE}=${adminToken}`,
      },
    });

    const res = await middleware(req);
    expect(res.headers.get('location')).toBe('http://localhost:3001/');
  });

  it('refreshes token and updates cookies when access token is expired but valid refresh token exists', async () => {
    const newAdminToken = createMockJwt({
      sub: 'admin-1',
      role: 'admin',
      exp: Math.floor(Date.now() / 1000) + 3600,
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        status: 'success',
        data: {
          access: newAdminToken,
          refresh: 'new-refresh-token',
        },
      }),
    });

    const req = new NextRequest('http://localhost:3001/dashboard', {
      headers: {
        cookie: `${REFRESH_TOKEN_COOKIE}=valid-refresh`,
      },
    });

    const res = await middleware(req);
    expect(res.headers.get('location')).toBeNull();
    const setCookie = res.headers.get('set-cookie');
    expect(setCookie).toContain(ACCESS_TOKEN_COOKIE);
  });

  it('clears cookies and redirects to /login when refresh token fails', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ status: 'error', message: 'Token invalid' }),
    });

    const req = new NextRequest('http://localhost:3001/orders', {
      headers: {
        cookie: `${REFRESH_TOKEN_COOKIE}=invalid-refresh`,
      },
    });

    const res = await middleware(req);
    expect(res.headers.get('location')).toBe('http://localhost:3001/login?redirect=%2Forders');
  });
});
