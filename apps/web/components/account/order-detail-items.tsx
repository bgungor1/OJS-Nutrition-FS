import React from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils/format';
import { Package } from 'lucide-react';
import type { OrderItem } from '@/types';

interface OrderDetailItemsProps {
  items: OrderItem[];
}

export const OrderDetailItems: React.FC<OrderDetailItemsProps> = ({ items }) => {
  return (
    <Card className="border-border shadow-xs">
      <CardHeader className="pb-3 border-b border-border">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Package className="h-4 w-4 text-primary" />
          <span>Sipariş Kalemleri ({items.length} Ürün)</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="divide-y divide-border p-0">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-4 gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative h-14 w-14 shrink-0 rounded-lg bg-muted border border-border overflow-hidden flex items-center justify-center">
                {item.photo_src || item.photo ? (
                  <Image
                    src={item.photo_src || item.photo || ''}
                    alt={item.product_name}
                    fill
                    sizes="56px"
                    className="object-contain p-1"
                  />
                ) : (
                  <Package className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-medium text-foreground truncate">{item.product_name}</h4>
                {item.variant_name && (
                  <Badge variant="secondary" className="mt-1 text-xs font-normal">
                    {item.variant_name}
                  </Badge>
                )}
                <div className="text-xs text-muted-foreground mt-1">
                  {item.pieces} adet × {formatPrice(item.unit_price)}
                </div>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-sm font-semibold text-foreground">
                {formatPrice(item.total_price)}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
