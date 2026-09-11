import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { OrderStatusBadge } from './order-status-badge';
import { formatDate, formatPrice } from '@/lib/utils/format';
import { Package, ChevronRight, Calendar } from 'lucide-react';
import type { OrderSummary } from '@/types';

interface OrderCardProps {
  order: OrderSummary;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
  return (
    <Card className="border-border shadow-xs hover:border-primary/40 transition-colors">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 gap-2 space-y-0">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-bold text-base tracking-tight text-foreground">
            Sipariş #{order.order_no}
          </span>
          <OrderStatusBadge status={order.status} />
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          <span>{formatDate(order.created_at)}</span>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-2 border-t border-border gap-3 text-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Package className="h-4 w-4" />
            <span>{order.item_count} Ürün</span>
          </div>
          <div className="font-semibold text-foreground">
            Toplam: <span className="text-primary">{formatPrice(order.total_price)}</span>
          </div>
        </div>
        <Button variant="outline" size="sm" asChild className="gap-1 cursor-pointer">
          <Link href={`/account/orders/${order.id}`}>
            <span>Detayları İncele</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};
