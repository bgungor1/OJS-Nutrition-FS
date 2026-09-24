import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { middleware } from './middleware';

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

describe('Web Middleware - Role-based routing and protection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('allows customer access to protected /account route', async () => {
    const customerToken = createMockJwt({
      sub: 'cust-1',
      role: 'customer',
      exp: Math.floor(Date.now() / 1000) + 3600,
    });

    const req = new NextRequest('http://localhost:3001/account', {
      headers: {
        cookie: `ojs_access_token=${customerToken}`,
      },
    });

    const res = await middleware(req);
    expect(res.headers.get('location')).toBeNull();
  });

  it('redirects admin to admin portal when visiting protected /account', async () => {
    const adminToken = createMockJwt({
      sub: 'admin-1',
      role: 'admin',
      exp: Math.floor(Date.now() / 1000) + 3600,
    });

    const req = new NextRequest('http://localhost:3001/account', {
      headers: {
        cookie: `ojs_access_token=${adminToken}`,
      },
    });

    const res = await middleware(req);
    expect(res.headers.get('location')).toBe('http://localhost:3002/');
  });

  it('redirects admin to admin portal when visiting /login while logged in', async () => {
    const adminToken = createMockJwt({
      sub: 'admin-1',
      role: 'admin',
      exp: Math.floor(Date.now() / 1000) + 3600,
    });

    const req = new NextRequest('http://localhost:3001/login', {
      headers: {
        cookie: `ojs_access_token=${adminToken}`,
      },
    });

    const res = await middleware(req);
    expect(res.headers.get('location')).toBe('http://localhost:3002/');
  });

  it('redirects customer to /account when visiting /login while logged in', async () => {
    const customerToken = createMockJwt({
      sub: 'cust-1',
      role: 'customer',
      exp: Math.floor(Date.now() / 1000) + 3600,
    });

    const req = new NextRequest('http://localhost:3001/login', {
      headers: {
        cookie: `ojs_access_token=${customerToken}`,
      },
    });

    const res = await middleware(req);
    expect(res.headers.get('location')).toBe('http://localhost:3001/account');
  });

  it('redirects unauthenticated user to /login when accessing protected /account', async () => {
    const req = new NextRequest('http://localhost:3001/account');
    const res = await middleware(req);

    expect(res.headers.get('location')).toBe('http://localhost:3001/login?redirect=%2Faccount');
  });
});
