import React from 'react';
import Link from 'next/link';

export default function ShopLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center space-x-2 font-bold text-xl tracking-tight">
            <span>OJS</span>
            <span className="text-primary">Nutrition</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link href="/products" className="transition-colors hover:text-primary">
              Tüm Ürünler
            </Link>
            <Link href="/products/protein" className="transition-colors hover:text-primary">
              Protein
            </Link>
            <Link href="/about" className="transition-colors hover:text-primary">
              Hakkımızda
            </Link>
            <Link href="/faq" className="transition-colors hover:text-primary">
              SSS
            </Link>
            <Link href="/contact" className="transition-colors hover:text-primary">
              İletişim
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>
      <footer className="border-t bg-muted/40">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 py-8 px-4 md:flex-row sm:px-6">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} OJS Nutrition. Tüm hakları saklıdır.
          </p>
        </div>
      </footer>
    </div>
  );
}
