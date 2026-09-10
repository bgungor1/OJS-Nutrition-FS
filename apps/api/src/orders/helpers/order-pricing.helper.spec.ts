import { Decimal } from '@prisma/client/runtime/library';
import { OrderPricingHelper } from './order-pricing.helper';
import {
  DEFAULT_SHIPPING_FEE,
  FREE_SHIPPING_THRESHOLD,
} from '../order.constants';

describe('OrderPricingHelper', () => {
  it('normal fiyatlı ürünlerin alt toplamını doğru hesaplamalıdır', () => {
    const items = [
      {
        pieces: 2,
        productVariant: {
          totalPrice: new Decimal(100),
          discountedPrice: null,
        },
      },
      {
        pieces: 1,
        productVariant: {
          totalPrice: new Decimal(250),
          discountedPrice: null,
        },
      },
    ];

    const subtotal = OrderPricingHelper.calculateSubtotal(items);
    expect(subtotal).toBe(450);
  });

  it('indirimli fiyatı (discountedPrice) olan ürünlerde indirimli fiyatı esas almalıdır', () => {
    const items = [
      {
        pieces: 2,
        productVariant: {
          totalPrice: new Decimal(200),
          discountedPrice: new Decimal(150),
        },
      },
    ];

    const subtotal = OrderPricingHelper.calculateSubtotal(items);
    expect(subtotal).toBe(300);
  });

  it('ücretsiz kargo eşiğinin (500 TL) altındaki tutarlarda standart kargo ücreti dönmelidir', () => {
    expect(OrderPricingHelper.calculateShippingFee(499.99)).toBe(
      DEFAULT_SHIPPING_FEE,
    );
    expect(OrderPricingHelper.calculateShippingFee(0)).toBe(
      DEFAULT_SHIPPING_FEE,
    );
  });

  it('ücretsiz kargo eşiğine eşit veya üstündeki tutarlarda 0 TL dönmelidir', () => {
    expect(
      OrderPricingHelper.calculateShippingFee(FREE_SHIPPING_THRESHOLD),
    ).toBe(0);
    expect(OrderPricingHelper.calculateShippingFee(1000)).toBe(0);
  });

  it('calculateOrderTotals ile subtotal, shippingFee ve totalPrice değerlerini eksiksiz üretmelidir', () => {
    const items = [
      {
        pieces: 1,
        productVariant: {
          totalPrice: new Decimal(200),
          discountedPrice: null,
        },
      },
    ];

    const totals = OrderPricingHelper.calculateOrderTotals(items);
    expect(totals).toEqual({
      subtotal: 200,
      shippingFee: DEFAULT_SHIPPING_FEE,
      totalPrice: 200 + DEFAULT_SHIPPING_FEE,
    });
  });
});
