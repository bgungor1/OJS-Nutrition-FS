import * as React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Shield, Store } from 'lucide-react';
import { LoginForm } from '@/components/auth/login-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Yönetici Girişi — OJS Nutrition Admin',
  description: 'OJS Nutrition yönetim ve operasyon paneli yetkili girişi',
};

export default function AdminLoginPage() {
  const storefrontUrl = process.env.NEXT_PUBLIC_STOREFRONT_URL || 'http://localhost:3000';

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] bg-sky-500/5 rounded-full blur-2xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center size-12 rounded-xl bg-primary/15 border border-primary/25 text-primary mb-3 shadow-inner">
            <Shield className="size-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            OJS Nutrition
          </h1>
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mt-0.5">
            Yönetim & Operasyon Paneli
          </p>
        </div>

        <Card className="backdrop-blur-md bg-card/80 border-border/80 shadow-2xl">
          <CardHeader className="text-center pb-4">
            <CardTitle>Yönetici Girişi</CardTitle>
            <CardDescription>
              Operasyonel süreçlere erişmek için yönetici kimliğinizle giriş yapın.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <React.Suspense fallback={<div className="h-44 animate-pulse bg-muted/30 rounded-lg" />}>
              <LoginForm />
            </React.Suspense>
          </CardContent>
        </Card>
        <div className="text-center mt-6">
          <Link
            href={storefrontUrl}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
          >
            <Store className="size-3.5" />
            Müşteri Mağazasına Dön (Storefront)
          </Link>
        </div>
      </div>
    </div>
  );
}
