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
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  total_price: number;
  shipping_fee: number;
  created_at: string;
  items?: ApiOrderItem[];
}
