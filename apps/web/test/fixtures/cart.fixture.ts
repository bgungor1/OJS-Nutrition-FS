import type { CartItemResponse } from '@/types';

export const mockCartItem: CartItemResponse = {
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
