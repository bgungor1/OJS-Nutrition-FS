'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function ProductsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error('Products route error:', error);
  }, [error]);

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center p-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-4">
        <AlertCircle className="h-7 w-7" />
      </div>
      <h2 className="text-lg font-bold text-foreground">Ürün verileri yüklenemedi</h2>
      <p className="mt-1 max-w-md text-xs text-muted-foreground">
        {error.message || 'Ürün kataloğu getirilirken bir hata oluştu.'}
      </p>
      <Button onClick={() => reset()} size="sm" className="mt-4 gap-2">
        <RefreshCw className="h-4 w-4" />
        <span>Yeniden Dene</span>
      </Button>
    </div>
  );
}
