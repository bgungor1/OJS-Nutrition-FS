import { clientFetch } from '../api-client';
import type {
  AddToCartRequest,
  CartItemResponse,
  RemoveFromCartRequest,
} from '@/types';

export async function getCart(): Promise<CartItemResponse[]> {
  return clientFetch<CartItemResponse[]>('/cart');
}

export async function addToCart(
  data: AddToCartRequest,
): Promise<CartItemResponse[]> {
  return clientFetch<CartItemResponse[]>('/cart', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function removeFromCart(
  data: RemoveFromCartRequest,
): Promise<CartItemResponse[]> {
  return clientFetch<CartItemResponse[]>('/cart', {
    method: 'DELETE',
    body: JSON.stringify(data),
  });
}

export async function clearCart(): Promise<CartItemResponse[]> {
  return clientFetch<CartItemResponse[]>('/cart/clear', {
    method: 'DELETE',
  });
}

export async function mergeGuestCart(
  token: string,
): Promise<CartItemResponse[]> {
  return clientFetch<CartItemResponse[]>('/cart/merge', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
