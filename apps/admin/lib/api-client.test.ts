import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';
import { ApiError, serverFetch, clientFetch } from './api-client';

const mockFetch = vi.fn();

const mockResponse = (data: unknown, ok = true, status = 200) =>
  ({
    ok,
    status,
    json: async () => data,
  }) as unknown as Response;

const mockJsonError = (status = 500) =>
  ({
    ok: false,
    status,
    json: async () => {
      throw new Error('Invalid JSON');
    },
  }) as unknown as Response;

vi.mock('./auth-cookies', () => ({
  getAccessToken: vi.fn(async () => 'mock-admin-token'),
}));

beforeEach(() => {
  mockFetch.mockReset();
  vi.stubGlobal('fetch', mockFetch);
});

afterAll(() => {
  vi.unstubAllGlobals();
});

describe('lib/api-client', () => {
  describe('ApiError', () => {
    it('creates an ApiError with correct name, status code, and optional reason', () => {
      const err = new ApiError('Unauthorized operation', 403, { role: 'Admin role required' });
      expect(err).toBeInstanceOf(Error);
      expect(err.name).toBe('ApiError');
      expect(err.status).toBe(403);
      expect(err.message).toBe('Unauthorized operation');
      expect(err.reason).toEqual({ role: 'Admin role required' });
    });
  });

  describe('serverFetch()', () => {
    it('unwraps data from { status: success, data } envelope and injects Authorization header', async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse({ status: 'success', data: { totalRevenue: 50000 } }),
      );

      const data = await serverFetch<{ totalRevenue: number }>('admin/dashboard/stats');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/v1/admin/dashboard/stats',
        expect.objectContaining({
          headers: expect.any(Headers),
        }),
      );
      expect(data).toEqual({ totalRevenue: 50000 });
    });

    it('returns undefined for 204 No Content responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
      } as Response);

      const result = await serverFetch<void>('products/prod-1', { method: 'DELETE' });
      expect(result).toBeUndefined();
    });

    it('throws ApiError with payload message and status code on failure response', async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse(
          { status: 'error', message: 'Product not found' },
          false,
          404,
        ),
      );

      await expect(serverFetch('/products/unknown')).rejects.toMatchObject({
        name: 'ApiError',
        status: 404,
        message: 'Product not found',
      });
    });

    it('falls back to default message when error response is not valid JSON', async () => {
      mockFetch.mockResolvedValueOnce(mockJsonError(502));

      await expect(serverFetch('/test')).rejects.toMatchObject({
        name: 'ApiError',
        status: 502,
        message: 'Yönetici API isteği başarısız oldu (502)',
      });
    });
  });

  describe('clientFetch()', () => {
    it('sends request with credentials: include and unwraps response data', async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse({ status: 'success', data: { updated: true } }),
      );

      const data = await clientFetch<{ updated: boolean }>('/admin/orders/1/status', {
        method: 'PATCH',
        body: JSON.stringify({ status: 'shipped' }),
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/v1/admin/orders/1/status',
        expect.objectContaining({
          credentials: 'include',
        }),
      );
      expect(data).toEqual({ updated: true });
    });

    it('throws ApiError when client response fails', async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse(
          { status: 'error', message: 'Invalid status transition' },
          false,
          400,
        ),
      );

      await expect(
        clientFetch('/admin/orders/1/status', { method: 'PATCH' }),
      ).rejects.toMatchObject({
        name: 'ApiError',
        status: 400,
        message: 'Invalid status transition',
      });
    });
  });
});
