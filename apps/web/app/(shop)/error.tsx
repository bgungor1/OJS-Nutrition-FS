'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ShopError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Vitrin hatası yakalandı:', error);
  }, [error]);

  return (
    <div className="container mx-auto flex min-h-[55vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 sm:p-8 text-center shadow-sm space-y-5">
        <div className="h-12 w-12 rounded-full bg-destructive/10 text-destructive mx-auto flex items-center justify-center">
          <AlertTriangle className="h-6 w-6" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Bir Şeyler Ters Gitti
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Sayfa yüklenirken beklenmeyen bir durumla karşılaşıldı. Lütfen sayfayı yenilemeyi deneyin veya ana sayfaya dönün.
          </p>
          {error.digest && (
            <p className="text-[11px] font-mono text-muted-foreground/70 pt-1">
              Hata Kodu: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-2.5 pt-2">
          <Button onClick={() => reset()} className="inline-flex items-center gap-1.5 font-semibold">
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Tekrar Dene</span>
          </Button>
          <Button asChild variant="outline">
            <Link href="/" className="inline-flex items-center gap-1.5">
              <Home className="h-3.5 w-3.5" />
              <span>Ana Sayfa</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
