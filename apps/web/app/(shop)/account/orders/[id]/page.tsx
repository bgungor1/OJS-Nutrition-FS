import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getAccessToken } from '@/lib/auth-cookies';
import { getOrderById } from '@/lib/api/orders';
import { OrderStatusBadge } from '@/components/account/order-status-badge';
import { OrderDetailItems } from '@/components/account/order-detail-items';
import { OrderDetailSummary } from '@/components/account/order-detail-summary';
import { formatDateTime } from '@/lib/utils/format';
import { ArrowLeft, Calendar } from 'lucide-react';

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: OrderDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Sipariş #${id.slice(0, 8)} | OJS Nutrition`,
    description: 'Sipariş detayları, ürün kalemleri ve teslimat bilgisi.',
  };
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;
  const token = await getAccessToken();
  if (!token) {
    redirect('/login');
  }

  let order;
  try {
    order = await getOrderById(token, id);
  } catch {
    notFound();
  }

  const items = order.items ?? order.cart_detail ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <Link
          href="/account/orders"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Siparişlerime Dön</span>
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">Sipariş #{order.order_no}</h1>
            <OrderStatusBadge status={order.status} />
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{formatDateTime(order.created_at)}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2">
          <OrderDetailItems items={items} />
        </div>
        <div className="lg:col-span-1">
          <OrderDetailSummary order={order} />
        </div>
      </div>
    </div>
  );
}
