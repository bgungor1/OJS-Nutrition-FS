export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'returned'
  | 'refunded';

export interface AdminOrderCustomer {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  phoneNumber?: string | null;
}

export interface AdminOrderItem {
  id: string;
  productId: string;
  productVariantId: string;
  productName: string;
  variantName?: string | null;
  pieces: number;
  unitPrice: number;
  totalPrice: number;
  photo?: string | null;
}

export interface AdminOrderPayment {
  provider: string;
  providerRef: string;
  cardType: string;
  last4: string;
  status: string;
  createdAt: string;
}

export interface AdminOrderListItem {
  id: string;
  orderNo: string;
  status: OrderStatus;
  totalPrice: number;
  shippingFee: number;
  itemCount: number;
  createdAt: string;
  user: AdminOrderCustomer;
  payment?: AdminOrderPayment | null;
}

export interface AdminOrderDetail {
  id: string;
  orderNo: string;
  status: OrderStatus;
  totalPrice: number;
  shippingFee: number;
  addressSnapshot: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  user: AdminOrderCustomer;
  items: AdminOrderItem[];
  payment?: AdminOrderPayment | null;
}

export interface AdminOrdersPaginatedResponse {
  count: number;
  limit: number;
  offset: number;
  search?: string | null;
  status?: OrderStatus | null;
  results: AdminOrderListItem[];
}

export interface AdminOrdersQuery {
  limit?: number;
  offset?: number;
  status?: OrderStatus;
  search?: string;
  startDate?: string;
  endDate?: string;
  sort?: string;
}

export interface UpdateAdminOrderStatusInput {
  status: OrderStatus;
}

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

export interface ShipmentFeeResponse {
  fee: number;
  currency: string;
  free_shipping_threshold: number;
  is_free: boolean;
}

export interface PaymentSettingsResponse {
  card_types: string[];
  payment_types: string[];
  currency: string;
}

export interface CompleteShoppingRequest {
  address_id: string;
  payment_type: 'credit_card' | 'debit_card';
  payment_token: string;
}
