import React from 'react';
import Link from 'next/link';
import { PackageX, ShoppingBag, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ProductNotFound() {
  return (
    <div className="container mx-auto px-4 py-16 text-center max-w-md">
      <div className="space-y-4">
        <div className="h-14 w-14 rounded-2xl bg-muted text-muted-foreground mx-auto flex items-center justify-center">
          <PackageX className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Ürün Bulunamadı
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Aradığınız ürün yayından kaldırılmış, tükenmiş veya bağlantı adresi değişmiş olabilir.
        </p>
        <div className="pt-2 flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link href="/products" className="inline-flex items-center gap-1.5">
              <ShoppingBag className="h-3.5 w-3.5" />
              <span>Tüm Ürünler</span>
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/" className="inline-flex items-center gap-1.5">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Ana Sayfa</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
