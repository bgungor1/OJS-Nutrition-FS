import * as React from 'react';
import Link from 'next/link';
import { Button } from './button';
import { cn } from '@/lib/utils';

export interface DataPaginationProps {
  total: number;
  offset: number;
  limit: number;
  basePath: string;
  itemLabel?: string;
  queryParams?: Record<string, string | number | boolean | null | undefined>;
  className?: string;
}

export function DataPagination({
  total,
  offset,
  limit,
  basePath,
  itemLabel = 'kayıt',
  queryParams = {},
  className,
}: DataPaginationProps) {
  if (total <= 0) return null;

  const currentStart = offset + 1;
  const currentEnd = Math.min(offset + limit, total);

  const searchParams = new URLSearchParams();
  Object.entries(queryParams).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      searchParams.set(key, String(val));
    }
  });

  const buildPageUrl = (targetOffset: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('offset', String(targetOffset));
    params.set('limit', String(limit));
    return `${basePath}?${params.toString()}`;
  };

  const hasPrev = offset > 0;
  const hasNext = offset + limit < total;

  return (
    <nav
      aria-label="Sayfalama"
      className={cn(
        'flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground pt-2',
        className,
      )}
    >
      <span>
        Toplam {total} {itemLabel} içerisinden {currentStart}-{currentEnd} arası gösteriliyor
      </span>
      <div className="flex items-center gap-2">
        <Button
          asChild
          variant="outline"
          size="sm"
          disabled={!hasPrev}
          className={!hasPrev ? 'pointer-events-none opacity-50' : ''}
        >
          <Link href={buildPageUrl(Math.max(0, offset - limit))}>
            Önceki
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
          size="sm"
          disabled={!hasNext}
          className={!hasNext ? 'pointer-events-none opacity-50' : ''}
        >
          <Link href={buildPageUrl(offset + limit)}>
            Sonraki
          </Link>
        </Button>
      </div>
    </nav>
  );
}
