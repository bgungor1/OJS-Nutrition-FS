import { serverFetch } from '@/lib/api-client';
import type {
  AdminOrderDetail,
  AdminOrdersPaginatedResponse,
  AdminOrdersQuery,
  UpdateAdminOrderStatusInput,
} from '@/types';

export async function listOrders(
  query: AdminOrdersQuery = {},
): Promise<AdminOrdersPaginatedResponse> {
  const params = new URLSearchParams();
  if (query.limit !== undefined) params.set('limit', String(query.limit));
  if (query.offset !== undefined) params.set('offset', String(query.offset));
  if (query.status) params.set('status', query.status);
  if (query.search) params.set('search', query.search);
  if (query.startDate) params.set('startDate', query.startDate);
  if (query.endDate) params.set('endDate', query.endDate);
  if (query.sort) params.set('sort', query.sort);

  const queryString = params.toString();
  const endpoint = queryString ? `/admin/orders?${queryString}` : '/admin/orders';
  return serverFetch<AdminOrdersPaginatedResponse>(endpoint);
}

export async function getOrderById(id: string): Promise<AdminOrderDetail> {
  return serverFetch<AdminOrderDetail>(`/admin/orders/${id}`);
}

export async function updateOrderStatus(
  id: string,
  dto: UpdateAdminOrderStatusInput,
): Promise<AdminOrderDetail> {
  return serverFetch<AdminOrderDetail>(`/admin/orders/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify(dto),
  });
}
