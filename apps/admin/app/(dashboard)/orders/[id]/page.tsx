import * as React from 'react';
import { notFound } from 'next/navigation';
import {
  OrderDetailHeader,
  OrderDetailItems,
  OrderDetailCustomer,
  OrderDetailAddress,
  OrderDetailPayment,
} from '@/components/orders';
import { getOrderById } from '@/lib/api/orders';
import { ApiError } from '@/lib/api-client';
import { updateOrderStatusAction } from '../actions';
import type { AdminOrderDetail } from '@/types';

export const dynamic = 'force-dynamic';

interface OrderDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;

  let order: AdminOrderDetail | null = null;
  try {
    order = await getOrderById(id);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      notFound();
    }
    throw err;
  }

  if (!order) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <OrderDetailHeader
        order={order}
        onUpdateStatus={async (orderId, status) => {
          'use server';
          await updateOrderStatusAction(orderId, status);
        }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          <OrderDetailItems items={order.items} />
        </div>

        <div className="space-y-6">
          <OrderDetailPayment
            payment={order.payment}
            totalPrice={order.totalPrice}
            shippingFee={order.shippingFee}
          />
          <OrderDetailCustomer customer={order.user} />
          <OrderDetailAddress addressSnapshot={order.addressSnapshot} />
        </div>
      </div>
    </div>
  );
}
