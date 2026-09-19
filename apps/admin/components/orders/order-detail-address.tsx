import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { MapPin, Phone } from 'lucide-react';

interface OrderDetailAddressProps {
  addressSnapshot: Record<string, unknown>;
}

export function OrderDetailAddress({ addressSnapshot }: OrderDetailAddressProps) {
  const title = (addressSnapshot.title as string) || 'Teslimat Adresi';
  const recipient = [
    addressSnapshot.firstName as string,
    addressSnapshot.lastName as string,
  ]
    .filter(Boolean)
    .join(' ');
  const fullAddress = (addressSnapshot.fullAddress as string) || (addressSnapshot.address as string) || 'Adres detayı belirtilmemiş';
  const city = (addressSnapshot.city as string) || '';
  const district = (addressSnapshot.district as string) || '';
  const phone = (addressSnapshot.phoneNumber as string) || (addressSnapshot.phone as string);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-base font-semibold">Teslimat Adresi</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div>
          <span className="inline-block rounded bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground mb-1">
            {title}
          </span>
          {recipient && (
            <p className="font-medium text-foreground">{recipient}</p>
          )}
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
          {fullAddress}
          {(district || city) && `\n${[district, city].filter(Boolean).join(' / ')}`}
        </p>

        {phone && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1 border-t">
            <Phone className="h-3.5 w-3.5 shrink-0" />
            <span>{phone}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
