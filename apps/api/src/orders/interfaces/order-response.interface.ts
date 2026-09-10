import { OrderStatus } from '@prisma/client';

export interface AddressSnapshot {
  title: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  country: string;
  region: string;
  subregion: string;
  fullAddress: string;
}

export interface OrderItemResponse {
  id: string;
  product_id: string;
  product_variant_id: string;
  product_name: string;
  variant_name: string | null;
  pieces: number;
  unit_price: number;
  total_price: number;
  photo: string | null;
  photo_src: string | null;
}
export interface PaymentSummaryResponse {
  provider: string;
  provider_ref: string;
  card_type: string;
  last4: string;
  status: string;
  created_at: string;
}

export interface OrderDetailResponse {
  id: string;
  order_no: string;
  status: OrderStatus;
  total_price: number;
  shipping_fee: number;
  subtotal: number;
  address_snapshot: AddressSnapshot;
  items: OrderItemResponse[];
  cart_detail: OrderItemResponse[];
  payment: PaymentSummaryResponse | null;
  created_at: string;
  updated_at: string;
}

export interface OrderSummaryResponse {
  id: string;
  order_no: string;
  status: OrderStatus;
  total_price: number;
  shipping_fee: number;
  item_count: number;
  created_at: string;
  updated_at: string;
  payment: PaymentSummaryResponse | null;
}

export interface PaginatedOrdersResponse {
  count: number;
  results: OrderSummaryResponse[];
}

export interface ShipmentFeeResponse {
  fee: number;
  currency: string;
  free_shipping_threshold: number;
  is_free: boolean;
}
