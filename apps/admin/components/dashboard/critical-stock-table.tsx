import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { AdminLowStockVariant } from '@/types';
import { AlertTriangle, CheckCircle2, ArrowUpRight } from 'lucide-react';

export interface CriticalStockTableProps {
  variants: AdminLowStockVariant[];
  className?: string;
}

export function CriticalStockTable({ variants, className }: CriticalStockTableProps) {
  return (
    <Card className={cn('flex flex-col justify-between', className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-semibold">Kritik Stok Takibi</CardTitle>
            {variants.length > 0 && (
              <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                {variants.length} uyarı
              </Badge>
            )}
          </div>
          <CardDescription className="text-xs">
            Stok miktarı tükenen veya kritik eşiğe (&le;5 adet) düşen varyantlar
          </CardDescription>
        </div>
        <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
      </CardHeader>

      <CardContent>
        {variants.length === 0 ? (
          <div
            data-testid="critical-stock-empty"
            className="flex flex-col items-center justify-center py-8 text-center"
          >
            <CheckCircle2 className="h-8 w-8 text-emerald-500 mb-2" />
            <p className="text-sm font-medium text-foreground">Stok Seviyesi Güvenli</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Tüm ürün ve varyantların stokları yeterli düzeydedir.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs font-medium">Ürün</TableHead>
                  <TableHead className="text-xs font-medium">Varyant</TableHead>
                  <TableHead className="text-xs font-medium text-center">Kalan</TableHead>
                  <TableHead className="text-xs font-medium">Durum</TableHead>
                  <TableHead className="text-xs font-medium text-right">İşlem</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {variants.map((v) => {
                  const isOutOfStock = v.stockQuantity === 0;
                  const isSevere = v.stockQuantity <= 3;

                  return (
                    <TableRow key={v.variantId} data-testid={`low-stock-row-${v.variantId}`}>
                      <TableCell className="text-xs font-medium">
                        <span className="line-clamp-1">{v.productName}</span>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {v.aroma} - {v.gram}g
                      </TableCell>
                      <TableCell className="text-xs text-center font-bold">
                        <span
                          className={cn(
                            isOutOfStock
                              ? 'text-destructive'
                              : isSevere
                                ? 'text-amber-600 dark:text-amber-400'
                                : 'text-foreground',
                          )}
                        >
                          {v.stockQuantity}
                        </span>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge
                          variant={isOutOfStock ? 'destructive' : isSevere ? 'warning' : 'secondary'}
                          className="text-[10px] px-1.5 py-0"
                        >
                          {isOutOfStock ? 'Tükendi' : isSevere ? 'Çok Az' : 'Azalıyor'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          asChild
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs text-primary hover:text-primary"
                        >
                          <Link href={`/products/${v.productId}`}>
                            <span className="sr-only">{v.productName} stok güncelle</span>
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
