import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ProductCard } from '@/components/product/product-card';
import type { ApiBestSellerProduct } from '@/types';

interface BestSellersSectionProps {
  products?: ApiBestSellerProduct[];
}

export const BestSellersSection: React.FC<BestSellersSectionProps> = ({
  products = [],
}) => {
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-8 gap-2">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground uppercase">
            En Çok Satanlar
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Müşterilerimizin en çok tercih ettiği ve yüksek puanlı ürünler
          </p>
        </div>
        <Link
          href="/products"
          className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-primary hover:underline group"
        >
          <span>Tüm Ürünleri İncele</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 sm:gap-5">
        {products.map((product, index) => (
          <ProductCard
            key={product.slug || index}
            slug={product.slug}
            name={product.name}
            photoSrc={product.photo_src}
            shortExplanation={product.short_explanation}
            reviewCount={product.comment_count}
            averageStar={product.average_star}
            price={product.price_info.total_price}
            originalPrice={product.price_info.discounted_price}
            discountPercentage={product.price_info.discount_percentage}
            priority={index < 2}
          />
        ))}
      </div>
    </section>
  );
};

export default BestSellersSection;
