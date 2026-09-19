'use client';

import * as React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error('Dashboard hatası:', error);
  }, [error]);

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-6 bg-card/50 border border-border/80 rounded-xl">
      <div className="size-12 rounded-full bg-destructive/15 text-destructive flex items-center justify-center mb-4">
        <AlertTriangle className="size-6" />
      </div>
      <h2 className="text-xl font-bold tracking-tight text-foreground">
        Bir Hata Oluştu
      </h2>
      <p className="text-sm text-muted-foreground max-w-md mt-1 mb-6">
        {error.message || 'Veriler yüklenirken beklenmeyen bir hata meydana geldi.'}
      </p>
      <Button onClick={reset} variant="outline" className="gap-2">
        <RefreshCw className="size-4" />
        Yeniden Dene
      </Button>
    </div>
  );
}
