import * as React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/test-utils';
import { CartDrawerItem } from './cart-drawer-item';
import type { CartItemResponse } from '@/types';

const mockItem: CartItemResponse = {
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
      total_services: 30,
    },
    price: {
      total_price: 549,
      discounted_price: 499,
      price_per_servings: 16.63,
      discount_percentage: 9,
      profit: 50,
    },
    photo_src: 'media/products/whey.jpg',
    is_available: true,
    stock_quantity: 10,
  },
};

describe('CartDrawerItem', () => {
  it('renders product name, aroma, gram, quantity, and formatted price', () => {
    render(
      <CartDrawerItem
        item={mockItem}
        onIncrement={vi.fn()}
        onDecrement={vi.fn()}
        onRemove={vi.fn()}
      />,
    );

    expect(screen.getByText('Whey Protein')).toBeInTheDocument();
    expect(screen.getByText('Çikolata')).toBeInTheDocument();
    expect(screen.getByText('1000g')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText(/998/)).toBeInTheDocument();
  });

  it('calls onIncrement when plus button is clicked', async () => {
    const handleIncrement = vi.fn();
    const { user } = render(
      <CartDrawerItem
        item={mockItem}
        onIncrement={handleIncrement}
        onDecrement={vi.fn()}
        onRemove={vi.fn()}
      />,
    );

    const incrementButton = screen.getByRole('button', { name: /adet artır/i });
    await user.click(incrementButton);

    expect(handleIncrement).toHaveBeenCalledTimes(1);
    expect(handleIncrement).toHaveBeenCalledWith(mockItem);
  });

  it('calls onDecrement when minus button is clicked', async () => {
    const handleDecrement = vi.fn();
    const { user } = render(
      <CartDrawerItem
        item={mockItem}
        onIncrement={vi.fn()}
        onDecrement={handleDecrement}
        onRemove={vi.fn()}
      />,
    );

    const decrementButton = screen.getByRole('button', { name: /adet azalt/i });
    await user.click(decrementButton);

    expect(handleDecrement).toHaveBeenCalledTimes(1);
    expect(handleDecrement).toHaveBeenCalledWith(mockItem);
  });

  it('calls onDecrement when item pieces is 1 to allow removal', async () => {
    const handleDecrement = vi.fn();
    const singlePieceItem = { ...mockItem, pieces: 1 };
    const { user } = render(
      <CartDrawerItem
        item={singlePieceItem}
        onIncrement={vi.fn()}
        onDecrement={handleDecrement}
        onRemove={vi.fn()}
      />,
    );

    const decrementButton = screen.getByRole('button', { name: /adet azalt/i });
    expect(decrementButton).not.toBeDisabled();
    await user.click(decrementButton);
    expect(handleDecrement).toHaveBeenCalledTimes(1);
    expect(handleDecrement).toHaveBeenCalledWith(singlePieceItem);
  });

  it('calls onRemove when delete button is clicked', async () => {
    const handleRemove = vi.fn();
    const { user } = render(
      <CartDrawerItem
        item={mockItem}
        onIncrement={vi.fn()}
        onDecrement={vi.fn()}
        onRemove={handleRemove}
      />,
    );

    const removeButton = screen.getByRole('button', {
      name: /ürünü sepetten sil/i,
    });
    await user.click(removeButton);

    expect(handleRemove).toHaveBeenCalledTimes(1);
    expect(handleRemove).toHaveBeenCalledWith(mockItem);
  });

  it('disables controls when disabled prop is true', () => {
    render(
      <CartDrawerItem
        item={mockItem}
        onIncrement={vi.fn()}
        onDecrement={vi.fn()}
        onRemove={vi.fn()}
        disabled={true}
      />,
    );

    expect(
      screen.getByRole('button', { name: /adet artır/i }),
    ).toBeDisabled();
    expect(
      screen.getByRole('button', { name: /adet azalt/i }),
    ).toBeDisabled();
    expect(
      screen.getByRole('button', { name: /ürünü sepetten sil/i }),
    ).toBeDisabled();
  });
});
