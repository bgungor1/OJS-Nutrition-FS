import { serverFetch } from '../api-client';
import type {
  OrderDetail,
  PaginatedOrdersResponse,
} from '@/types';

export async function getMyOrders(
  token: string,
  query?: { limit?: number; offset?: number },
): Promise<PaginatedOrdersResponse> {
  const searchParams = new URLSearchParams();
  if (query?.limit !== undefined) {
    searchParams.set('limit', query.limit.toString());
  }
  if (query?.offset !== undefined) {
    searchParams.set('offset', query.offset.toString());
  }

  const queryString = searchParams.toString();
  const endpoint = queryString ? `/orders?${queryString}` : '/orders';

  return serverFetch<PaginatedOrdersResponse>(endpoint, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });
}

export async function getOrderById(
  token: string,
  orderId: string,
): Promise<OrderDetail> {
  return serverFetch<OrderDetail>(`/orders/${orderId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });
}
