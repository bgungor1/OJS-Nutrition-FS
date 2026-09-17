import React from 'react';
import { Star } from 'lucide-react';
import type { RatingDistribution } from '@/types';

interface RatingDistributionBarsProps {
  distribution: RatingDistribution;
  totalReviews: number;
  selectedRating?: number;
  onSelectRating: (rating?: number) => void;
}

export const RatingDistributionBars: React.FC<RatingDistributionBarsProps> = ({
  distribution,
  totalReviews,
  selectedRating,
  onSelectRating,
}) => {
  const stars: (keyof RatingDistribution)[] = [5, 4, 3, 2, 1];

  const handleRowClick = (star: number) => {
    if (selectedRating === star) {
      onSelectRating(undefined);
    } else {
      onSelectRating(star);
    }
  };

  return (
    <div className="flex flex-col gap-2.5 w-full">
      {stars.map((star) => {
        const count = distribution[star] || 0;
        const percentage = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
        const isSelected = selectedRating === star;

        return (
          <button
            key={star}
            type="button"
            onClick={() => handleRowClick(star)}
            aria-pressed={isSelected}
            aria-label={`${star} yıldız: ${count} değerlendirme, yüzde ${percentage}`}
            className={`group flex items-center gap-3 w-full text-left p-1.5 rounded-lg transition-colors cursor-pointer ${
              isSelected
                ? 'bg-primary/10 ring-1 ring-primary/40'
                : 'hover:bg-accent/40'
            }`}
          >
            <div className="flex items-center gap-1 w-16 shrink-0 text-xs font-semibold text-foreground">
              <span>{star}</span>
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" aria-hidden="true" />
            </div>

            <div className="relative flex-1 h-2.5 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 rounded-full transition-all duration-300 group-hover:brightness-105"
                style={{ width: `${percentage}%` }}
              />
            </div>

            <div className="w-20 shrink-0 text-right text-xs text-muted-foreground tabular-nums">
              <span className="font-medium text-foreground">%{percentage}</span>{' '}
              <span className="text-muted-foreground/80">({count})</span>
            </div>
          </button>
        );
      })}
    </div>
  );
};
