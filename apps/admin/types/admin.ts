import type { Role } from './auth';

export type AdminOrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'returned';

export interface DashboardSummary {
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
  totalProducts: number;
}

export interface OrdersByStatus {
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  returned: number;
}

export interface AdminRecentOrder {
  id: string;
  orderNo: string;
  customerName: string;
  customerEmail: string;
  totalPrice: number;
  status: AdminOrderStatus;
  itemsCount: number;
  createdAt: string;
}

export interface AdminTopProduct {
  productId: string;
  productName: string;
  totalQuantitySold: number;
  totalRevenue: number;
  photoSrc: string | null;
}

export interface AdminLowStockVariant {
  variantId: string;
  productId: string;
  productName: string;
  productSlug: string;
  aroma: string;
  gram: number;
  stockQuantity: number;
  isAvailable: boolean;
  photoSrc: string;
}

export interface AdminSalesTrendItem {
  date: string;
  orderCount: number;
  totalRevenue: number;
}

export interface DashboardStatsResponse {
  summary: DashboardSummary;
  ordersByStatus: OrdersByStatus;
  recentOrders: AdminRecentOrder[];
  topProducts: AdminTopProduct[];
  lowStockVariants: AdminLowStockVariant[];
  salesTrend: AdminSalesTrendItem[];
}

export interface AdminUsersQuery {
  limit?: number;
  offset?: number;
  role?: Role;
  search?: string;
}

export interface AdminUserListItem {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: Role;
  authProvider: string;
  createdAt: string;
  orderCount: number;
}

export interface AdminUserDetailAddress {
  id: string;
  title: string;
  fullAddress: string;
  isDefault: boolean;
}

export interface AdminUserDetailOrder {
  id: string;
  orderNo: string;
  status: string;
  totalAmount: number;
  createdAt: string;
}

export interface AdminUserDetail {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: Role;
  authProvider: string;
  createdAt: string;
  addresses: AdminUserDetailAddress[];
  orders: AdminUserDetailOrder[];
}

export interface UpdateUserRoleDto {
  role: Role;
}
