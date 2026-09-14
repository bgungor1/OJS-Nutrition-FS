import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function ThankYouLoading() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-pulse">
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 rounded-full bg-muted" />
        <div className="space-y-2">
          <div className="h-8 w-64 bg-muted rounded-md mx-auto" />
          <div className="h-4 w-96 bg-muted rounded-md mx-auto" />
        </div>
        <div className="h-9 w-72 bg-muted rounded-xl mx-auto" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 xl:col-span-8">
          <Card className="border-border shadow-xs">
            <CardHeader className="pb-3 border-b border-border">
              <div className="h-5 w-48 bg-muted rounded-md" />
            </CardHeader>
            <CardContent className="divide-y divide-border p-0">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-14 w-14 rounded-lg bg-muted" />
                    <div className="space-y-2">
                      <div className="h-4 w-36 bg-muted rounded-md" />
                      <div className="h-3 w-20 bg-muted rounded-md" />
                    </div>
                  </div>
                  <div className="h-4 w-16 bg-muted rounded-md" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-5 xl:col-span-4 space-y-6">
          <Card className="border-border shadow-xs">
            <CardHeader className="pb-3 border-b border-border">
              <div className="h-5 w-32 bg-muted rounded-md" />
            </CardHeader>
            <CardContent className="space-y-3 pt-3">
              <div className="h-4 bg-muted rounded-md w-full" />
              <div className="h-4 bg-muted rounded-md w-full" />
              <div className="h-6 bg-muted rounded-md w-full pt-2" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
