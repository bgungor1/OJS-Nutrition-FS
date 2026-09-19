export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export interface AdminOrderItem {
  id: string;
  variantId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  variant: {
    id: string;
    size: string | null;
    aroma: string | null;
    product: {
      id: string;
      name: string;
      slug: string;
    };
  };
}

export interface AdminOrdersQuery {
  limit?: number;
  offset?: number;
  status?: OrderStatus;
  search?: string;
}

export interface AdminOrderListItem {
  id: string;
  orderNo: string;
  status: OrderStatus;
  totalAmount: number;
  subtotal: number;
  shippingFee: number;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
  itemCount: number;
}

export interface AdminOrderDetail extends AdminOrderListItem {
  items: AdminOrderItem[];
  shippingAddress?: {
    title: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    city: string;
    district: string;
    fullAddress: string;
  } | null;
  payment?: {
    id: string;
    status: string;
    providerRef?: string | null;
    last4?: string | null;
    cardType?: string | null;
    amount: number;
    createdAt: string;
  } | null;
}

export interface UpdateAdminOrderStatusDto {
  status: OrderStatus;
}
