import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatPrice, formatDateTime, cn } from '@/lib/utils';
import type { AdminRecentOrder, AdminOrderStatus } from '@/types';
import { ShoppingBag, ArrowRight } from 'lucide-react';

export interface RecentOrdersTableProps {
  orders: AdminRecentOrder[];
  className?: string;
}

const STATUS_MAP: Record<
  AdminOrderStatus,
  { label: string; variant: 'warning' | 'info' | 'default' | 'success' | 'destructive' | 'secondary' }
> = {
  pending: { label: 'Beklemede', variant: 'warning' },
  processing: { label: 'Hazırlanıyor', variant: 'info' },
  shipped: { label: 'Kargoda', variant: 'default' },
  delivered: { label: 'Teslim Edildi', variant: 'success' },
  cancelled: { label: 'İptal', variant: 'destructive' },
  returned: { label: 'İade', variant: 'secondary' },
};

export function RecentOrdersTable({ orders, className }: RecentOrdersTableProps) {
  return (
    <Card className={cn('col-span-full xl:col-span-4 flex flex-col justify-between', className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-base font-semibold">Son Siparişler</CardTitle>
          <CardDescription className="text-xs">
            Mağazada verilen en güncel sipariş hareketleri
          </CardDescription>
        </div>
        <Button asChild variant="ghost" size="sm" className="text-xs gap-1">
          <Link href="/orders">
            <span>Tüm Siparişler</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </CardHeader>

      <CardContent>
        {orders.length === 0 ? (
          <div
            data-testid="recent-orders-empty"
            className="flex flex-col items-center justify-center py-10 text-center"
          >
            <ShoppingBag className="h-8 w-8 text-muted-foreground/60 mb-2" />
            <p className="text-sm font-medium text-foreground">Sipariş Bulunmuyor</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Henüz işleme alınmış bir sipariş kaydı mevcut değil.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs font-medium">Sipariş No</TableHead>
                  <TableHead className="text-xs font-medium">Müşteri</TableHead>
                  <TableHead className="text-xs font-medium text-center">Adet</TableHead>
                  <TableHead className="text-xs font-medium">Tutar</TableHead>
                  <TableHead className="text-xs font-medium">Durum</TableHead>
                  <TableHead className="text-xs font-medium">Tarih</TableHead>
                  <TableHead className="text-xs font-medium text-right">Detay</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => {
                  const statusInfo = STATUS_MAP[order.status] || {
                    label: order.status,
                    variant: 'secondary',
                  };

                  return (
                    <TableRow key={order.id} data-testid={`recent-order-row-${order.id}`}>
                      <TableCell className="text-xs font-mono font-medium whitespace-nowrap">
                        <Link
                          href={`/orders/${order.id}`}
                          className="hover:underline text-foreground"
                        >
                          {order.orderNo}
                        </Link>
                      </TableCell>
                      <TableCell className="text-xs">
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground line-clamp-1">
                            {order.customerName}
                          </span>
                          <span className="text-[11px] text-muted-foreground line-clamp-1">
                            {order.customerEmail}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-center text-muted-foreground whitespace-nowrap">
                        {order.itemsCount}
                      </TableCell>
                      <TableCell className="text-xs font-semibold whitespace-nowrap">
                        {formatPrice(order.totalPrice)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge variant={statusInfo.variant} className="text-[10px] px-1.5 py-0">
                          {statusInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDateTime(order.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          asChild
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                        >
                          <Link href={`/orders/${order.id}`}>
                            <span className="sr-only">{order.orderNo} detayını gör</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
