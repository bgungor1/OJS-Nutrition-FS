import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface ProductsPaginationProps {
  total: number;
  offset: number;
  limit: number;
  category?: string;
  sort?: string;
  search?: string;
}

export function ProductsPagination({
  total,
  offset,
  limit,
  category,
  sort,
  search,
}: ProductsPaginationProps) {
  if (total <= 0) return null;

  const currentStart = offset + 1;
  const currentEnd = Math.min(offset + limit, total);
  const querySuffix = `${category ? `&category=${category}` : ''}${sort ? `&sort=${sort}` : ''}${search ? `&search=${search}` : ''}`;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground pt-2">
      <span>
        Toplam {total} üründen {currentStart}-{currentEnd} arası gösteriliyor
      </span>
      <div className="flex items-center gap-2">
        <Button
          asChild
          variant="outline"
          size="sm"
          disabled={offset === 0}
          className={offset === 0 ? 'pointer-events-none opacity-50' : ''}
        >
          <Link href={`/products?offset=${Math.max(0, offset - limit)}&limit=${limit}${querySuffix}`}>
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
          <Link href={`/products?offset=${offset + limit}&limit=${limit}${querySuffix}`}>
            Sonraki
          </Link>
        </Button>
      </div>
    </div>
  );
}
