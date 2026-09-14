import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { OrderDetailItems, OrderDetailSummary } from '@/components/account';
import { ThankYouHeader } from './thank-you-header';
import { ThankYouActions } from './thank-you-actions';
import { ThankYouFallback } from './thank-you-fallback';
import type { OrderDetail } from '@/types';

interface ThankYouViewProps {
  order: OrderDetail | null;
  orderId?: string;
}

export const ThankYouView: React.FC<ThankYouViewProps> = ({ order, orderId }) => {
  if (!order) {
    return <ThankYouFallback orderId={orderId} />;
  }

  const items = order.items ?? order.cart_detail ?? [];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <ThankYouHeader order={order} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          <OrderDetailItems items={items} />
        </div>

        <div className="lg:col-span-5 xl:col-span-4 space-y-6">
          <OrderDetailSummary order={order} />
          <Card className="border-border shadow-xs">
            <CardContent className="pt-6">
              <ThankYouActions />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ThankYouView;
