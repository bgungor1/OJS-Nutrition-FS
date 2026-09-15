export const REVIEWS_PAGINATION = {
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 50,
  DEFAULT_OFFSET: 0,
} as const;

export const REVIEW_SORT_OPTIONS = [
  'newest',
  'oldest',
  'highest_rating',
  'lowest_rating',
  'most_helpful',
] as const;

export type ReviewSortOption = (typeof REVIEW_SORT_OPTIONS)[number];
