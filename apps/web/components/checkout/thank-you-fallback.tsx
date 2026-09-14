import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ThankYouActions } from './thank-you-actions';

interface ThankYouFallbackProps {
  orderId?: string;
}

export const ThankYouFallback: React.FC<ThankYouFallbackProps> = ({ orderId }) => {
  return (
    <div className="max-w-xl mx-auto py-12 space-y-6 text-center">
      <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
        <CheckCircle2 className="h-9 w-9" />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Siparişiniz Alındı!
        </h1>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Siparişiniz başarıyla sistemimize kaydedildi. Detayları ve güncellemeleri siparişlerim
          sayfasından dilediğiniz an takip edebilirsiniz.
        </p>
      </div>

      {orderId && (
        <div className="text-xs text-muted-foreground">
          Referans ID: <span className="font-mono font-medium text-foreground">{orderId}</span>
        </div>
      )}

      <Card className="border-border shadow-xs text-left">
        <CardContent className="pt-6">
          <ThankYouActions />
        </CardContent>
      </Card>
    </div>
  );
};

export default ThankYouFallback;
