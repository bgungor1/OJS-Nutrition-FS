import React from 'react';
import { Star, SlidersHorizontal } from 'lucide-react';
import { Select } from '@/components/ui/select';
import type { RatingDistribution, ReviewSortOption } from '@/types';

interface ReviewFiltersBarProps {
  selectedRating?: number;
  onSelectRating: (rating?: number) => void;
  selectedSort: ReviewSortOption;
  onSelectSort: (sort: ReviewSortOption) => void;
  totalCount: number;
  distribution: RatingDistribution;
}

const SORT_OPTIONS: { value: ReviewSortOption; label: string }[] = [
  { value: 'newest', label: 'En Yeniler' },
  { value: 'most_helpful', label: 'En Faydalı' },
  { value: 'highest_rating', label: 'En Yüksek Puan' },
  { value: 'lowest_rating', label: 'En Düşük Puan' },
  { value: 'oldest', label: 'En Eskiler' },
];

export const ReviewFiltersBar: React.FC<ReviewFiltersBarProps> = ({
  selectedRating,
  onSelectRating,
  selectedSort,
  onSelectSort,
  totalCount,
  distribution,
}) => {
  const ratingChips: { star?: number; label: string; count: number }[] = [
    { star: undefined, label: 'Tümü', count: totalCount },
    { star: 5, label: '5 Yıldız', count: distribution[5] || 0 },
    { star: 4, label: '4 Yıldız', count: distribution[4] || 0 },
    { star: 3, label: '3 Yıldız', count: distribution[3] || 0 },
    { star: 2, label: '2 Yıldız', count: distribution[2] || 0 },
    { star: 1, label: '1 Yıldız', count: distribution[1] || 0 },
  ];

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4 border-y border-border/60">
      <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mr-1 hidden lg:inline">
          Filtrele:
        </span>
        {ratingChips.map(({ star, label, count }) => {
          const isActive = selectedRating === star;
          return (
            <button
              key={label}
              type="button"
              onClick={() => onSelectRating(star)}
              aria-pressed={isActive}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              {star && <Star className="w-3 h-3 text-amber-400 fill-amber-400" aria-hidden="true" />}
              <span>{label}</span>
              <span className={`text-[11px] ${isActive ? 'text-primary-foreground/80' : 'text-muted-foreground/70'}`}>
                ({count})
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
        <SlidersHorizontal className="w-4 h-4 text-muted-foreground shrink-0 hidden sm:block" />
        <div className="w-full sm:w-44">
          <Select
            value={selectedSort}
            onChange={(e) => onSelectSort(e.target.value as ReviewSortOption)}
            aria-label="Değerlendirmeleri sırala"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        </div>
      </div>
    </div>
  );
};
