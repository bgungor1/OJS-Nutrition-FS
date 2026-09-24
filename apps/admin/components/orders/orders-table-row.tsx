'use client';

import * as React from 'react';
import Link from 'next/link';
import { TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { OrderStatusBadge } from './order-status-badge';
import { OrderStatusDialog } from './order-status-dialog';
import { formatPrice } from '@/lib/utils';
import type { AdminOrderListItem, OrderStatus } from '@/types';
import { Eye, Edit3 } from 'lucide-react';

interface OrdersTableRowProps {
  order: AdminOrderListItem;
  onUpdateStatus: (orderId: string, status: OrderStatus) => Promise<void>;
}

export function OrdersTableRow({ order, onUpdateStatus }: OrdersTableRowProps) {
  const customerName = [order.user.firstName, order.user.lastName].filter(Boolean).join(' ') || 'İsimsiz Müşteri';
  const formattedDate = new Date(order.createdAt).toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <TableRow className="hover:bg-muted/50 transition-colors">
      <TableCell className="font-semibold">
        <Link
          href={`/orders/${order.id}`}
          className="text-primary hover:underline font-mono text-xs"
        >
          {order.orderNo}
        </Link>
      </TableCell>
      <TableCell>
        <div className="flex flex-col">
          <span className="font-medium text-sm text-foreground">{customerName}</span>
          <span className="text-xs text-muted-foreground">{order.user.email}</span>
        </div>
      </TableCell>
      <TableCell className="text-center font-medium text-xs">
        {order.itemCount} adet
      </TableCell>
      <TableCell className="font-semibold text-sm">
        {formatPrice(order.totalPrice)}
      </TableCell>
      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
        {formattedDate}
      </TableCell>
      <TableCell>
        <OrderStatusBadge status={order.status} />
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-1.5">
          <Button asChild variant="ghost" size="sm" className="h-8 w-8 p-0" title="Detay">
            <Link href={`/orders/${order.id}`}>
              <Eye className="h-4 w-4" />
              <span className="sr-only">Sipariş Detayı</span>
            </Link>
          </Button>

          <OrderStatusDialog
            orderId={order.id}
            orderNo={order.orderNo}
            currentStatus={order.status}
            onUpdate={onUpdateStatus}
            trigger={
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Durum Güncelle">
                <Edit3 className="h-4 w-4" />
                <span className="sr-only">Durum Değiştir</span>
              </Button>
            }
          />
        </div>
      </TableCell>
    </TableRow>
  );
}
