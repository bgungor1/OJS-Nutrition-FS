import React from 'react';
import { MessageSquareDashed, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ReviewCard } from './review-card';
import type { ApiReview } from '@/types';

interface ReviewListProps {
  reviews: ApiReview[];
  slug: string;
  selectedRating?: number;
  onClearFilter?: () => void;
}

export const ReviewList: React.FC<ReviewListProps> = ({
  reviews,
  slug,
  selectedRating,
  onClearFilter,
}) => {
  if (reviews.length === 0) {
    return (
      <div
        data-testid="review-empty-state"
        className="p-8 sm:p-12 rounded-2xl border border-dashed border-border bg-card/40 flex flex-col items-center justify-center text-center gap-3"
      >
        <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-muted-foreground">
          <MessageSquareDashed className="w-6 h-6" aria-hidden="true" />
        </div>

        <div className="space-y-1 max-w-sm">
          <h4 className="font-semibold text-base text-foreground">
            {selectedRating
              ? `${selectedRating} Yıldızlı Değerlendirme Bulunamadı`
              : 'Henüz Değerlendirme Yapılmamış'}
          </h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {selectedRating
              ? 'Seçtiğiniz puana uygun müşteri değerlendirmesi bulunmuyor.'
              : 'Bu ürün için ilk değerlendirmeyi siz yaparak diğer sporculara yol gösterebilirsiniz.'}
          </p>
        </div>

        {selectedRating && onClearFilter && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilter}
            className="mt-2"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            <span>Tüm Değerlendirmeleri Göster</span>
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4" data-testid="review-list-container">
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} slug={slug} />
      ))}
    </div>
  );
};
