import React from 'react';
import Image from 'next/image';
import { Star, Check } from 'lucide-react';
import { formatDate } from '@/lib/utils/format';
import { ReviewHelpfulButton } from './review-helpful-button';
import type { ApiReview } from '@/types';

interface ReviewCardProps {
  review: ApiReview;
  slug: string;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return (name[0] || 'K').toUpperCase();
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ review, slug }) => {
  const initials = getInitials(review.reviewer_name);

  return (
    <article
      data-testid={`review-card-${review.id}`}
      className="p-5 sm:p-6 rounded-xl bg-card border border-border/60 shadow-2xs flex flex-col gap-3.5 transition-colors"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0 border border-primary/20 select-none"
            aria-hidden="true"
          >
            {initials}
          </div>

          <div className="flex flex-col">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-sm text-foreground">
                {review.reviewer_name}
              </span>
              {review.is_verified && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <Check className="w-3 h-3 shrink-0" aria-hidden="true" />
                  <span>Doğrulanmış Alıcı</span>
                </span>
              )}
            </div>
            <time
              dateTime={review.created_at}
              className="text-xs text-muted-foreground mt-0.5"
            >
              {formatDate(review.created_at)}
            </time>
          </div>
        </div>

        <div
          className="flex items-center gap-0.5 shrink-0"
          aria-label={`Verilen puan: ${review.rating} / 5`}
        >
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-4 h-4 ${
                star <= review.rating
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-muted-foreground/25'
              }`}
              aria-hidden="true"
            />
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <h4 className="font-semibold text-sm text-foreground">{review.title}</h4>
        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
          {review.text}
        </p>
      </div>

      {review.images && review.images.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1" aria-label="Değerlendirme görselleri">
          {review.images.map((imgUrl, index) => (
            <div
              key={index}
              className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border border-border bg-secondary/30 shrink-0"
            >
              <Image
                src={imgUrl}
                alt={`${review.reviewer_name} değerlendirme görseli ${index + 1}`}
                fill
                sizes="80px"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )}

      <div className="pt-2 border-t border-border/40 flex items-center justify-end">
        <ReviewHelpfulButton
          slug={slug}
          reviewId={review.id}
          initialHelpfulCount={review.helpful_count}
        />
      </div>
    </article>
  );
};
