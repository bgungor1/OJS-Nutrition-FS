import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import type { OrderStatus } from '@/types';
import {
  Clock,
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  RotateCcw,
} from 'lucide-react';

interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

const STATUS_CONFIG: Record<
  OrderStatus,
  {
    label: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info';
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  pending: {
    label: 'Beklemede',
    variant: 'warning',
    icon: Clock,
  },
  processing: {
    label: 'Hazırlanıyor',
    variant: 'info',
    icon: Package,
  },
  shipped: {
    label: 'Kargoya Verildi',
    variant: 'secondary',
    icon: Truck,
  },
  delivered: {
    label: 'Teslim Edildi',
    variant: 'success',
    icon: CheckCircle2,
  },
  cancelled: {
    label: 'İptal Edildi',
    variant: 'destructive',
    icon: XCircle,
  },
  refunded: {
    label: 'İade Edildi',
    variant: 'outline',
    icon: RotateCcw,
  },
  returned: {
    label: 'İade Edildi',
    variant: 'outline',
    icon: RotateCcw,
  },
};

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  const config = STATUS_CONFIG[status] || {
    label: status,
    variant: 'outline',
    icon: Clock,
  };
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={className}>
      <Icon className="h-3 w-3" />
      <span>{config.label}</span>
    </Badge>
  );
}
