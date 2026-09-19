import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatPrice, cn } from '@/lib/utils';
import type { AdminTopProduct } from '@/types';
import { Trophy, PackageCheck } from 'lucide-react';

export interface TopProductsCardProps {
  products: AdminTopProduct[];
  className?: string;
}

export function TopProductsCard({ products, className }: TopProductsCardProps) {
  return (
    <Card className={cn('flex flex-col justify-between', className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-base font-semibold">En Çok Satan Ürünler</CardTitle>
          <CardDescription className="text-xs">
            En yüksek sipariş adedi ve ciroya ulaşan ürünler
          </CardDescription>
        </div>
        <Trophy className="h-4 w-4 text-amber-500 shrink-0" />
      </CardHeader>

      <CardContent>
        {products.length === 0 ? (
          <div
            data-testid="top-products-empty"
            className="flex flex-col items-center justify-center py-8 text-center"
          >
            <PackageCheck className="h-8 w-8 text-muted-foreground/60 mb-2" />
            <p className="text-sm font-medium text-foreground">Satış Verisi Yok</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Henüz tamamlanan ürün satışı bulunmuyor.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {products.slice(0, 5).map((p, index) => {
              const rank = index + 1;
              const isTop = rank === 1;

              return (
                <div
                  key={p.productId}
                  data-testid={`top-product-item-${p.productId}`}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border/50 p-2.5 transition-colors hover:bg-muted/40"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Badge
                      variant={isTop ? 'default' : 'secondary'}
                      className="h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs font-semibold shrink-0"
                    >
                      {rank}
                    </Badge>
                    <div className="min-w-0">
                      <Link
                        href={`/products/${p.productId}`}
                        className="text-xs font-medium text-foreground hover:underline line-clamp-1"
                      >
                        {p.productName}
                      </Link>
                      <p className="text-[11px] text-muted-foreground">
                        {p.totalQuantitySold} adet satıldı
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-semibold text-foreground">
                      {formatPrice(p.totalRevenue)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">toplam ciro</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
