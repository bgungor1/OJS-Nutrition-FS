import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { OrdersByStatus } from '@/types';

export interface StatusBreakdownProps {
  ordersByStatus: OrdersByStatus;
  className?: string;
}

interface StatusConfig {
  key: keyof OrdersByStatus;
  label: string;
  badgeVariant: 'warning' | 'info' | 'default' | 'success' | 'destructive' | 'secondary';
  barColor: string;
}

const STATUS_ITEMS: StatusConfig[] = [
  {
    key: 'pending',
    label: 'Beklemede',
    badgeVariant: 'warning',
    barColor: 'bg-amber-500',
  },
  {
    key: 'processing',
    label: 'Hazırlanıyor',
    badgeVariant: 'info',
    barColor: 'bg-sky-500',
  },
  {
    key: 'shipped',
    label: 'Kargoda',
    badgeVariant: 'default',
    barColor: 'bg-primary',
  },
  {
    key: 'delivered',
    label: 'Teslim Edildi',
    badgeVariant: 'success',
    barColor: 'bg-emerald-500',
  },
  {
    key: 'cancelled',
    label: 'İptal Edildi',
    badgeVariant: 'destructive',
    barColor: 'bg-destructive',
  },
  {
    key: 'returned',
    label: 'İade Edildi',
    badgeVariant: 'secondary',
    barColor: 'bg-muted-foreground',
  },
];

export function StatusBreakdown({ ordersByStatus, className }: StatusBreakdownProps) {
  const total = Object.values(ordersByStatus).reduce((sum, count) => sum + count, 0);

  return (
    <Card className={cn('flex flex-col justify-between', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Sipariş Statü Dağılımı</CardTitle>
          <span className="text-xs font-medium text-muted-foreground">
            Toplam: {total} sipariş
          </span>
        </div>
        <CardDescription className="text-xs">
          Tüm aktif ve tamamlanmış siparişlerin aşamalara göre dağılımı
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3.5">
        {total === 0 ? (
          <div
            data-testid="status-breakdown-empty"
            className="flex h-40 items-center justify-center rounded-lg border border-dashed border-border/80 text-xs text-muted-foreground"
          >
            Henüz sipariş kaydı bulunmuyor.
          </div>
        ) : (
          STATUS_ITEMS.map((item) => {
            const count = ordersByStatus[item.key] || 0;
            const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

            return (
              <div key={item.key} className="space-y-1.5" data-testid={`status-item-${item.key}`}>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Badge variant={item.badgeVariant} className="text-[10px] px-1.5 py-0">
                      {item.label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <span className="font-semibold text-foreground">{count}</span>
                    <span className="text-[11px]">({percentage}%)</span>
                  </div>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn('h-full transition-all duration-300', item.barColor)}
                    style={{ width: `${percentage}%` }}
                    role="progressbar"
                    aria-valuenow={percentage}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${item.label}: ${count} sipariş (${percentage}%)`}
                  />
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
