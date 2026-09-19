import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, ShieldCheck } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import type { AdminOrderPayment } from '@/types';

interface OrderDetailPaymentProps {
  payment?: AdminOrderPayment | null;
  totalPrice: number;
  shippingFee: number;
}

export function OrderDetailPayment({
  payment,
  totalPrice,
  shippingFee,
}: OrderDetailPaymentProps) {
  const subtotal = Math.max(0, totalPrice - shippingFee);

  return (
    <Card>
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-base font-semibold">Ödeme ve Tutar Özeti</CardTitle>
        </div>
        {payment && (
          <Badge variant="success" className="text-[11px] gap-1">
            <ShieldCheck className="h-3 w-3" />
            <span>{payment.status === 'SUCCESS' ? 'Ödendi' : payment.status}</span>
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {payment && (
          <div className="rounded-md border p-2.5 bg-muted/30 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ödeme Sağlayıcı</span>
              <span className="font-medium uppercase">{payment.provider}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Kart Bilgisi</span>
              <span className="font-mono">
                {payment.cardType || 'Kart'} •••• {payment.last4}
              </span>
            </div>
          </div>
        )}

        <div className="space-y-1.5 pt-2 text-xs">
          <div className="flex justify-between text-muted-foreground">
            <span>Ara Toplam</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Kargo Ücreti</span>
            <span>{shippingFee === 0 ? 'Ücretsiz' : formatPrice(shippingFee)}</span>
          </div>
          <div className="flex justify-between font-bold text-sm text-foreground pt-2 border-t">
            <span>Genel Toplam</span>
            <span className="text-primary">{formatPrice(totalPrice)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
