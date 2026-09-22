import * as React from 'react';
import { DataPagination } from '@/components/ui/data-pagination';

export interface OrdersPaginationProps {
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
  return (
    <DataPagination
      total={total}
      offset={offset}
      limit={limit}
      basePath="/orders"
      itemLabel="sipariş"
      queryParams={{ status, sort, search }}
    />
  );
}
