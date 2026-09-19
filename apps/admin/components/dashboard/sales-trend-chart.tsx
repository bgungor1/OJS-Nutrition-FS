'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatPrice, cn } from '@/lib/utils';
import type { AdminSalesTrendItem } from '@/types';
import { TrendingUp, ShoppingBag } from 'lucide-react';

export interface SalesTrendChartProps {
  data: AdminSalesTrendItem[];
  className?: string;
}

export function SalesTrendChart({ data, className }: SalesTrendChartProps) {
  const [activeItem, setActiveItem] = React.useState<AdminSalesTrendItem | null>(null);

  const totalRevenue = React.useMemo(
    () => data.reduce((acc, item) => acc + item.totalRevenue, 0),
    [data],
  );

  const totalOrders = React.useMemo(
    () => data.reduce((acc, item) => acc + item.orderCount, 0),
    [data],
  );

  const maxRevenue = React.useMemo(
    () => Math.max(...data.map((item) => item.totalRevenue), 1),
    [data],
  );

  return (
    <Card className={cn('col-span-full xl:col-span-4 flex flex-col justify-between', className)}>
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pb-4">
        <div>
          <CardTitle className="text-base font-semibold">Satış ve Gelir Trendi</CardTitle>
          <CardDescription className="text-xs">
            Son 30 günlük sipariş hacmi ve günlük ciro değişimi
          </CardDescription>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 font-medium text-foreground">
            <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>30 Gün: {formatPrice(totalRevenue)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <ShoppingBag className="h-4 w-4" />
            <span>{totalOrders} sipariş</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {data.length === 0 ? (
          <div
            data-testid="sales-trend-empty"
            className="flex h-56 items-center justify-center rounded-lg border border-dashed border-border/80 text-xs text-muted-foreground"
          >
            Son 30 güne ait satış verisi bulunamadı.
          </div>
        ) : (
          <div className="space-y-2">
            <div className="h-6 flex items-center justify-between text-xs px-1">
              {activeItem ? (
                <div
                  data-testid="active-trend-info"
                  className="flex items-center gap-3 text-foreground font-medium"
                >
                  <span className="text-muted-foreground">{activeItem.date}</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                    {formatPrice(activeItem.totalRevenue)}
                  </span>
                  <span className="text-muted-foreground font-normal">
                    ({activeItem.orderCount} sipariş)
                  </span>
                </div>
              ) : (
                <span className="text-muted-foreground italic text-[11px]">
                  Detayları görmek için gün sütunlarının üzerine gelin
                </span>
              )}
            </div>

            <div
              role="img"
              aria-label="30 günlük satış ve ciro trend grafiği"
              className="relative flex h-48 items-end gap-1 overflow-x-auto pt-6 pb-2"
            >
              {data.map((item) => {
                const heightPercent = Math.max(
                  Math.round((item.totalRevenue / maxRevenue) * 100),
                  item.totalRevenue > 0 ? 6 : 2,
                );
                const isSelected = activeItem?.date === item.date;

                return (
                  <div
                    key={item.date}
                    tabIndex={0}
                    role="graphics-symbol"
                    aria-label={`${item.date}: ${formatPrice(item.totalRevenue)}, ${item.orderCount} sipariş`}
                    onMouseEnter={() => setActiveItem(item)}
                    onMouseLeave={() => setActiveItem(null)}
                    onFocus={() => setActiveItem(item)}
                    onBlur={() => setActiveItem(null)}
                    className="group relative flex flex-1 min-w-[8px] sm:min-w-[12px] h-full flex-col items-center justify-end outline-none cursor-pointer"
                  >
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={cn(
                        'w-full rounded-t transition-all duration-150',
                        isSelected
                          ? 'bg-primary ring-2 ring-primary/30'
                          : 'bg-primary/70 hover:bg-primary',
                        item.totalRevenue === 0 && 'bg-muted/40 hover:bg-muted/60',
                      )}
                    />
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between text-[10px] text-muted-foreground px-1 border-t border-border/40 pt-1.5">
              <span>{data[0]?.date}</span>
              <span>{data[Math.floor(data.length / 2)]?.date}</span>
              <span>{data[data.length - 1]?.date}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
