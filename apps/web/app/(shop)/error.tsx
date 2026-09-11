'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
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
    <div className="container mx-auto flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      <div className="space-y-4 max-w-md">
        <span className="text-4xl">⚠️</span>
        <h2 className="text-2xl font-bold tracking-tight">Bir Sorun Oluştu</h2>
        <p className="text-sm text-muted-foreground">
          Sayfa yüklenirken beklenmedik bir hata meydana geldi. Lütfen tekrar deneyiniz.
        </p>
        <div className="pt-4 flex justify-center gap-3">
          <Button onClick={() => reset()} variant="default">
            Tekrar Dene
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Ana Sayfa</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
