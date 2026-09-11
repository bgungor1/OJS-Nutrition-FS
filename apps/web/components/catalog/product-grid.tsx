import React from 'react';
import Link from 'next/link';
import { PackageOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/product/product-card';
import type { ApiProduct } from '@/types';

interface ProductGridProps {
  products: ApiProduct[];
}

export const ProductGrid: React.FC<ProductGridProps> = ({ products }) => {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 px-4 text-center">
        <PackageOpen className="h-12 w-12 text-muted-foreground/50 mb-3" />
        <h3 className="text-lg font-bold text-foreground">Ürün Bulunamadı</h3>
        <p className="mt-1 text-xs sm:text-sm text-muted-foreground max-w-sm">
          Seçtiğiniz filtreye veya kategoriye ait ürün bulunamadı. Lütfen diğer kategorileri inceleyin.
        </p>
        <Button variant="outline" size="sm" className="mt-6" asChild>
          <Link href="/products">Tüm Ürünleri Gör</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {products.map((product, index) => (
        <ProductCard
          key={product.id || product.slug}
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
  );
};

export default ProductGrid;
