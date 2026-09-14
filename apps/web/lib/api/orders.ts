import { serverFetch } from '../api-client';
import type {
  CompleteShoppingRequest,
  OrderDetail,
  PaginatedOrdersResponse,
  PaymentSettingsResponse,
  ShipmentFeeResponse,
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

export async function getPaymentSettings(
  token: string,
): Promise<PaymentSettingsResponse> {
  return serverFetch<PaymentSettingsResponse>('/orders/payment-settings', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });
}

export async function calculateShipmentFee(
  token: string,
  addressId: string,
): Promise<ShipmentFeeResponse> {
  return serverFetch<ShipmentFeeResponse>(
    `/orders/calculate-shipment-fee?address_id=${encodeURIComponent(addressId)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    },
  );
}

export async function completeShopping(
  token: string,
  data: CompleteShoppingRequest,
): Promise<OrderDetail> {
  return serverFetch<OrderDetail>('/orders/complete-shopping', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
    cache: 'no-store',
  });
}
