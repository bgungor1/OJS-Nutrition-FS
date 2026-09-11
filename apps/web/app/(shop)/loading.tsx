import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function ShopLoading() {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-3 w-3" />
        <Skeleton className="h-4 w-28" />
      </div>

      <div className="space-y-2.5 max-w-lg">
        <Skeleton className="h-8 sm:h-10 w-3/4" />
        <Skeleton className="h-4 w-full" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={`shop-loading-card-${index}`}
            className="rounded-2xl border border-border bg-card p-4 space-y-4 shadow-xs"
          >
            <Skeleton className="h-48 w-full rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-3.5 w-1/3" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-3 w-2/5" />
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-8 w-24 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
