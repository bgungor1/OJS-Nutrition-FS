import { serverFetch } from '../api-client';
import type {
  Address,
  CreateAddressRequest,
  DeleteAddressResponse,
  PaginatedAddressesResponse,
  UpdateAddressRequest,
} from '@/types';

export async function getAddresses(
  token: string,
  query?: { limit?: number; offset?: number },
): Promise<PaginatedAddressesResponse> {
  const searchParams = new URLSearchParams();
  if (query?.limit !== undefined) {
    searchParams.set('limit', query.limit.toString());
  }
  if (query?.offset !== undefined) {
    searchParams.set('offset', query.offset.toString());
  }

  const queryString = searchParams.toString();
  const endpoint = queryString ? `/users/addresses?${queryString}` : '/users/addresses';

  return serverFetch<PaginatedAddressesResponse>(endpoint, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });
}

export async function getAddressById(token: string, id: string): Promise<Address> {
  return serverFetch<Address>(`/users/addresses/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });
}

export async function createAddress(
  token: string,
  dto: CreateAddressRequest,
): Promise<Address> {
  return serverFetch<Address>('/users/addresses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(dto),
    cache: 'no-store',
  });
}

export async function updateAddress(
  token: string,
  id: string,
  dto: UpdateAddressRequest,
): Promise<Address> {
  return serverFetch<Address>(`/users/addresses/${id}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(dto),
    cache: 'no-store',
  });
}

export async function deleteAddress(
  token: string,
  id: string,
): Promise<DeleteAddressResponse> {
  return serverFetch<DeleteAddressResponse>(`/users/addresses/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });
}
