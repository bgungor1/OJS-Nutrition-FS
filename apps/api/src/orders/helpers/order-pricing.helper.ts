import {
  DEFAULT_SHIPPING_FEE,
  FREE_SHIPPING_THRESHOLD,
} from '../order.constants';

export interface CartItemPricingInfo {
  pieces: number;
  productVariant: {
    totalPrice: unknown;
    discountedPrice: unknown;
  };
}

export interface OrderTotals {
  subtotal: number;
  shippingFee: number;
  totalPrice: number;
}

export class OrderPricingHelper {
  static calculateSubtotal(items: CartItemPricingInfo[]): number {
    const raw = items.reduce((acc, item) => {
      const price =
        item.productVariant.discountedPrice !== null &&
        item.productVariant.discountedPrice !== undefined
          ? Number(item.productVariant.discountedPrice)
          : Number(item.productVariant.totalPrice);
      return acc + price * item.pieces;
    }, 0);

    return Number(raw.toFixed(2));
  }

  static calculateShippingFee(subtotal: number): number {
    if (subtotal >= FREE_SHIPPING_THRESHOLD) {
      return 0;
    }
    return DEFAULT_SHIPPING_FEE;
  }

  static calculateOrderTotals(items: CartItemPricingInfo[]): OrderTotals {
    const subtotal = this.calculateSubtotal(items);
    const shippingFee = this.calculateShippingFee(subtotal);
    const totalPrice = Number((subtotal + shippingFee).toFixed(2));

    return { subtotal, shippingFee, totalPrice };
  }
}
