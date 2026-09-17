import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  ProductGallery,
  ProductInfo,
  ProductActions,
  ProductAccordion,
  ProductJsonLd,
} from '@/components/product-detail';
import { ProductReviewsSection } from '@/components/reviews';
import { BestSellersSection } from '@/components/home';
import { getProductBySlug, getBestSellers } from '@/lib/api';
import { getProductReviews } from '@/lib/api/reviews';
import { getAccessToken } from '@/lib/auth-cookies';
import { getImageUrl } from '@/lib/utils';

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
      alternates: {
        canonical: `/product/${slug}`,
      },
      openGraph: {
        title: `${product.name} | OJS Nutrition`,
        description: product.short_explanation,
        url: `/product/${slug}`,
        type: 'website',
        images: [{ url: imageUrl, alt: product.name }],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${product.name} | OJS Nutrition`,
        description: product.short_explanation,
        images: [imageUrl],
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

  const [product, reviewsData, bestSellers, token] = await Promise.all([
    getProductBySlug(slug).catch((err) => {
      console.warn(`Ürün detayı (${slug}) alınamadı:`, err);
      return null;
    }),
    getProductReviews(slug).catch((err) => {
      console.warn(`Ürün değerlendirmeleri (${slug}) alınamadı:`, err);
      return {
        count: 0,
        results: [],
        stats: {
          total_reviews: 0,
          average_rating: 0,
          rating_distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
          verified_reviews: 0,
        },
      };
    }),
    getBestSellers().catch(() => []),
    getAccessToken().catch(() => undefined),
  ]);

  if (!product) {
    notFound();
  }

  const primaryVariant = product.variants?.[0];

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <ProductJsonLd product={product} />
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
            productId={product.id}
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

      <div className="mt-16 pt-12 border-t border-border/60">
        <ProductReviewsSection
          slug={slug}
          initialReviews={reviewsData}
          isAuthenticated={Boolean(token)}
        />
      </div>

      {bestSellers.length > 0 && (
        <div className="mt-16 pt-8 border-t border-border">
          <BestSellersSection products={bestSellers} />
        </div>
      )}
    </div>
  );
}
