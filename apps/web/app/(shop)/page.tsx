import type { Metadata } from 'next';
import {
  HeroBanner,
  CategoryGrid,
  BestSellersSection,
  PromoBanner,
  CustomerReviewsPreview,
  TrustGuarantee,
} from '@/components/home';
import { getBestSellers } from '@/lib/api';
import type { ApiBestSellerProduct } from '@/types';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'OJS Nutrition | Türkiye\'nin En Kaliteli Sporcu Besinleri',
  description:
    'Avrupa standartlarında yüksek kaliteli protein tozları, kreatin, BCAA ve sporcu gıdaları. Aynı gün ücretsiz kargo ve memnuniyet garantisiyle.',
  openGraph: {
    title: 'OJS Nutrition | Türkiye\'nin En Kaliteli Sporcu Besinleri',
    description:
      'Avrupa standartlarında üretilen yüksek kaliteli whey proteinler, kreatinler ve amino asit takviyeleri.',
    type: 'website',
    locale: 'tr_TR',
  },
};

export default async function HomePage() {
  let bestSellers: ApiBestSellerProduct[] = [];

  try {
    bestSellers = await getBestSellers();
  } catch (error) {
    console.warn('Çok satan ürünler API üzerinden alınamadı:', error);
  }

  return (
    <div className="flex flex-col">
      <HeroBanner />
      <CategoryGrid />
      <BestSellersSection products={bestSellers} />
      <PromoBanner />
      <CustomerReviewsPreview />
      <TrustGuarantee />
    </div>
  );
}
