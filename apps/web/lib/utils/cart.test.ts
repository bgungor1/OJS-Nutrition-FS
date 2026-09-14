import { describe, it, expect } from 'vitest';
import {
  calculateCartTotals,
  DEFAULT_FREE_SHIPPING_THRESHOLD,
  DEFAULT_SHIPPING_FEE,
} from './cart';
import type { CartItemResponse } from '@/types';

const createMockCartItem = (
  id: string,
  pieces: number,
  totalPrice: number,
  discountedPrice: number | null = null,
): CartItemResponse => ({
  id,
  product_id: `prod_${id}`,
  product_variant_id: `var_${id}`,
  pieces,
  created_at: new Date().toISOString(),
  product: {
    id: `prod_${id}`,
    name: `Product ${id}`,
    slug: `product-${id}`,
    photo_src: `media/products/${id}.jpg`,
  },
  variant: {
    id: `var_${id}`,
    aroma: 'Çikolata',
    size: {
      gram: 1000,
      pieces: 1,
      total_services: 30,
    },
    price: {
      total_price: totalPrice,
      discounted_price: discountedPrice,
      price_per_servings: 15,
      discount_percentage: discountedPrice ? 10 : null,
      profit: discountedPrice ? totalPrice - discountedPrice : null,
    },
    photo_src: `media/products/${id}.jpg`,
    is_available: true,
    stock_quantity: 50,
  },
});

describe('calculateCartTotals', () => {
  it('returns zero totals and no shipping fee for an empty cart', () => {
    const totals = calculateCartTotals([]);

    expect(totals).toEqual({
      totalPieces: 0,
      grossTotal: 0,
      subtotal: 0,
      totalSavings: 0,
      shippingFee: 0,
      grandTotal: 0,
      isFreeShipping: false,
      freeShippingThreshold: DEFAULT_FREE_SHIPPING_THRESHOLD,
      remainingForFreeShipping: DEFAULT_FREE_SHIPPING_THRESHOLD,
      freeShippingProgress: 0,
    });
  });

  it('calculates gross total, subtotal, and standard shipping fee for non-discounted items', () => {
    const item = createMockCartItem('1', 2, 150);
    const totals = calculateCartTotals([item]);

    expect(totals.totalPieces).toBe(2);
    expect(totals.grossTotal).toBe(300);
    expect(totals.subtotal).toBe(300);
    expect(totals.totalSavings).toBe(0);
    expect(totals.isFreeShipping).toBe(false);
    expect(totals.shippingFee).toBe(DEFAULT_SHIPPING_FEE);
    expect(totals.grandTotal).toBe(349.9);
    expect(totals.remainingForFreeShipping).toBe(200);
    expect(totals.freeShippingProgress).toBe(60);
  });

  it('calculates savings and discounted subtotal for discounted items', () => {
    const item = createMockCartItem('1', 1, 400, 350);
    const totals = calculateCartTotals([item]);

    expect(totals.totalPieces).toBe(1);
    expect(totals.grossTotal).toBe(400);
    expect(totals.subtotal).toBe(350);
    expect(totals.totalSavings).toBe(50);
    expect(totals.isFreeShipping).toBe(false);
    expect(totals.shippingFee).toBe(DEFAULT_SHIPPING_FEE);
    expect(totals.grandTotal).toBe(399.9);
    expect(totals.remainingForFreeShipping).toBe(150);
    expect(totals.freeShippingProgress).toBe(70);
  });

  it('waives shipping fee when subtotal exactly reaches free shipping threshold', () => {
    const item = createMockCartItem('1', 1, 500);
    const totals = calculateCartTotals([item]);

    expect(totals.subtotal).toBe(500);
    expect(totals.isFreeShipping).toBe(true);
    expect(totals.shippingFee).toBe(0);
    expect(totals.grandTotal).toBe(500);
    expect(totals.remainingForFreeShipping).toBe(0);
    expect(totals.freeShippingProgress).toBe(100);
  });

  it('caps free shipping progress at 100% when threshold is exceeded', () => {
    const item = createMockCartItem('1', 2, 400);
    const totals = calculateCartTotals([item]);

    expect(totals.subtotal).toBe(800);
    expect(totals.isFreeShipping).toBe(true);
    expect(totals.shippingFee).toBe(0);
    expect(totals.grandTotal).toBe(800);
    expect(totals.remainingForFreeShipping).toBe(0);
    expect(totals.freeShippingProgress).toBe(100);
  });

  it('supports custom threshold and shipping fee parameters', () => {
    const item = createMockCartItem('1', 1, 600);
    const customThreshold = 750;
    const customShippingFee = 35.0;

    const totals = calculateCartTotals([item], customThreshold, customShippingFee);

    expect(totals.isFreeShipping).toBe(false);
    expect(totals.shippingFee).toBe(35.0);
    expect(totals.remainingForFreeShipping).toBe(150);
    expect(totals.freeShippingProgress).toBe(80);
    expect(totals.grandTotal).toBe(635.0);
  });

  it('correctly rounds floating point numbers to avoid precision issues', () => {
    const item1 = createMockCartItem('1', 1, 29.99, 19.99);
    const item2 = createMockCartItem('2', 2, 49.95, 39.95);

    const totals = calculateCartTotals([item1, item2]);

    expect(totals.subtotal).toBe(99.89);
    expect(totals.grossTotal).toBe(129.89);
    expect(totals.totalSavings).toBe(30);
    expect(totals.grandTotal).toBe(149.79);
  });
});
