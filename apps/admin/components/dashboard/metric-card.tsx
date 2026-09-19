import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface MetricCardProps {
  title: string;
  value: string | number;
  icon?: React.ComponentType<{ className?: string }>;
  description?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
    label?: string;
  };
  badgeText?: string;
  badgeVariant?:
    | 'default'
    | 'secondary'
    | 'destructive'
    | 'outline'
    | 'success'
    | 'warning'
    | 'info';
  className?: string;
  testId?: string;
}

export function MetricCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  badgeText,
  badgeVariant = 'secondary',
  className,
  testId,
}: MetricCardProps) {
  return (
    <Card
      data-testid={testId}
      className={cn(
        'relative overflow-hidden transition-all duration-200 hover:shadow-sm',
        className,
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && (
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-foreground">
            <Icon className="h-4 w-4" />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight text-foreground">
          {value}
        </div>
        {(description || trend || badgeText) && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            {trend && (
              <span
                className={cn(
                  'font-medium',
                  trend.isPositive
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-destructive',
                )}
              >
                {trend.isPositive ? '+' : ''}
                {trend.value}
              </span>
            )}
            {trend?.label && <span>{trend.label}</span>}
            {badgeText && (
              <Badge variant={badgeVariant} className="text-[10px] px-1.5 py-0">
                {badgeText}
              </Badge>
            )}
            {description && <span>{description}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
