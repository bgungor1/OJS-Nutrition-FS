import { Skeleton } from '@/components/ui/skeleton';

export default function ProductDetailLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-5">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-5 w-24 rounded-full" />
          </div>
          <Skeleton className="h-4 w-40" />
        </div>
        <Skeleton className="h-9 w-36" />
      </div>

      <div className="space-y-4">
        <Skeleton className="h-6 w-52" />
        <div className="rounded-lg border bg-card p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      </div>

      <div className="pt-4 border-t space-y-4">
        <div className="rounded-lg border bg-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-4 w-60" />
            </div>
            <Skeleton className="h-9 w-28" />
          </div>
          <Skeleton className="h-48 w-full rounded-md" />
        </div>
      </div>
    </div>
  );
}
