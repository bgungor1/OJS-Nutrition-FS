import type { Metadata } from 'next';
import { HeroBanner } from '@/components/home/hero-banner';
import { CategoryGrid } from '@/components/home/category-grid';
import { BestSellersSection } from '@/components/home/best-sellers-section';
import { PromoBanner } from '@/components/home/promo-banner';
import { CustomerReviewsPreview } from '@/components/home/customer-reviews-preview';
import { TrustGuarantee } from '@/components/home/trust-guarantee';
import { getBestSellers } from '@/lib/api/products';
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
