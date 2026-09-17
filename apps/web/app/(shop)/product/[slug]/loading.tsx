import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProductDetailLoading() {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
        <div className="space-y-6">
          <Skeleton className="aspect-square w-full rounded-2xl" />
          <div className="flex gap-3">
            <Skeleton className="w-20 h-20 rounded-xl" />
            <Skeleton className="w-20 h-20 rounded-xl" />
            <Skeleton className="w-20 h-20 rounded-xl" />
          </div>
          <div className="hidden lg:block space-y-3 pt-4">
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2.5">
            <Skeleton className="h-5 w-24 rounded-full" />
            <Skeleton className="h-8 w-4/5 rounded-lg" />
            <div className="flex items-center gap-2 pt-1">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>

          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>

          <div className="space-y-3 pt-2">
            <Skeleton className="h-4 w-20" />
            <div className="grid grid-cols-3 gap-2">
              <Skeleton className="h-10 rounded-lg" />
              <Skeleton className="h-10 rounded-lg" />
              <Skeleton className="h-10 rounded-lg" />
            </div>
          </div>

          <div className="space-y-3">
            <Skeleton className="h-4 w-20" />
            <div className="flex gap-2">
              <Skeleton className="h-9 w-24 rounded-lg" />
              <Skeleton className="h-9 w-24 rounded-lg" />
            </div>
          </div>

          <div className="pt-2">
            <Skeleton className="h-10 w-44 rounded-lg" />
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <Skeleton className="h-12 flex-1 rounded-xl" />
            <Skeleton className="h-12 w-14 rounded-xl" />
          </div>

          <div className="lg:hidden space-y-3 pt-6">
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </div>
      </div>

      <div className="mt-16 pt-12 border-t border-border/60 space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-7 w-56" />
            <Skeleton className="h-4 w-80" />
          </div>
          <Skeleton className="h-9 w-36 rounded-lg" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 space-y-4">
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-28 w-full rounded-xl" />
          </div>
          <div className="lg:col-span-5">
            <Skeleton className="h-40 w-full rounded-2xl" />
          </div>
        </div>

        <div className="flex gap-2 py-2">
          <Skeleton className="h-8 w-20 rounded-full" />
          <Skeleton className="h-8 w-24 rounded-full" />
          <Skeleton className="h-8 w-24 rounded-full" />
        </div>

        <div className="space-y-4">
          <Skeleton className="h-36 w-full rounded-xl" />
          <Skeleton className="h-36 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
