'use server';

import { revalidatePath } from 'next/cache';
import { updateOrderStatus } from '@/lib/api/orders';
import type { OrderStatus } from '@/types';

export async function updateOrderStatusAction(
  orderId: string,
  status: OrderStatus,
) {
  const result = await updateOrderStatus(orderId, { status });
  revalidatePath('/orders');
  revalidatePath(`/orders/${orderId}`);
  revalidatePath('/');
  return result;
}
