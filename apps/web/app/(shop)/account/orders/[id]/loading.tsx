import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function OrderDetailLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <div className="flex justify-between items-center pt-1">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-40" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2">
          <Card className="border-border shadow-xs">
            <CardHeader className="pb-3 border-b border-border">
              <Skeleton className="h-5 w-48" />
            </CardHeader>
            <CardContent className="divide-y divide-border p-0">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 gap-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-14 w-14 rounded-lg" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-28" />
                    </div>
                  </div>
                  <Skeleton className="h-5 w-20" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-4">
          {[1, 2].map((i) => (
            <Card key={i} className="border-border shadow-xs">
              <CardHeader className="pb-3 border-b border-border">
                <Skeleton className="h-5 w-32" />
              </CardHeader>
              <CardContent className="pt-3 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
