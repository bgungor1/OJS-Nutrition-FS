'use client';

import React, { useMemo, useState } from 'react';
import { PenSquare, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ReviewStatsSummary } from './review-stats-summary';
import { RatingDistributionBars } from './rating-distribution-bars';
import { ReviewFiltersBar } from './review-filters-bar';
import { ReviewList } from './review-list';
import { ReviewLoginCta } from './review-login-cta';
import { ReviewFormModal } from './review-form-modal';
import type {
  ApiReview,
  PaginatedReviewsResponse,
  RatingDistribution,
  ReviewSortOption,
  ReviewStats,
} from '@/types';

interface ProductReviewsSectionProps {
  slug: string;
  initialReviews: PaginatedReviewsResponse;
  isAuthenticated: boolean;
}

export const ProductReviewsSection: React.FC<ProductReviewsSectionProps> = ({
  slug,
  initialReviews,
  isAuthenticated,
}) => {
  const [reviews, setReviews] = useState<ApiReview[]>(initialReviews.results || []);
  const [stats, setStats] = useState<ReviewStats>(initialReviews.stats);
  const [selectedRating, setSelectedRating] = useState<number | undefined>(undefined);
  const [selectedSort, setSelectedSort] = useState<ReviewSortOption>('newest');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleNewReview = (newReview: ApiReview) => {
    setReviews((prev) => [newReview, ...prev]);
    setStats((prev) => {
      const newTotal = prev.total_reviews + 1;
      const starKey = newReview.rating as keyof RatingDistribution;
      const newDist = { ...prev.rating_distribution, [starKey]: (prev.rating_distribution[starKey] || 0) + 1 };
      const totalScore = prev.average_rating * prev.total_reviews + newReview.rating;
      return {
        ...prev,
        total_reviews: newTotal,
        average_rating: Number((totalScore / newTotal).toFixed(1)),
        rating_distribution: newDist,
        verified_reviews: newReview.is_verified ? prev.verified_reviews + 1 : prev.verified_reviews,
      };
    });
  };

  const displayedReviews = useMemo(() => {
    let result = [...reviews];
    if (selectedRating !== undefined) result = result.filter((r) => r.rating === selectedRating);
    result.sort((a, b) => {
      if (selectedSort === 'highest_rating') return b.rating - a.rating;
      if (selectedSort === 'lowest_rating') return a.rating - b.rating;
      if (selectedSort === 'most_helpful') return b.helpful_count - a.helpful_count;
      if (selectedSort === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    return result;
  }, [reviews, selectedRating, selectedSort]);

  return (
    <section id="reviews" aria-label="Müşteri Değerlendirmeleri" className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Müşteri Değerlendirmeleri
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Satın alan sporcuların gerçek deneyimleri ve ürün puanlamaları
          </p>
        </div>

        {isAuthenticated && (
          <Button onClick={() => setIsModalOpen(true)} className="shrink-0 gap-1.5 shadow-xs">
            <PenSquare className="w-4 h-4" />
            <span>Değerlendirme Yaz</span>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 space-y-4">
          <ReviewStatsSummary stats={stats} />
          <RatingDistributionBars
            distribution={stats.rating_distribution}
            totalReviews={stats.total_reviews}
            selectedRating={selectedRating}
            onSelectRating={setSelectedRating}
          />
        </div>

        <div className="lg:col-span-5 flex flex-col gap-4">
          {!isAuthenticated ? (
            <ReviewLoginCta slug={slug} />
          ) : (
            <div className="p-6 rounded-2xl border border-border bg-secondary/20 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                <Sparkles className="w-4 h-4" />
                <span>Deneyiminizi Paylaşın</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Bu ürünü kullandıysanız; aroma, karışma performansı ve etki konusundaki düşüncelerinizi paylaşarak topluluğa katkı sağlayın.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsModalOpen(true)}
                className="mt-1 w-full"
              >
                <PenSquare className="w-4 h-4 mr-1.5" />
                <span>Değerlendirme Başlat</span>
              </Button>
            </div>
          )}
        </div>
      </div>

      <ReviewFiltersBar
        selectedRating={selectedRating}
        onSelectRating={setSelectedRating}
        selectedSort={selectedSort}
        onSelectSort={setSelectedSort}
        totalCount={stats.total_reviews}
        distribution={stats.rating_distribution}
      />

      <ReviewList
        reviews={displayedReviews}
        slug={slug}
        selectedRating={selectedRating}
        onClearFilter={() => setSelectedRating(undefined)}
      />

      {isAuthenticated && (
        <ReviewFormModal
          slug={slug}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleNewReview}
        />
      )}
    </section>
  );
};
