'use client';

import * as React from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
} from '@/components/ui/table';
import { OrdersTableRow } from './orders-table-row';
import { OrdersTableEmpty } from './orders-table-empty';
import type { AdminOrderListItem, OrderStatus } from '@/types';

interface OrdersTableProps {
  orders: AdminOrderListItem[];
  onUpdateStatus: (orderId: string, status: OrderStatus) => Promise<void>;
}

export function OrdersTable({ orders, onUpdateStatus }: OrdersTableProps) {
  if (orders.length === 0) {
    return <OrdersTableEmpty />;
  }

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[180px]">Sipariş No</TableHead>
            <TableHead>Müşteri</TableHead>
            <TableHead className="text-center">Kalem</TableHead>
            <TableHead>Toplam Tutar</TableHead>
            <TableHead>Tarih</TableHead>
            <TableHead>Durum</TableHead>
            <TableHead className="text-right w-[100px]">İşlemler</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <OrdersTableRow
              key={order.id}
              order={order}
              onUpdateStatus={onUpdateStatus}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
