import * as React from 'react';
import Link from 'next/link';
import { ShoppingBag, ExternalLink } from 'lucide-react';
import type { AdminUserDetailOrder } from '@/types';

interface UserDetailOrdersProps {
  orders: AdminUserDetailOrder[];
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Beklemede',
  processing: 'Hazırlanıyor',
  shipped: 'Kargoya Verildi',
  delivered: 'Teslim Edildi',
  cancelled: 'İptal Edildi',
  refunded: 'İade Edildi',
};

export function UserDetailOrders({ orders }: UserDetailOrdersProps) {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value);

  return (
    <div className="rounded-lg border bg-card">
      <div className="flex items-center gap-2 border-b px-4 py-3">
        <ShoppingBag className="h-4 w-4 text-muted-foreground" />
        <h2 className="font-medium text-sm">Sipariş Geçmişi</h2>
        <span className="ml-auto text-xs text-muted-foreground">{orders.length} sipariş</span>
      </div>

      {orders.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-muted-foreground">Henüz sipariş yok.</p>
      ) : (
        <ul className="divide-y">
          {orders.map((order) => (
            <li key={order.id} className="flex items-center justify-between gap-4 px-4 py-3">
              <div>
                <Link
                  href={`/orders/${order.id}`}
                  className="text-sm font-medium hover:underline hover:text-primary inline-flex items-center gap-1"
                >
                  {order.orderNo}
                  <ExternalLink className="h-3 w-3" />
                </Link>
                <p className="text-xs text-muted-foreground">
                  {STATUS_LABELS[order.status] ?? order.status}
                </p>
              </div>
              <span className="text-sm font-medium shrink-0">{formatCurrency(order.totalAmount)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
