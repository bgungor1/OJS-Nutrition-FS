import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function PaymentLoading() {
  return (
    <div
      role="status"
      aria-label="Ödeme sayfası yükleniyor"
      className="py-2 space-y-6 animate-pulse"
    >
      <span className="sr-only">Ödeme ve teslimat bilgileri yükleniyor...</span>

      <div className="space-y-2 mb-6">
        <Skeleton className="h-8 w-56 rounded-lg" />
        <Skeleton className="h-4 w-72 sm:w-96 rounded-md" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          <Card className="border-border shadow-xs">
            <CardHeader className="pb-3 border-b border-border">
              <Skeleton className="h-5 w-40 rounded-md" />
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Skeleton className="h-28 rounded-xl" />
                <Skeleton className="h-28 rounded-xl" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-xs">
            <CardHeader className="pb-3 border-b border-border">
              <Skeleton className="h-5 w-36 rounded-md" />
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <Skeleton className="h-44 w-full max-w-sm rounded-xl mx-auto" />
              <div className="space-y-3 pt-2">
                <Skeleton className="h-10 w-full rounded-lg" />
                <Skeleton className="h-10 w-full rounded-lg" />
                <div className="grid grid-cols-2 gap-3">
                  <Skeleton className="h-10 w-full rounded-lg" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                </div>
                <Skeleton className="h-12 w-full rounded-xl pt-2" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-5 xl:col-span-4 space-y-6">
          <Card className="border-border shadow-xs">
            <CardHeader className="pb-3 border-b border-border">
              <Skeleton className="h-5 w-32 rounded-md" />
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-14 w-14 rounded-lg" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4 rounded-md" />
                    <Skeleton className="h-3 w-1/3 rounded-md" />
                  </div>
                </div>
              </div>
              <div className="border-t border-border pt-3 space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-20 rounded-md" />
                  <Skeleton className="h-4 w-16 rounded-md" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-24 rounded-md" />
                  <Skeleton className="h-4 w-16 rounded-md" />
                </div>
                <div className="flex justify-between pt-2 border-t border-border">
                  <Skeleton className="h-5 w-28 rounded-md" />
                  <Skeleton className="h-5 w-24 rounded-md" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
