import * as React from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { formatPrice } from '@/lib/utils';
import type { AdminOrderItem } from '@/types';
import { Package } from 'lucide-react';

interface OrderDetailItemsProps {
  items: AdminOrderItem[];
}

export function OrderDetailItems({ items }: OrderDetailItemsProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-base font-semibold">Sipariş Kalemleri ({items.length})</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ürün</TableHead>
              <TableHead className="text-center">Adet</TableHead>
              <TableHead className="text-right">Birim Fiyat</TableHead>
              <TableHead className="text-right">Toplam Tutar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium text-sm text-foreground">
                      {item.productName}
                    </span>
                    {item.variantName && (
                      <span className="text-xs text-muted-foreground">
                        {item.variantName}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-center font-medium text-xs">
                  {item.pieces}
                </TableCell>
                <TableCell className="text-right text-xs">
                  {formatPrice(item.unitPrice)}
                </TableCell>
                <TableCell className="text-right font-semibold text-sm">
                  {formatPrice(item.totalPrice)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
