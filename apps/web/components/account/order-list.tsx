import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { OrderCard } from './order-card';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import type { OrderSummary } from '@/types';

interface OrderListProps {
  orders: OrderSummary[];
}

export const OrderList: React.FC<OrderListProps> = ({ orders }) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Siparişlerim</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Geçmiş ve mevcut tüm siparişlerinizin durumunu bu alandan takip edebilirsiniz.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-border bg-card/50">
          <div className="p-4 bg-muted rounded-full mb-3 text-muted-foreground">
            <ShoppingBag className="h-8 w-8" />
          </div>
          <h3 className="font-semibold text-lg">Henüz siparişiniz bulunamadı</h3>
          <p className="text-sm text-muted-foreground max-w-sm mt-1 mb-5">
            Satın aldığınız ürünlerin durumunu ve kargo takiplerini buradan izleyebilirsiniz.
          </p>
          <Button asChild className="gap-2 cursor-pointer">
            <Link href="/products">
              <span>Alışverişe Başla</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
};
