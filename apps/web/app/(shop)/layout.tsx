import React from 'react';
import { Header } from '@/components/layout/header';
import { InfoBanner } from '@/components/layout/info-banner';
import { Footer } from '@/components/layout/footer';
import { getCategories } from '@/lib/api/categories';
import { getAccessToken } from '@/lib/auth-cookies';
import { getMyAccount } from '@/lib/api/users';
import type { AccountProfile, ApiCategory } from '@/types';

export default async function ShopLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let categories: ApiCategory[] = [];
  let user: AccountProfile | null = null;

  try {
    categories = await getCategories();
  } catch (error) {
    console.warn('Kategoriler API üzerinden alınamadı, yerel yedek kullanılacak:', error);
  }

  try {
    const token = await getAccessToken();
    if (token) {
      user = await getMyAccount(token);
    }
  } catch {
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header categories={categories} user={user} />
      <InfoBanner />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
