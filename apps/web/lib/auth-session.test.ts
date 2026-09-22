import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mergeGuestCartSession } from './auth-session';
import { serverFetch } from './api-client';

const mockCookieStore = {
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
};

vi.mock('./api-client', () => ({
  serverFetch: vi.fn(),
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => mockCookieStore),
}));

describe('mergeGuestCartSession', () => {
  const mockServerFetch = vi.mocked(serverFetch);

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  it('returns false when no guest_cart_id exists in cookies', async () => {
    mockCookieStore.get.mockReturnValueOnce(undefined);

    const result = await mergeGuestCartSession('mock_token');

    expect(result).toBe(false);
    expect(mockServerFetch).not.toHaveBeenCalled();
  });

  it('merges guest cart and deletes cookie when guest_cart_id is present', async () => {
    mockCookieStore.get.mockReturnValueOnce({ value: 'guest_123' });
    mockServerFetch.mockResolvedValueOnce({} as unknown as never);

    const result = await mergeGuestCartSession('test_access_token');

    expect(result).toBe(true);
    expect(mockServerFetch).toHaveBeenCalledWith('/cart/merge', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer test_access_token',
        Cookie: 'guest_cart_id=guest_123',
      },
      cache: 'no-store',
    });
    expect(mockCookieStore.delete).toHaveBeenCalledWith('guest_cart_id');
  });

  it('uses options.guestCartId and triggers options.onSuccess when provided', async () => {
    const mockOnSuccess = vi.fn();
    mockServerFetch.mockResolvedValueOnce({} as unknown as never);

    const result = await mergeGuestCartSession('oauth_token', {
      guestCartId: 'oauth_guest_456',
      onSuccess: mockOnSuccess,
    });

    expect(result).toBe(true);
    expect(mockServerFetch).toHaveBeenCalledWith('/cart/merge', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer oauth_token',
        Cookie: 'guest_cart_id=oauth_guest_456',
      },
      cache: 'no-store',
    });
    expect(mockOnSuccess).toHaveBeenCalledTimes(1);
    expect(mockCookieStore.get).not.toHaveBeenCalled();
  });

  it('handles serverFetch failure gracefully and logs a warning', async () => {
    mockCookieStore.get.mockReturnValueOnce({ value: 'guest_fail' });
    mockServerFetch.mockRejectedValueOnce(new Error('Network offline'));

    const result = await mergeGuestCartSession('mock_token');

    expect(result).toBe(false);
    expect(console.warn).toHaveBeenCalledWith(
      '[auth-session] Misafir sepeti birleştirilemedi:',
      expect.any(Error),
    );
  });
});
