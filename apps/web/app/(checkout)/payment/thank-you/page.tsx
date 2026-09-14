import type { Metadata } from 'next';
import { getAccessToken } from '@/lib/auth-cookies';
import { getOrderById } from '@/lib/api';
import { ThankYouView } from '@/components/checkout';
import type { OrderDetail } from '@/types';

export const metadata: Metadata = {
  title: 'Siparişiniz Alındı | OJS Nutrition',
  description: 'OJS Nutrition sipariş onay sayfası ve sipariş detayları.',
};

interface ThankYouPageProps {
  searchParams: Promise<{
    orderId?: string;
  }>;
}

export default async function ThankYouPage({ searchParams }: ThankYouPageProps) {
  const { orderId } = await searchParams;
  const token = await getAccessToken();

  let order: OrderDetail | null = null;
  if (orderId && token) {
    try {
      order = await getOrderById(token, orderId);
    } catch {
      order = null;
    }
  }

  return <ThankYouView order={order} orderId={orderId} />;
}
