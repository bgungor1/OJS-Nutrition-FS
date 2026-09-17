import React from 'react';
import Link from 'next/link';
import { MessageSquarePlus, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ReviewLoginCtaProps {
  slug: string;
}

export const ReviewLoginCta: React.FC<ReviewLoginCtaProps> = ({ slug }) => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-xl border border-dashed border-border bg-card/50 text-center sm:text-left">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <MessageSquarePlus className="w-5 h-5" aria-hidden="true" />
        </div>
        <div>
          <h4 className="font-semibold text-sm text-foreground">
            Deneyiminizi Paylaşın
          </h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            Ürün hakkında yorum yapmak ve diğer kullanıcılara yol göstermek için giriş yapın.
          </p>
        </div>
      </div>

      <Button asChild size="sm" className="shrink-0 w-full sm:w-auto">
        <Link href={`/login?redirect=/product/${encodeURIComponent(slug)}`}>
          <LogIn className="w-4 h-4 mr-1.5" aria-hidden="true" />
          <span>Giriş Yap ve Değerlendir</span>
        </Link>
      </Button>
    </div>
  );
};
