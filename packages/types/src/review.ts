export interface ApiReview {
  id: string;
  product_id: string;
  reviewer_name: string;
  rating: number;
  is_verified: boolean;
  title: string;
  text: string;
  images: string[];
  helpful_count: number;
  created_at: string;
}

export interface RatingDistribution {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
}

export interface ReviewStats {
  total_reviews: number;
  average_rating: number;
  rating_distribution: RatingDistribution;
  verified_reviews: number;
}

export interface PaginatedReviewsResponse {
  count: number;
  results: ApiReview[];
  stats: ReviewStats;
}

export type ReviewSortOption =
  | 'newest'
  | 'oldest'
  | 'highest_rating'
  | 'lowest_rating'
  | 'most_helpful';

export interface ReviewQueryParams {
  limit?: number;
  offset?: number;
  rating?: number;
  sort?: ReviewSortOption;
}

export interface CreateReviewPayload {
  rating: number;
  title: string;
  text: string;
  images?: string[];
}
