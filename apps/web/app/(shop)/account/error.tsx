'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertCircle, RefreshCw } from 'lucide-react';
import Link from 'next/link';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AccountError({ error, reset }: ErrorProps) {
  return (
    <Card className="shadow-xs border-destructive/20 bg-destructive/5 text-center py-6">
      <CardHeader className="flex flex-col items-center">
        <div className="p-3 bg-destructive/10 rounded-full mb-2">
          <AlertCircle className="h-6 w-6 text-destructive" />
        </div>
        <CardTitle className="text-xl font-bold">Hesap Bilgileri Yüklenemedi</CardTitle>
        <CardDescription>
          {error.message || 'Hesap verilerine ulaşılırken beklenmeyen bir sorun oluştu.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center gap-3">
        <Button onClick={reset} variant="default" className="gap-2 cursor-pointer">
          <RefreshCw className="h-4 w-4" />
          <span>Tekrar Dene</span>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">Ana Sayfa</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
