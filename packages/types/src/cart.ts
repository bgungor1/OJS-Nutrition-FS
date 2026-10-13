export interface CartProductSummary {
  id: string;
  name: string;
  slug: string;
  photo_src: string;
  photo?: string;
}

export interface CartVariantSize {
  gram: number;
  pieces: number;
  total_services: number;
}

export interface CartVariantPrice {
  total_price: number;
  discounted_price: number | null;
  price_per_servings: number;
  discount_percentage: number | null;
  profit: number | null;
}

export interface CartVariantSummary {
  id: string;
  aroma: string;
  size: CartVariantSize;
  price: CartVariantPrice;
  photo_src: string;
  is_available: boolean;
  stock_quantity: number;
}

export interface CartItemResponse {
  id: string;
  product_id: string;
  product_variant_id: string;
  pieces: number;
  created_at: string;
  updated_at?: string;
  product: CartProductSummary;
  variant: CartVariantSummary;
}

export type ApiCartItem = CartItemResponse;

export interface AddToCartRequest {
  product_id: string;
  product_variant_id: string;
  pieces: number;
}

export interface RemoveFromCartRequest {
  product_id: string;
  product_variant_id: string;
  pieces: number;
}

export interface CartTotals {
  totalPieces: number;
  grossTotal: number;
  subtotal: number;
  totalSavings: number;
  shippingFee: number;
  grandTotal: number;
  isFreeShipping: boolean;
  freeShippingThreshold: number;
  remainingForFreeShipping: number;
  freeShippingProgress: number;
}
