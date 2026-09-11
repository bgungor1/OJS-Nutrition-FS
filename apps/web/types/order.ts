export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'returned';

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

export interface PaymentSummary {
  provider: string;
  provider_ref: string;
  card_type: string;
  last4: string;
  status: string;
  created_at: string;
}

export interface OrderItem {
  id: string;
  product_id: string;
  product_variant_id: string;
  product_name: string;
  variant_name?: string | null;
  pieces: number;
  unit_price: number;
  total_price: number;
  photo?: string | null;
  photo_src?: string | null;
}

export interface OrderDetail {
  id: string;
  order_no: string;
  status: OrderStatus;
  total_price: number;
  shipping_fee: number;
  subtotal: number;
  address_snapshot: AddressSnapshot;
  items: OrderItem[];
  cart_detail?: OrderItem[];
  payment?: PaymentSummary | null;
  created_at: string;
  updated_at?: string;
}

export interface OrderSummary {
  id: string;
  order_no: string;
  status: OrderStatus;
  total_price: number;
  shipping_fee: number;
  item_count: number;
  created_at: string;
  updated_at?: string;
  payment?: PaymentSummary | null;
}

export interface PaginatedOrdersResponse {
  count: number;
  results: OrderSummary[];
}

export interface ApiAddress {
  id: string;
  title: string;
  first_name: string;
  last_name: string;
  country_id: number;
  region_id: number;
  subregion_id: number;
  full_address: string;
  phone_number: string;
}

export interface ApiOrderItem {
  id: string;
  product_id: string;
  product_variant_id: string;
  product_name: string;
  variant_name?: string | null;
  pieces: number;
  unit_price: number;
  total_price: number;
  photo?: string | null;
}

export interface ApiOrder {
  id: string;
  order_no: string;
  status: OrderStatus;
  total_price: number;
  shipping_fee: number;
  created_at: string;
  items?: ApiOrderItem[];
}
