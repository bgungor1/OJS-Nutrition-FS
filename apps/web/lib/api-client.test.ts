import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';
import { ApiError, serverFetch, clientFetch } from './api-client';

const mockFetch = vi.fn();

const mockResponse = (data: unknown, ok = true, status = 200) =>
  ({ ok, status, json: async () => data }) as unknown as Response;

const mockJsonError = (status = 500) =>
  ({
    ok: false,
    status,
    json: async () => {
      throw new Error('Invalid JSON');
    },
  }) as unknown as Response;

beforeEach(() => {
  mockFetch.mockReset();
  vi.stubGlobal('fetch', mockFetch);
});

afterAll(() => {
  vi.unstubAllGlobals();
});

describe('ApiError', () => {
  it('creates an ApiError with default status 500 and optional reason', () => {
    const defaultError = new ApiError('Default error');
    expect(defaultError).toBeInstanceOf(Error);
    expect(defaultError).toMatchObject({ name: 'ApiError', message: 'Default error', status: 500 });
    expect(defaultError.reason).toBeUndefined();

    const customError = new ApiError('Custom error', 409, { email: 'Exists' });
    expect(customError).toMatchObject({ message: 'Custom error', status: 409, reason: { email: 'Exists' } });
  });
});

describe('serverFetch', () => {
  it('normalizes endpoint slash, attaches default and custom headers, and unwraps data', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ status: 'success', data: { id: 1 } }));
    const dataWithoutSlash = await serverFetch<{ id: number }>('products');
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/products',
      expect.objectContaining({ headers: { 'Content-Type': 'application/json' } }),
    );
    expect(dataWithoutSlash).toEqual({ id: 1 });

    mockFetch.mockResolvedValueOnce(mockResponse({ status: 'success', data: { id: 2 } }));
    await serverFetch('/orders', { headers: { Authorization: 'Bearer token' } });
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/orders',
      expect.objectContaining({ headers: { 'Content-Type': 'application/json', Authorization: 'Bearer token' } }),
    );
  });

  it('throws ApiError with payload message and reason on non-ok response', async () => {
    mockFetch.mockResolvedValueOnce(
      mockResponse({ status: 'error', message: 'Invalid', reason: { field: 'required' } }, false, 400),
    );
    await expect(serverFetch('/test')).rejects.toMatchObject({
      name: 'ApiError',
      message: 'Invalid',
      status: 400,
      reason: { field: 'required' },
    });
  });

  it('falls back to default message when non-ok response is not valid JSON', async () => {
    mockFetch.mockResolvedValueOnce(mockJsonError(502));
    await expect(serverFetch('/down')).rejects.toMatchObject({
      name: 'ApiError',
      message: 'API isteği başarısız oldu (502)',
      status: 502,
    });
  });

  it('throws ApiError when 200 response body has status error', async () => {
    mockFetch.mockResolvedValueOnce(
      mockResponse({ status: 'error', message: 'Business fail', reason: { code: 'EXPIRED' } }),
    );
    await expect(serverFetch('/action')).rejects.toMatchObject({
      message: 'Business fail',
      status: 200,
      reason: { code: 'EXPIRED' },
    });

    mockFetch.mockResolvedValueOnce(mockResponse({ status: 'error' }));
    await expect(serverFetch('/action')).rejects.toMatchObject({
      message: 'Bilinmeyen API hatası',
      status: 200,
    });
  });
});

describe('clientFetch', () => {
  it('calls client base URL with normalized path and unwraps data', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ status: 'success', data: { user: 'Alice' } }));
    const result = await clientFetch<{ user: string }>('user/profile');
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/user/profile',
      expect.any(Object),
    );
    expect(result).toEqual({ user: 'Alice' });
  });

  it('throws ApiError with payload details on non-ok response', async () => {
    mockFetch.mockResolvedValueOnce(
      mockResponse({ status: 'error', message: 'Not found', reason: { id: 'missing' } }, false, 404),
    );
    await expect(clientFetch('/items/999')).rejects.toMatchObject({
      name: 'ApiError',
      message: 'Not found',
      status: 404,
      reason: { id: 'missing' },
    });
  });

  it('falls back to default client message when non-ok response is unparseable', async () => {
    mockFetch.mockResolvedValueOnce(mockJsonError(500));
    await expect(clientFetch('/crash')).rejects.toMatchObject({
      name: 'ApiError',
      message: 'İstemci isteği başarısız oldu (500)',
      status: 500,
    });
  });

  it('throws ApiError when 200 response body has status error', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ status: 'error', message: 'Mutation failed' }));
    await expect(clientFetch('/action')).rejects.toMatchObject({
      message: 'Mutation failed',
      status: 200,
    });

    mockFetch.mockResolvedValueOnce(mockResponse({ status: 'error' }));
    await expect(clientFetch('/action')).rejects.toMatchObject({
      message: 'Bilinmeyen istemci hatası',
      status: 200,
    });
  });
});
