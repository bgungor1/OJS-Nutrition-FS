'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

export default function ProductDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error('Product detail route error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6 border rounded-lg bg-card">
      <AlertTriangle className="h-10 w-10 text-destructive mb-3" />
      <h2 className="text-lg font-semibold">Ürün Detayı Yüklenemedi</h2>
      <p className="text-sm text-muted-foreground mt-1 mb-4 max-w-md">
        {error.message || 'Ürün bilgileri getirilirken beklenmeyen bir hata meydana geldi.'}
      </p>
      <div className="flex items-center gap-3">
        <Button onClick={reset} variant="default" size="sm">
          Tekrar Dene
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href="/products" className="flex items-center gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            <span>Ürünlere Dön</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
