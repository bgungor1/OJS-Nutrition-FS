import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function FaqLoading() {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-5xl space-y-8">
      <div className="flex items-center gap-2 mb-6">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-3" />
        <Skeleton className="h-4 w-32" />
      </div>

      <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
        <Skeleton className="h-9 w-64 mx-auto" />
        <Skeleton className="h-4 w-96 max-w-full mx-auto" />
      </div>
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Skeleton className="h-8 w-24 rounded-lg" />
          <Skeleton className="h-8 w-28 rounded-lg" />
          <Skeleton className="h-8 w-32 rounded-lg" />
          <Skeleton className="h-8 w-32 rounded-lg" />
        </div>
        <Skeleton className="h-9 w-full sm:w-72 rounded-md" />
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-xs space-y-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="border-b border-border/50 pb-4 last:border-b-0 last:pb-0 space-y-2"
          >
            <div className="flex items-center justify-between py-2">
              <Skeleton className="h-5 w-3/4 sm:w-2/3" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-muted/30 p-6 sm:p-8 text-center max-w-2xl mx-auto space-y-3">
        <Skeleton className="h-4 w-24 mx-auto rounded-full" />
        <Skeleton className="h-6 w-60 mx-auto" />
        <Skeleton className="h-4 w-80 max-w-full mx-auto" />
        <div className="pt-2">
          <Skeleton className="h-8 w-32 mx-auto rounded-md" />
        </div>
      </div>
    </div>
  );
}
