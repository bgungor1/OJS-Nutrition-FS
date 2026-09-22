import * as React from 'react';
import { DataPagination } from '@/components/ui/data-pagination';

export interface ProductsPaginationProps {
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
  return (
    <DataPagination
      total={total}
      offset={offset}
      limit={limit}
      basePath="/products"
      itemLabel="ürün"
      queryParams={{ category, sort, search }}
    />
  );
}
