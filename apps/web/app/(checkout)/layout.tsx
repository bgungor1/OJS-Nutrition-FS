import React from 'react';
import Link from 'next/link';

export default function CheckoutLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      <header className="border-b bg-background">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center space-x-2 font-bold text-xl tracking-tight">
            <span>OJS</span>
            <span className="text-primary">Nutrition</span>
          </Link>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            🔒 Güvenli Ödeme
          </span>
        </div>
      </header>

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 sm:px-6">
          {children}
        </div>
      </main>
    </div>
  );
}
