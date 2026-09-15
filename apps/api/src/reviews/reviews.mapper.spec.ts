import { Review } from '@prisma/client';
import { ReviewsMapper } from './reviews.mapper';

describe('ReviewsMapper', () => {
  const mockReview: Review = {
    id: 'rev-1',
    productId: 'prod-1',
    userId: 'user-1',
    reviewerName: 'Ahmet Y.',
    rating: 5,
    isVerified: true,
    title: 'Mükemmel ürün',
    text: 'Tadı ve etkisi harika.',
    images: ['https://example.com/img1.jpg'],
    helpfulCount: 4,
    createdAt: new Date('2026-03-01T12:00:00.000Z'),
  };

  describe('toApiReview', () => {
    it('should transform Prisma Review model to ApiReview interface', () => {
      const result = ReviewsMapper.toApiReview(mockReview);

      expect(result).toEqual({
        id: 'rev-1',
        product_id: 'prod-1',
        reviewer_name: 'Ahmet Y.',
        rating: 5,
        is_verified: true,
        title: 'Mükemmel ürün',
        text: 'Tadı ve etkisi harika.',
        images: ['https://example.com/img1.jpg'],
        helpful_count: 4,
        created_at: '2026-03-01T12:00:00.000Z',
      });
    });

    it('should return empty array when images is null or undefined', () => {
      const reviewWithoutImages = {
        ...mockReview,
        images: null as unknown as string[],
      };
      const result = ReviewsMapper.toApiReview(reviewWithoutImages);
      expect(result.images).toEqual([]);
    });
  });

  describe('calculateStats', () => {
    it('should return reset stats for an empty review list', () => {
      const stats = ReviewsMapper.calculateStats([]);

      expect(stats).toEqual({
        total_reviews: 0,
        average_rating: 0,
        rating_distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        verified_reviews: 0,
      });
    });

    it('should correctly calculate star rating distribution and average rating', () => {
      const summaries = [
        { rating: 5, isVerified: true },
        { rating: 5, isVerified: false },
        { rating: 4, isVerified: true },
        { rating: 3, isVerified: false },
        { rating: 1, isVerified: false },
      ];

      const stats = ReviewsMapper.calculateStats(summaries);

      expect(stats.total_reviews).toBe(5);
      expect(stats.verified_reviews).toBe(2);
      expect(stats.average_rating).toBe(3.6); // (5+5+4+3+1)/5 = 3.6
      expect(stats.rating_distribution).toEqual({
        1: 1,
        2: 0,
        3: 1,
        4: 1,
        5: 2,
      });
    });
  });

  describe('toPaginatedReviewsResponse', () => {
    it('should correctly construct paginated reviews response', () => {
      const stats = ReviewsMapper.calculateStats([
        { rating: 5, isVerified: true },
      ]);
      const response = ReviewsMapper.toPaginatedReviewsResponse(
        [mockReview],
        1,
        stats,
      );

      expect(response.count).toBe(1);
      expect(response.results).toHaveLength(1);
      expect(response.results[0].id).toBe('rev-1');
      expect(response.stats).toBe(stats);
    });
  });
});
