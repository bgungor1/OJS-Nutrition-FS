import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getAccessToken } from '@/lib/auth-cookies';
import { getMyOrders } from '@/lib/api/orders';
import { OrderList } from '@/components/account/order-list';

export const metadata: Metadata = {
  title: 'Siparişlerim | OJS Nutrition',
  description: 'OJS Nutrition geçmiş ve mevcut siparişlerinizin listesi.',
};

export default async function OrdersPage() {
  const token = await getAccessToken();
  if (!token) {
    redirect('/login');
  }

  let orders = [];
  try {
    const data = await getMyOrders(token);
    orders = data.results ?? [];
  } catch {
    redirect('/login');
  }

  return <OrderList orders={orders} />;
}
