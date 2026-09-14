import type { CartItemResponse, CartTotals } from '@/types';

export const DEFAULT_FREE_SHIPPING_THRESHOLD = 500;
export const DEFAULT_SHIPPING_FEE = 49.9;

function roundToTwo(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function calculateCartTotals(
  items: CartItemResponse[] = [],
  threshold: number = DEFAULT_FREE_SHIPPING_THRESHOLD,
  standardShippingFee: number = DEFAULT_SHIPPING_FEE,
): CartTotals {
  if (!items || items.length === 0) {
    return {
      totalPieces: 0,
      grossTotal: 0,
      subtotal: 0,
      totalSavings: 0,
      shippingFee: 0,
      grandTotal: 0,
      isFreeShipping: false,
      freeShippingThreshold: threshold,
      remainingForFreeShipping: threshold,
      freeShippingProgress: 0,
    };
  }

  let totalPieces = 0;
  let grossTotal = 0;
  let subtotal = 0;

  for (const item of items) {
    const pieces = Math.max(0, item.pieces || 0);
    totalPieces += pieces;

    const listPrice = item.variant?.price?.total_price || 0;
    const finalPrice =
      item.variant?.price?.discounted_price !== null &&
        item.variant?.price?.discounted_price !== undefined
        ? item.variant.price.discounted_price
        : listPrice;

    grossTotal += listPrice * pieces;
    subtotal += finalPrice * pieces;
  }

  grossTotal = roundToTwo(grossTotal);
  subtotal = roundToTwo(subtotal);

  const totalSavings = roundToTwo(Math.max(0, grossTotal - subtotal));
  const isFreeShipping = subtotal >= threshold;
  const shippingFee = subtotal > 0 && !isFreeShipping ? standardShippingFee : 0;
  const grandTotal = roundToTwo(subtotal + shippingFee);

  const remainingForFreeShipping = isFreeShipping
    ? 0
    : roundToTwo(Math.max(0, threshold - subtotal));

  const freeShippingProgress =
    threshold > 0
      ? Math.min(100, Math.max(0, Math.round((subtotal / threshold) * 100)))
      : 100;

  return {
    totalPieces,
    grossTotal,
    subtotal,
    totalSavings,
    shippingFee,
    grandTotal,
    isFreeShipping,
    freeShippingThreshold: threshold,
    remainingForFreeShipping,
    freeShippingProgress,
  };
}
