import React from 'react';
import { CheckCircle2, Calendar, Hash } from 'lucide-react';
import { OrderStatusBadge } from '@/components/account/order-status-badge';
import { formatDateTime } from '@/lib/utils/format';
import type { OrderDetail } from '@/types';

interface ThankYouHeaderProps {
  order: OrderDetail;
}

export const ThankYouHeader: React.FC<ThankYouHeaderProps> = ({ order }) => {
  return (
    <div className="text-center space-y-4">
      <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 animate-in zoom-in-50 duration-300">
        <CheckCircle2 className="h-9 w-9" />
      </div>

      <div className="space-y-1.5">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Siparişiniz Alındı!
        </h1>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Sipariş onayınız ve kargo takip detaylarınız kayıtlı e-posta adresinize iletilecektir.
        </p>
      </div>

      <div className="inline-flex flex-wrap items-center justify-center gap-3 px-4 py-2 rounded-xl bg-card border border-border text-xs sm:text-sm">
        <div className="flex items-center gap-1.5 font-medium text-foreground">
          <Hash className="h-4 w-4 text-muted-foreground" />
          <span>Sipariş No:</span>
          <span className="font-semibold text-primary">{order.order_no}</span>
        </div>
        <span className="text-muted-foreground hidden sm:inline">•</span>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{formatDateTime(order.created_at)}</span>
        </div>
        <span className="text-muted-foreground hidden sm:inline">•</span>
        <OrderStatusBadge status={order.status} />
      </div>
    </div>
  );
};

export default ThankYouHeader;
