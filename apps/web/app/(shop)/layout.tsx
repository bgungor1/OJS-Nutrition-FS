import React from 'react';
import { Header } from '@/components/layout/header';
import { InfoBanner } from '@/components/layout/info-banner';
import { Footer } from '@/components/layout/footer';
import { getCategories } from '@/lib/api/categories';
import type { ApiCategory } from '@/types';

export default async function ShopLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let categories: ApiCategory[] = [];

  try {
    categories = await getCategories();
  } catch (error) {
    console.warn('Kategoriler API üzerinden alınamadı, yerel yedek kullanılacak:', error);
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header categories={categories} />
      <InfoBanner />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}

