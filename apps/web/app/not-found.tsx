import React from 'react';
import Link from 'next/link';
import { Home, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="space-y-5 max-w-md">
        <span className="text-7xl sm:text-8xl font-black tracking-tight text-primary/30">
          404
        </span>
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Sayfa Bulunamadı
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Aradığınız sayfa silinmiş, bağlantı taşınmış veya geçici olarak kullanım dışı kalmış olabilir.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3 pt-3">
          <Button asChild>
            <Link href="/" className="inline-flex items-center gap-1.5">
              <Home className="h-3.5 w-3.5" />
              <span>Ana Sayfaya Dön</span>
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/products" className="inline-flex items-center gap-1.5">
              <ShoppingBag className="h-3.5 w-3.5" />
              <span>Ürünleri Keşfet</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
