import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div
      data-testid="product-card-skeleton"
      className="flex flex-col h-full rounded-xl border border-border bg-card p-4 space-y-3"
    >
      <Skeleton className="h-40 w-full rounded-lg" />
      <div className="space-y-2 pt-1">
        <Skeleton className="h-4 w-4/5 rounded-md" />
        <Skeleton className="h-3 w-3/5 rounded-md" />
      </div>
      <div className="flex items-center gap-1.5 pt-1">
        <Skeleton className="h-3.5 w-20 rounded-md" />
        <Skeleton className="h-3.5 w-8 rounded-md" />
      </div>
      <div className="mt-auto flex items-end justify-between pt-3 border-t border-border/50">
        <Skeleton className="h-5 w-24 rounded-md" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    </div>
  );
};

export default ProductCardSkeleton;
