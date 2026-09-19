import * as React from 'react';
import { PageHeader } from '@/components/layout/page-header';
import {
  OrdersTable,
  OrdersToolbar,
  OrdersPagination,
} from '@/components/orders';
import { listOrders } from '@/lib/api/orders';
import { updateOrderStatusAction } from './actions';
import type { AdminOrdersPaginatedResponse, OrderStatus } from '@/types';

export const dynamic = 'force-dynamic';

interface OrdersPageProps {
  searchParams: Promise<{
    limit?: string;
    offset?: string;
    status?: OrderStatus;
    search?: string;
    sort?: string;
  }>;
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const resolvedParams = await searchParams;
  const limit = resolvedParams.limit ? Number(resolvedParams.limit) : 20;
  const offset = resolvedParams.offset ? Number(resolvedParams.offset) : 0;
  const status = resolvedParams.status;
  const search = resolvedParams.search;
  const sort = resolvedParams.sort || 'date_desc';

  let ordersData: AdminOrdersPaginatedResponse = {
    count: 0,
    limit,
    offset,
    results: [],
  };
  let fetchError: string | null = null;

  try {
    ordersData = await listOrders({
      limit,
      offset,
      status,
      search,
      sort,
    });
  } catch (err) {
    fetchError = err instanceof Error ? err.message : 'Siparişler yüklenirken bir sorun oluştu.';
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sipariş Yönetimi"
        description="Müşteri siparişlerini izleyin, durumlarını güncelleyin ve operasyonel süreçleri yönetin."
      />

      {fetchError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
          {fetchError}
        </div>
      )}

      <OrdersToolbar
        search={search}
        status={status}
        sort={sort}
      />

      <OrdersTable
        orders={ordersData.results}
        onUpdateStatus={async (orderId, newStatus) => {
          'use server';
          await updateOrderStatusAction(orderId, newStatus);
        }}
      />

      <OrdersPagination
        total={ordersData.count}
        offset={offset}
        limit={limit}
        status={status}
        sort={sort}
        search={search}
      />
    </div>
  );
}
