'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { captureException } from '@/lib/observability/sentry';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Kritik sistem hatası yakalandı (GlobalError):', error);
    captureException(error, {
      tags: { source: 'global-error' },
      extra: { digest: error.digest },
    });
  }, [error]);

  return (
    <html lang="tr">
      <body className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-4 antialiased font-sans">
        <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900/90 p-6 sm:p-8 text-center shadow-2xl space-y-6">
          <div className="h-14 w-14 rounded-2xl bg-red-500/10 text-red-400 mx-auto flex items-center justify-center border border-red-500/20">
            <AlertTriangle className="h-7 w-7" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Kritik Bir Hata Oluştu
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
              Uygulama genelinde beklenmedik bir sistem hatası meydana geldi. Lütfen işlemi tekrar deneyin veya ana sayfaya dönün.
            </p>
            {error.digest && (
              <p className="text-[11px] font-mono text-neutral-500 pt-2">
                Hata Referansı: {error.digest}
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
            <Button
              onClick={() => reset()}
              className="inline-flex items-center justify-center gap-2 bg-white text-neutral-950 hover:bg-neutral-200 font-semibold"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Yeniden Dene</span>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-neutral-800 text-neutral-300 hover:bg-neutral-800 hover:text-white"
            >
              <Link href="/" className="inline-flex items-center justify-center gap-2">
                <Home className="h-4 w-4" />
                <span>Ana Sayfa</span>
              </Link>
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
