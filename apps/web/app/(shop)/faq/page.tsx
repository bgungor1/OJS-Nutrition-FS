import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { getFaqItems } from '@/lib/api/faq';
import { FaqList } from '@/components/faq/faq-list';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Sıkça Sorulan Sorular | OJS Nutrition',
  description:
    'OJS Nutrition sipariş, kargo, teslimat, ürün içeriği ve iade süreçleri hakkında merak edilen tüm sorular ve yanıtları.',
  openGraph: {
    title: 'Sıkça Sorulan Sorular | OJS Nutrition',
    description:
      'OJS Nutrition sipariş, kargo, teslimat ve ürün kalitesi hakkında merak edilenler.',
  },
};

export default async function FaqPage() {
  const faqItems = await getFaqItems();

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-5xl">
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <li>
            <Link href="/" className="hover:text-foreground transition-colors">
              Ana Sayfa
            </Link>
          </li>
          <li>
            <ChevronRight className="h-3 w-3" />
          </li>
          <li className="font-medium text-foreground">Sıkça Sorulan Sorular</li>
        </ol>
      </nav>

      <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
          Sıkça Sorulan Sorular
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Siparişiniz, teslimat süreçleri ve ürünlerimizle ilgili en çok merak edilen konuları burada derledik.
        </p>
      </div>

      <FaqList items={faqItems} />
    </div>
  );
}
