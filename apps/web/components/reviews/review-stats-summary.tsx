import React from 'react';
import { Star, CheckCircle2 } from 'lucide-react';
import type { ReviewStats } from '@/types';

interface ReviewStatsSummaryProps {
  stats: ReviewStats;
}

export const ReviewStatsSummary: React.FC<ReviewStatsSummaryProps> = ({ stats }) => {
  const roundedRating = Number(stats.average_rating.toFixed(1));
  const verifiedPercentage =
    stats.total_reviews > 0
      ? Math.round((stats.verified_reviews / stats.total_reviews) * 100)
      : 100;

  const fourAndFiveStarCount =
    (stats.rating_distribution[5] || 0) + (stats.rating_distribution[4] || 0);
  const recommendPercentage =
    stats.total_reviews > 0
      ? Math.round((fourAndFiveStarCount / stats.total_reviews) * 100)
      : 100;

  return (
    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-6 rounded-2xl bg-secondary/30 border border-border/50 backdrop-blur-xs">
      <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-extrabold tracking-tight text-foreground">
            {stats.total_reviews > 0 ? roundedRating : '0.0'}
          </span>
          <span className="text-lg font-medium text-muted-foreground">/ 5</span>
        </div>

        <div className="flex items-center gap-1 mt-2" aria-label={`Ortalama puan: ${roundedRating} / 5`}>
          {[1, 2, 3, 4, 5].map((star) => {
            const isFilled = star <= Math.round(stats.average_rating);
            return (
              <Star
                key={star}
                className={`w-5 h-5 ${
                  isFilled
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-muted-foreground/30'
                }`}
                aria-hidden="true"
              />
            );
          })}
        </div>

        <p className="text-sm text-muted-foreground mt-2 font-medium">
          {stats.total_reviews} Değerlendirme
        </p>
      </div>

      <div className="w-px h-24 bg-border/60 hidden sm:block self-center mx-2" />

      <div className="flex flex-col justify-center gap-2.5 text-sm w-full sm:w-auto">
        <div className="flex items-center gap-2 text-foreground font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>%{verifiedPercentage} Doğrulanmış Müşteri</span>
        </div>

        {stats.total_reviews > 0 && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="inline-block w-2 h-2 rounded-full bg-primary shrink-0" />
            <span>Kullanıcıların %{recommendPercentage}&apos;i ürünü tavsiye ediyor</span>
          </div>
        )}
      </div>
    </div>
  );
};
