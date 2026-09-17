import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductCardSkeleton } from '@/components/catalog/product-card-skeleton';

export default function ProductsLoading() {
  return (
    <div
      role="status"
      aria-label="Ürünler yükleniyor"
      className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 animate-pulse"
    >
      <span className="sr-only">Ürünler yükleniyor...</span>

      <div className="space-y-3 pb-6 border-b border-border/60">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48 rounded-lg" />
            <Skeleton className="h-4 w-72 sm:w-96 rounded-md" />
          </div>
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
      </div>

      <div className="flex justify-end mb-6">
        <Skeleton className="h-9 w-44 rounded-lg" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {Array.from({ length: 12 }).map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}
