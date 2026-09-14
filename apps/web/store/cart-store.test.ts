import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useCartStore } from './cart-store';
import {
  getCart,
  addToCart,
  removeFromCart,
  clearCart,
  mergeGuestCart,
} from '@/lib/api/cart';
import type { CartItemResponse } from '@/types';

vi.mock('@/lib/api/cart', () => ({
  getCart: vi.fn(),
  addToCart: vi.fn(),
  removeFromCart: vi.fn(),
  clearCart: vi.fn(),
  mergeGuestCart: vi.fn(),
}));

const mockGetCart = vi.mocked(getCart);
const mockAddToCart = vi.mocked(addToCart);
const mockRemoveFromCart = vi.mocked(removeFromCart);
const mockClearCart = vi.mocked(clearCart);
const mockMergeGuestCart = vi.mocked(mergeGuestCart);

const mockCartItem: CartItemResponse = {
  id: 'cart_item_1',
  product_id: 'prod_1',
  product_variant_id: 'var_1',
  pieces: 2,
  created_at: '2026-09-14T12:00:00.000Z',
  product: {
    id: 'prod_1',
    name: 'Whey Protein',
    slug: 'whey-protein',
    photo_src: 'media/products/whey.jpg',
  },
  variant: {
    id: 'var_1',
    aroma: 'Çikolata',
    size: {
      gram: 1000,
      pieces: 1,
      total_services: 33,
    },
    price: {
      total_price: 549,
      discounted_price: 499,
      price_per_servings: 15.12,
      discount_percentage: 9,
      profit: 50,
    },
    photo_src: 'media/products/whey.jpg',
    is_available: true,
    stock_quantity: 45,
  },
};

describe('useCartStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useCartStore.setState({
      items: [],
      isLoading: false,
      isDrawerOpen: false,
      error: null,
    });
  });

  it('has initial default state', () => {
    const state = useCartStore.getState();

    expect(state.items).toEqual([]);
    expect(state.isLoading).toBe(false);
    expect(state.isDrawerOpen).toBe(false);
    expect(state.error).toBeNull();
  });

  it('fetchCart: populates items and resets loading state', async () => {
    mockGetCart.mockResolvedValueOnce([mockCartItem]);

    await useCartStore.getState().fetchCart();

    const state = useCartStore.getState();
    expect(mockGetCart).toHaveBeenCalledTimes(1);
    expect(state.items).toEqual([mockCartItem]);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('fetchCart: sets error message on API failure', async () => {
    mockGetCart.mockRejectedValueOnce(new Error('Network error'));

    await useCartStore.getState().fetchCart();

    const state = useCartStore.getState();
    expect(state.items).toEqual([]);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBe('Network error');
  });

  it('addItem: calls addToCart API, updates items, opens drawer, and returns true', async () => {
    mockAddToCart.mockResolvedValueOnce([mockCartItem]);

    const success = await useCartStore
      .getState()
      .addItem('prod_1', 'var_1', 2);

    const state = useCartStore.getState();
    expect(mockAddToCart).toHaveBeenCalledWith({
      product_id: 'prod_1',
      product_variant_id: 'var_1',
      pieces: 2,
    });
    expect(success).toBe(true);
    expect(state.items).toEqual([mockCartItem]);
    expect(state.isDrawerOpen).toBe(true);
    expect(state.isLoading).toBe(false);
  });

  it('addItem: sets error message and returns false on failure', async () => {
    mockAddToCart.mockRejectedValueOnce(new Error('Insufficient stock'));

    const success = await useCartStore
      .getState()
      .addItem('prod_1', 'var_1', 5);

    const state = useCartStore.getState();
    expect(success).toBe(false);
    expect(state.items).toEqual([]);
    expect(state.error).toBe('Insufficient stock');
    expect(state.isLoading).toBe(false);
  });

  it('removeItem: calls removeFromCart API, updates items, and returns true', async () => {
    useCartStore.setState({ items: [mockCartItem] });
    mockRemoveFromCart.mockResolvedValueOnce([]);

    const success = await useCartStore
      .getState()
      .removeItem('prod_1', 'var_1', 2);

    const state = useCartStore.getState();
    expect(mockRemoveFromCart).toHaveBeenCalledWith({
      product_id: 'prod_1',
      product_variant_id: 'var_1',
      pieces: 2,
    });
    expect(success).toBe(true);
    expect(state.items).toEqual([]);
    expect(state.isLoading).toBe(false);
  });

  it('removeItem: sets error message and returns false on failure', async () => {
    mockRemoveFromCart.mockRejectedValueOnce(new Error('Item not found'));

    const success = await useCartStore
      .getState()
      .removeItem('prod_1', 'var_1', 1);

    const state = useCartStore.getState();
    expect(success).toBe(false);
    expect(state.error).toBe('Item not found');
    expect(state.isLoading).toBe(false);
  });

  it('clearCart: calls clearCart API and empties items array', async () => {
    useCartStore.setState({ items: [mockCartItem] });
    mockClearCart.mockResolvedValueOnce([]);

    await useCartStore.getState().clearCart();

    const state = useCartStore.getState();
    expect(mockClearCart).toHaveBeenCalledTimes(1);
    expect(state.items).toEqual([]);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('clearCart: sets error message on failure', async () => {
    mockClearCart.mockRejectedValueOnce(new Error('Clear error'));

    await useCartStore.getState().clearCart();

    const state = useCartStore.getState();
    expect(state.error).toBe('Clear error');
    expect(state.isLoading).toBe(false);
  });

  it('mergeGuestCart: calls mergeGuestCart API with token and updates items', async () => {
    mockMergeGuestCart.mockResolvedValueOnce([mockCartItem]);

    await useCartStore.getState().mergeGuestCart('valid_token_123');

    const state = useCartStore.getState();
    expect(mockMergeGuestCart).toHaveBeenCalledWith('valid_token_123');
    expect(state.items).toEqual([mockCartItem]);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('mergeGuestCart: sets error message on failure', async () => {
    mockMergeGuestCart.mockRejectedValueOnce(new Error('Merge conflict'));

    await useCartStore.getState().mergeGuestCart('invalid_token');

    const state = useCartStore.getState();
    expect(state.error).toBe('Merge conflict');
    expect(state.isLoading).toBe(false);
  });

  it('drawer controls: openDrawer, closeDrawer, and toggleDrawer manage isDrawerOpen state', () => {
    expect(useCartStore.getState().isDrawerOpen).toBe(false);

    useCartStore.getState().openDrawer();
    expect(useCartStore.getState().isDrawerOpen).toBe(true);

    useCartStore.getState().closeDrawer();
    expect(useCartStore.getState().isDrawerOpen).toBe(false);

    useCartStore.getState().toggleDrawer();
    expect(useCartStore.getState().isDrawerOpen).toBe(true);

    useCartStore.getState().toggleDrawer();
    expect(useCartStore.getState().isDrawerOpen).toBe(false);
  });

  it('resetError: clears error state', () => {
    useCartStore.setState({ error: 'Sample error' });
    expect(useCartStore.getState().error).toBe('Sample error');

    useCartStore.getState().resetError();
    expect(useCartStore.getState().error).toBeNull();
  });
});
