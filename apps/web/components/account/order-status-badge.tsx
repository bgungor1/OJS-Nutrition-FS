import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { OrderStatus } from '@/types';

interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; className: string }
> = {
  pending: {
    label: 'Ödeme Bekleniyor',
    className: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
  },
  processing: {
    label: 'Hazırlanıyor',
    className: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
  },
  shipped: {
    label: 'Kargoya Verildi',
    className: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30',
  },
  delivered: {
    label: 'Teslim Edildi',
    className: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  },
  cancelled: {
    label: 'İptal Edildi',
    className: 'bg-destructive/15 text-destructive border-destructive/30',
  },
  returned: {
    label: 'İade Edildi',
    className: 'bg-muted text-muted-foreground border-border',
  },
};

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({
  status,
  className,
}) => {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    className: 'bg-muted text-muted-foreground border-border',
  };

  return (
    <Badge
      variant="outline"
      className={cn('font-medium border px-2.5 py-0.5 text-xs', config.className, className)}
    >
      {config.label}
    </Badge>
  );
};
