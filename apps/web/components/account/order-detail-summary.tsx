import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatPrice } from '@/lib/utils/format';
import { MapPin, CreditCard, Receipt } from 'lucide-react';
import type { OrderDetail } from '@/types';

interface OrderDetailSummaryProps {
  order: OrderDetail;
}

export const OrderDetailSummary: React.FC<OrderDetailSummaryProps> = ({ order }) => {
  const addr = order.address_snapshot;
  const locationLine = [addr?.subregion, addr?.region, addr?.country]
    .filter(Boolean)
    .join(', ');

  return (
    <div className="space-y-4">
      <Card className="border-border shadow-xs">
        <CardHeader className="pb-3 border-b border-border">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Receipt className="h-4 w-4 text-primary" />
            <span>Sipariş Özeti</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2.5 pt-3 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Ara Toplam</span>
            <span className="font-medium text-foreground">{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Kargo Ücreti</span>
            <span className="font-medium text-foreground">
              {order.shipping_fee === 0 ? 'Ücretsiz' : formatPrice(order.shipping_fee)}
            </span>
          </div>
          <div className="border-t border-border pt-2 flex justify-between font-bold text-base text-foreground">
            <span>Toplam</span>
            <span className="text-primary">{formatPrice(order.total_price)}</span>
          </div>
        </CardContent>
      </Card>

      {addr && (
        <Card className="border-border shadow-xs">
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <span>Teslimat Adresi</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-3 text-sm space-y-1">
            <div className="font-semibold text-foreground">
              {addr.firstName} {addr.lastName}
            </div>
            <div className="text-muted-foreground">{addr.fullAddress}</div>
            {locationLine && <div className="text-xs text-muted-foreground">{locationLine}</div>}
            <div className="text-xs text-muted-foreground pt-1">{addr.phoneNumber}</div>
          </CardContent>
        </Card>
      )}

      {order.payment && (
        <Card className="border-border shadow-xs">
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              <span>Ödeme Bilgisi</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-3 text-sm space-y-1">
            <div className="font-medium text-foreground flex items-center justify-between">
              <span>{order.payment.card_type} •••• {order.payment.last4}</span>
              <span className="text-xs text-muted-foreground uppercase">{order.payment.status}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              Sağlayıcı: {order.payment.provider}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
