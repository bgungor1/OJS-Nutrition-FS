import type { Role } from './auth';

export interface AdminRecentOrder {
  id: string;
  orderNo: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  user: {
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
  itemCount: number;
}

export interface AdminTopProduct {
  productId: string;
  name: string;
  slug: string;
  totalSold: number;
  revenue: number;
}

export interface AdminCriticalStock {
  variantId: string;
  productId: string;
  productName: string;
  size: string | null;
  aroma: string | null;
  stock: number;
}

export interface AdminSalesTrendDay {
  date: string;
  totalSales: number;
  orderCount: number;
}

export interface DashboardStatsResponse {
  totalOrders: number;
  totalRevenue: number;
  ordersByStatus: Record<string, number>;
  recentOrders: AdminRecentOrder[];
  topProducts: AdminTopProduct[];
  criticalStockAlerts: AdminCriticalStock[];
  salesTrend: AdminSalesTrendDay[];
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
