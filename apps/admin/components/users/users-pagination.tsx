import * as React from 'react';
import { DataPagination } from '@/components/ui/data-pagination';

export interface UsersPaginationProps {
  total: number;
  offset: number;
  limit: number;
  role?: string;
  search?: string;
}

export function UsersPagination({
  total,
  offset,
  limit,
  role,
  search,
}: UsersPaginationProps) {
  return (
    <DataPagination
      total={total}
      offset={offset}
      limit={limit}
      basePath="/users"
      itemLabel="kullanıcı"
      queryParams={{
        role: role && role !== 'all' ? role : undefined,
        search,
      }}
    />
  );
}
