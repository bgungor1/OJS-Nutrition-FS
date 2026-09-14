import React from 'react';
import { AlertCircle } from 'lucide-react';

interface CheckoutErrorBannerProps {
  error: string | null;
}

export const CheckoutErrorBanner: React.FC<CheckoutErrorBannerProps> = ({ error }) => {
  if (!error) return null;

  return (
    <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-4 flex items-center gap-3 text-sm text-destructive font-medium">
      <AlertCircle className="h-5 w-5 shrink-0" />
      <span>{error}</span>
    </div>
  );
};

export default CheckoutErrorBanner;
