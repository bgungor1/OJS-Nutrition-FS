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
