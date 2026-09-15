import { Review } from '@prisma/client';
import {
  ApiReview,
  PaginatedReviewsResponse,
  RatingDistribution,
  ReviewStats,
} from './interfaces';

export interface ReviewRatingSummary {
  rating: number;
  isVerified: boolean;
}

export class ReviewsMapper {
  static toApiReview(review: Review): ApiReview {
    return {
      id: review.id,
      product_id: review.productId,
      reviewer_name: review.reviewerName,
      rating: review.rating,
      is_verified: review.isVerified,
      title: review.title,
      text: review.text,
      images: review.images ?? [],
      helpful_count: review.helpfulCount,
      created_at: review.createdAt.toISOString(),
    };
  }

  static calculateStats(reviewsSummary: ReviewRatingSummary[]): ReviewStats {
    const totalReviews = reviewsSummary.length;
    const verifiedReviews = reviewsSummary.filter((r) => r.isVerified).length;

    const ratingDistribution: RatingDistribution = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    let totalRating = 0;

    for (const r of reviewsSummary) {
      const ratingKey = Math.round(r.rating) as keyof RatingDistribution;
      if (ratingKey >= 1 && ratingKey <= 5) {
        ratingDistribution[ratingKey]++;
      }
      totalRating += r.rating;
    }

    const averageRating =
      totalReviews > 0 ? Math.round((totalRating / totalReviews) * 10) / 10 : 0;

    return {
      total_reviews: totalReviews,
      average_rating: averageRating,
      rating_distribution: ratingDistribution,
      verified_reviews: verifiedReviews,
    };
  }

  static toPaginatedReviewsResponse(
    reviews: Review[],
    count: number,
    stats: ReviewStats,
  ): PaginatedReviewsResponse {
    return {
      count,
      results: reviews.map((r) => this.toApiReview(r)),
      stats,
    };
  }
}
