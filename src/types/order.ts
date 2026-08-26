
export interface Order {
  order_no: string
  order_status: OrderStatus
  created_at: string
  total_price: number
  shipping_fee?: number
  cart_detail?: OrderItem[]
  address?: OrderAddress
}

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "returned"

export interface OrderItem {
  id: string
  product_id: number
  product_variant_id: string
  product_name: string
  variant_name?: string
  pieces: number
  unit_price: number
  total_price: number
  photo?: string
}

export interface OrderAddress {
  id: string
  title: string
  first_name: string
  last_name: string
  full_address: string
  phone_number: string
}

export interface CompleteShoppingRequest {
  address_id: string
  payment_type: 'credit_cart' | 'debit_cart'
  card_digits: string
  card_expiration_date: string
  card_security_code: string
  card_type: 'VISA' | 'MASTERCARD'
}

export interface PaymentSettings {
  card_types: string[]
  payment_types: string[]
}


export interface ShipmentFee {
  fee: number
  currency?: string
}

export interface OrderListResponse {
  status: string
  data: Order[]
}

export interface OrderDetailResponse {
  status: string
  data: Order
}

export interface PaymentSettingsResponse {
  status: string
  data: PaymentSettings
}

export interface ShipmentFeeResponse {
  status: string
  data: ShipmentFee
}

export interface CompleteShoppingResponse {
  status: string
  data: Order
}
