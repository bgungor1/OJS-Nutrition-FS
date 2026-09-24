'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OrderStatusBadge } from './order-status-badge';
import { OrderStatusDialog } from './order-status-dialog';
import type { AdminOrderDetail, OrderStatus } from '@/types';

interface OrderDetailHeaderProps {
  order: AdminOrderDetail;
  onUpdateStatus: (orderId: string, status: OrderStatus) => Promise<void>;
}

export function OrderDetailHeader({ order, onUpdateStatus }: OrderDetailHeaderProps) {
  const formattedDate = new Date(order.createdAt).toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Link href="/orders" title="Siparişlere Dön">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Geri</span>
            </Link>
          </Button>
          <h1 className="text-xl font-bold tracking-tight font-mono">
            {order.orderNo}
          </h1>
          <OrderStatusBadge status={order.status} />
        </div>
        <p className="text-xs text-muted-foreground pl-10">
          Sipariş Tarihi: <span className="font-medium text-foreground">{formattedDate}</span>
        </p>
      </div>

      <div className="flex items-center gap-2 self-start sm:self-auto">
        <OrderStatusDialog
          orderId={order.id}
          orderNo={order.orderNo}
          currentStatus={order.status}
          onUpdate={onUpdateStatus}
        />
      </div>
    </div>
  );
}
