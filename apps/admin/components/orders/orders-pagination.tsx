import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface OrdersPaginationProps {
  total: number;
  offset: number;
  limit: number;
  status?: string;
  sort?: string;
  search?: string;
}

export function OrdersPagination({
  total,
  offset,
  limit,
  status,
  sort,
  search,
}: OrdersPaginationProps) {
  if (total <= 0) return null;

  const currentStart = offset + 1;
  const currentEnd = Math.min(offset + limit, total);
  const querySuffix = `${status ? `&status=${status}` : ''}${sort ? `&sort=${sort}` : ''}${search ? `&search=${search}` : ''}`;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground pt-2">
      <span>
        Toplam {total} siparişten {currentStart}-{currentEnd} arası gösteriliyor
      </span>
      <div className="flex items-center gap-2">
        <Button
          asChild
          variant="outline"
          size="sm"
          disabled={offset === 0}
          className={offset === 0 ? 'pointer-events-none opacity-50' : ''}
        >
          <Link href={`/orders?offset=${Math.max(0, offset - limit)}&limit=${limit}${querySuffix}`}>
            Önceki
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
          size="sm"
          disabled={offset + limit >= total}
          className={offset + limit >= total ? 'pointer-events-none opacity-50' : ''}
        >
          <Link href={`/orders?offset=${offset + limit}&limit=${limit}${querySuffix}`}>
            Sonraki
          </Link>
        </Button>
      </div>
    </div>
  );
}
