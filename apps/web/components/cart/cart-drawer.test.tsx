import * as React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/test/test-utils';
import { CartDrawer } from './cart-drawer';
import { useCartStore } from '@/store/cart-store';
import type { CartItemResponse } from '@/types';

const mockItem: CartItemResponse = {
  id: 'cart_item_1',
  product_id: 'prod_1',
  product_variant_id: 'var_1',
  pieces: 1,
  created_at: '2026-09-14T12:00:00.000Z',
  product: {
    id: 'prod_1',
    name: 'BCAA 4:1:1',
    slug: 'bcaa-411',
    photo_src: 'media/products/bcaa.jpg',
  },
  variant: {
    id: 'var_1',
    aroma: 'Karpuz',
    size: {
      gram: 300,
      pieces: 1,
      total_services: 30,
    },
    price: {
      total_price: 350,
      discounted_price: null,
      price_per_servings: 11.66,
      discount_percentage: null,
      profit: null,
    },
    photo_src: 'media/products/bcaa.jpg',
    is_available: true,
    stock_quantity: 20,
  },
};

describe('CartDrawer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useCartStore.setState({
      items: [],
      isLoading: false,
      isDrawerOpen: true,
      error: null,
    });
  });

  it('renders empty cart view when cart has no items', () => {
    render(<CartDrawer />);

    expect(screen.getByText(/sepetiniz henüz boş/i)).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /alışverişe başla/i }),
    ).toBeInTheDocument();
  });

  it('closes drawer when "Alışverişe Başla" button is clicked in empty view', async () => {
    const { user } = render(<CartDrawer />);

    const startShoppingButton = screen.getByRole('link', {
      name: /alışverişe başla/i,
    });
    await user.click(startShoppingButton);

    expect(useCartStore.getState().isDrawerOpen).toBe(false);
  });

  it('renders cart items, shipping status, and price breakdown when items exist', () => {
    useCartStore.setState({ items: [mockItem] });
    render(<CartDrawer />);

    expect(screen.getByText(/sepetim \(1 ürün\)/i)).toBeInTheDocument();
    expect(screen.getByText('BCAA 4:1:1')).toBeInTheDocument();
    expect(screen.getByText('Karpuz')).toBeInTheDocument();
    expect(screen.getByText(/150/)).toBeInTheDocument();
    expect(screen.getAllByText(/350/).length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText(/49,90/)).toBeInTheDocument();
    expect(screen.getByText(/399,90/)).toBeInTheDocument();
  });

  it('renders free shipping badge when threshold is reached', () => {
    const expensiveItem = {
      ...mockItem,
      pieces: 2,
    }; // 2 * 350 = 700 TL > 500 TL
    useCartStore.setState({ items: [expensiveItem] });
    render(<CartDrawer />);

    expect(screen.getByText(/kargo ücretsiz!/i)).toBeInTheDocument();
    expect(screen.getByText('Ücretsiz')).toBeInTheDocument();
  });

  it('triggers addItem when item row increment button is clicked', async () => {
    const spyAddItem = vi.spyOn(useCartStore.getState(), 'addItem');
    useCartStore.setState({ items: [mockItem] });
    const { user } = render(<CartDrawer />);

    const incrementButton = screen.getByRole('button', { name: /adet artır/i });
    await user.click(incrementButton);

    expect(spyAddItem).toHaveBeenCalledWith('prod_1', 'var_1', 1);
  });

  it('triggers removeItem when item row remove button is clicked', async () => {
    const spyRemoveItem = vi.spyOn(useCartStore.getState(), 'removeItem');
    useCartStore.setState({ items: [mockItem] });
    const { user } = render(<CartDrawer />);

    const removeButton = screen.getByRole('button', {
      name: /ürünü sepetten sil/i,
    });
    await user.click(removeButton);

    expect(spyRemoveItem).toHaveBeenCalledWith('prod_1', 'var_1', 1);
  });

  it('triggers removeItem when item row decrement button is clicked on 1-piece item', async () => {
    const spyRemoveItem = vi.spyOn(useCartStore.getState(), 'removeItem');
    useCartStore.setState({ items: [mockItem] });
    const { user } = render(<CartDrawer />);

    const decrementButton = screen.getByRole('button', {
      name: /adet azalt/i,
    });
    await user.click(decrementButton);

    expect(spyRemoveItem).toHaveBeenCalledWith('prod_1', 'var_1', 1);
  });

  it('closes drawer and links to payment when checkout button is clicked', async () => {
    useCartStore.setState({ items: [mockItem] });
    const { user } = render(<CartDrawer />);

    const checkoutButton = screen.getByRole('link', {
      name: /siparişi onayla/i,
    });
    expect(checkoutButton).toHaveAttribute('href', '/payment');

    await user.click(checkoutButton);
    expect(useCartStore.getState().isDrawerOpen).toBe(false);
  });
});
