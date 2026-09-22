import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getCart,
  addToCart,
  removeFromCart,
  clearCart,
  mergeGuestCart,
} from './cart';
import { clientFetch } from '../api-client';
import { mockCartItem } from '@/test/fixtures';

vi.mock('../api-client', () => ({
  clientFetch: vi.fn(),
}));

const mockClientFetch = vi.mocked(clientFetch);

describe('Cart API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getCart: sends GET request to /cart and unwraps cart item array', async () => {
    mockClientFetch.mockResolvedValueOnce([mockCartItem]);

    const result = await getCart();

    expect(mockClientFetch).toHaveBeenCalledWith('/cart');
    expect(result).toEqual([mockCartItem]);
  });

  it('addToCart: sends POST request to /cart with item payload', async () => {
    mockClientFetch.mockResolvedValueOnce([mockCartItem]);

    const requestPayload = {
      product_id: 'prod_1',
      product_variant_id: 'var_1',
      pieces: 2,
    };

    const result = await addToCart(requestPayload);

    expect(mockClientFetch).toHaveBeenCalledWith('/cart', {
      method: 'POST',
      body: JSON.stringify(requestPayload),
    });
    expect(result).toEqual([mockCartItem]);
  });

  it('removeFromCart: sends DELETE request to /cart with item payload', async () => {
    mockClientFetch.mockResolvedValueOnce([]);

    const requestPayload = {
      product_id: 'prod_1',
      product_variant_id: 'var_1',
      pieces: 1,
    };

    const result = await removeFromCart(requestPayload);

    expect(mockClientFetch).toHaveBeenCalledWith('/cart', {
      method: 'DELETE',
      body: JSON.stringify(requestPayload),
    });
    expect(result).toEqual([]);
  });

  it('clearCart: sends DELETE request to /cart/clear', async () => {
    mockClientFetch.mockResolvedValueOnce([]);

    const result = await clearCart();

    expect(mockClientFetch).toHaveBeenCalledWith('/cart/clear', {
      method: 'DELETE',
    });
    expect(result).toEqual([]);
  });

  it('mergeGuestCart: sends POST request to /cart/merge with Authorization header', async () => {
    mockClientFetch.mockResolvedValueOnce([mockCartItem]);

    const token = 'sample_access_token_123';
    const result = await mergeGuestCart(token);

    expect(mockClientFetch).toHaveBeenCalledWith('/cart/merge', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    expect(result).toEqual([mockCartItem]);
  });
});
