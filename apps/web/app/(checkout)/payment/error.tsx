'use client';

import React from 'react';
import Link from 'next/link';
import { AlertCircle, RefreshCw, ShoppingCart, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';

interface PaymentErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function PaymentError({ error, reset }: PaymentErrorProps) {
  return (
    <div className="container mx-auto px-4 py-12 max-w-xl">
      <Card role="alert" className="shadow-xs border-destructive/20 bg-destructive/5 text-center py-8">
        <CardHeader className="flex flex-col items-center space-y-3">
          <div className="p-3 bg-destructive/10 rounded-full text-destructive">
            <AlertCircle className="h-8 w-8" />
          </div>
          <CardTitle>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              Ödeme Bilgileri Yüklenemedi
            </h2>
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground max-w-md">
            {error.message ||
              'Teslimat adresleriniz veya ödeme sistemi yüklenirken bir bağlantı sorunu oluştu. Kartınızdan herhangi bir çekim yapılmamıştır.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row justify-center gap-3 pt-4">
          <Button onClick={reset} variant="default" className="gap-2 cursor-pointer">
            <RefreshCw className="h-4 w-4" />
            <span>Tekrar Dene</span>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/" className="gap-2 inline-flex items-center">
              <ShoppingCart className="h-4 w-4" />
              <span>Alışverişe Devam Et</span>
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/" className="gap-2 inline-flex items-center">
              <Home className="h-4 w-4" />
              <span>Ana Sayfa</span>
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
