'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Package } from 'lucide-react';

export function ProductTableEmpty() {
  return (
    <div
      data-testid="product-table-empty"
      className="flex flex-col items-center justify-center py-16 text-center border border-dashed rounded-lg bg-card"
    >
      <Package className="h-10 w-10 text-muted-foreground/60 mb-2" />
      <p className="text-base font-medium text-foreground">Kayıtlı Ürün Bulunamadı</p>
      <p className="text-xs text-muted-foreground mt-1 max-w-sm">
        Arama kriterlerinize uygun ürün bulunamadı veya henüz katalogda ürün eklenmemiş.
      </p>
      <Button asChild className="mt-4" size="sm">
        <Link href="/products/new">Yeni Ürün Ekle</Link>
      </Button>
    </div>
  );
}
