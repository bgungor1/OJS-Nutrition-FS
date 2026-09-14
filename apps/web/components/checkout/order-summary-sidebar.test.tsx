import * as React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/test-utils';
import { OrderSummarySidebar } from './order-summary-sidebar';
import type { CartItemResponse, CartTotals } from '@/types';

const mockItem: CartItemResponse = {
  id: 'item_1',
  product_id: 'prod_1',
  product_variant_id: 'var_1',
  pieces: 2,
  created_at: '2026-09-14T12:00:00.000Z',
  product: {
    id: 'prod_1',
    name: 'Kreatin Monohidrat',
    slug: 'kreatin-monohidrat',
    photo_src: 'media/products/creatine.jpg',
  },
  variant: {
    id: 'var_1',
    aroma: 'Aromasız',
    size: {
      gram: 300,
      pieces: 1,
      total_services: 60,
    },
    price: {
      total_price: 350,
      discounted_price: 300,
      price_per_servings: 5,
      discount_percentage: 14,
      profit: 50,
    },
    photo_src: 'media/products/creatine.jpg',
    is_available: true,
    stock_quantity: 15,
  },
};

const mockTotals: CartTotals = {
  grossTotal: 700,
  subtotal: 600,
  totalSavings: 100,
  shippingFee: 0,
  grandTotal: 600,
  isFreeShipping: true,
  freeShippingThreshold: 500,
  freeShippingProgress: 100,
  remainingForFreeShipping: 0,
  totalPieces: 2,
};

describe('OrderSummarySidebar', () => {
  it('renders cart item details and price breakdown', () => {
    render(
      <OrderSummarySidebar
        items={[mockItem]}
        totals={mockTotals}
        isSubmitting={false}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByText('Kreatin Monohidrat')).toBeInTheDocument();
    expect(screen.getByText(/Aromasız • 2 Adet/i)).toBeInTheDocument();
    expect(screen.getByText('Ücretsiz')).toBeInTheDocument();
    expect(screen.getAllByText(/600/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole('button', { name: /siparişi onayla/i })).toBeInTheDocument();
  });

  it('calls onSubmit when confirm button is clicked', async () => {
    const handleSubmit = vi.fn();
    const { user } = render(
      <OrderSummarySidebar
        items={[mockItem]}
        totals={mockTotals}
        isSubmitting={false}
        onSubmit={handleSubmit}
      />,
    );

    const button = screen.getByRole('button', { name: /siparişi onayla/i });
    await user.click(button);

    expect(handleSubmit).toHaveBeenCalledTimes(1);
  });

  it('disables submit button when disabled prop is true', () => {
    render(
      <OrderSummarySidebar
        items={[mockItem]}
        totals={mockTotals}
        isSubmitting={false}
        onSubmit={vi.fn()}
        disabled={true}
      />,
    );

    const button = screen.getByRole('button', { name: /siparişi onayla/i });
    expect(button).toBeDisabled();
  });
});
