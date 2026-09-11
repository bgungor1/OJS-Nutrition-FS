import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductGallery } from '@/components/product-detail/product-gallery';
import { ProductInfo } from '@/components/product-detail/product-info';
import { ProductActions } from '@/components/product-detail/product-actions';
import { ProductAccordion } from '@/components/product-detail/product-accordion';
import { BestSellersSection } from '@/components/home/best-sellers-section';
import { getProductBySlug, getBestSellers } from '@/lib/api/products';
import { getImageUrl } from '@/lib/utils/image';

export const revalidate = 60;

type ProductDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const product = await getProductBySlug(slug);
    const imageUrl = getImageUrl(product.variants?.[0]?.photo_src);

    return {
      title: `${product.name} | OJS Nutrition`,
      description: product.short_explanation || 'OJS Nutrition yüksek kaliteli sporcu besini.',
      openGraph: {
        title: `${product.name} | OJS Nutrition`,
        description: product.short_explanation,
        images: [{ url: imageUrl }],
      },
    };
  } catch {
    return {
      title: 'Ürün Detayı | OJS Nutrition',
    };
  }
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { slug } = await params;

  const [product, bestSellers] = await Promise.all([
    getProductBySlug(slug).catch((err) => {
      console.warn(`Ürün detayı (${slug}) alınamadı:`, err);
      return null;
    }),
    getBestSellers().catch(() => []),
  ]);

  if (!product) {
    notFound();
  }

  const primaryVariant = product.variants?.[0];

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
        <div className="space-y-8">
          <ProductGallery
            photoSrc={primaryVariant?.photo_src}
            name={product.name}
            discountPercentage={primaryVariant?.price?.discount_percentage}
          />
          <div className="hidden lg:block">
            <ProductAccordion
              features={product.explanation?.features}
              usage={product.explanation?.usage}
              nutritionalContent={product.explanation?.nutritional_content}
            />
          </div>
        </div>

        <div className="space-y-6">
          <ProductInfo
            name={product.name}
            shortExplanation={product.short_explanation}
            averageStar={product.average_star}
            commentCount={product.comment_count}
            tags={product.tags}
          />

          <ProductActions
            variants={product.variants || []}
            productName={product.name}
          />

          <div className="lg:hidden">
            <ProductAccordion
              features={product.explanation?.features}
              usage={product.explanation?.usage}
              nutritionalContent={product.explanation?.nutritional_content}
            />
          </div>
        </div>
      </div>

      {bestSellers.length > 0 && (
        <div className="mt-16 pt-8 border-t border-border">
          <BestSellersSection products={bestSellers} />
        </div>
      )}
    </div>
  );
}
