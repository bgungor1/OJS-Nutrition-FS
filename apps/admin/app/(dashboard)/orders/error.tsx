'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function OrdersError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error('Orders error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6 border rounded-lg bg-card">
      <AlertTriangle className="h-10 w-10 text-destructive mb-3" />
      <h2 className="text-lg font-semibold">Siparişler Yüklenemedi</h2>
      <p className="text-sm text-muted-foreground mt-1 mb-4 max-w-md">
        {error.message || 'Sipariş listesi alınırken beklenmeyen bir hata oluştu.'}
      </p>
      <Button onClick={reset} variant="outline" size="sm">
        Tekrar Dene
      </Button>
    </div>
  );
}
