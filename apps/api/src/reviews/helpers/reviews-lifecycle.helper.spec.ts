import { Review } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ReviewsLifecycleHelper } from './reviews-lifecycle.helper';

describe('ReviewsLifecycleHelper', () => {
  describe('buildOrderBy', () => {
    it('should map sort parameters to correct Prisma orderBy structures', () => {
      expect(ReviewsLifecycleHelper.buildOrderBy('newest')).toEqual([
        { createdAt: 'desc' },
      ]);
      expect(ReviewsLifecycleHelper.buildOrderBy('oldest')).toEqual([
        { createdAt: 'asc' },
      ]);
      expect(ReviewsLifecycleHelper.buildOrderBy('highest_rating')).toEqual([
        { rating: 'desc' },
        { createdAt: 'desc' },
      ]);
      expect(ReviewsLifecycleHelper.buildOrderBy('lowest_rating')).toEqual([
        { rating: 'asc' },
        { createdAt: 'desc' },
      ]);
      expect(ReviewsLifecycleHelper.buildOrderBy('most_helpful')).toEqual([
        { helpfulCount: 'desc' },
        { createdAt: 'desc' },
      ]);
    });
  });

  describe('recalculateProductMetrics', () => {
    it('should calculate review average and count and update the product', async () => {
      const mockTx = {
        review: {
          aggregate: jest.fn().mockResolvedValue({
            _count: { id: 5 },
            _avg: { rating: 4.67 },
          }),
        },
        product: {
          update: jest.fn().mockResolvedValue({}),
        },
      };

      const result = await ReviewsLifecycleHelper.recalculateProductMetrics(
        mockTx as unknown as Parameters<
          typeof ReviewsLifecycleHelper.recalculateProductMetrics
        >[0],
        'prod-1',
      );

      expect(result).toEqual({ commentCount: 5, averageStar: 4.7 });
      expect(mockTx.product.update).toHaveBeenCalledWith({
        where: { id: 'prod-1' },
        data: { commentCount: 5, averageStar: 4.7 },
      });
    });

    it('should set average rating to 0 when there are no reviews', async () => {
      const mockTx = {
        review: {
          aggregate: jest.fn().mockResolvedValue({
            _count: { id: 0 },
            _avg: { rating: null },
          }),
        },
        product: {
          update: jest.fn().mockResolvedValue({}),
        },
      };

      const result = await ReviewsLifecycleHelper.recalculateProductMetrics(
        mockTx as unknown as Parameters<
          typeof ReviewsLifecycleHelper.recalculateProductMetrics
        >[0],
        'prod-1',
      );

      expect(result).toEqual({ commentCount: 0, averageStar: 0 });
    });
  });

  describe('executeReviewCreation & executeReviewDeletion', () => {
    const mockReview: Review = {
      id: 'rev-1',
      productId: 'prod-1',
      userId: 'user-1',
      reviewerName: 'Berkant G.',
      rating: 5,
      isVerified: true,
      title: 'Güzel',
      text: 'Çok iyi',
      images: [],
      helpfulCount: 0,
      createdAt: new Date(),
    };

    it('should create review and update metrics within a transaction in executeReviewCreation', async () => {
      const mockTx = {
        review: {
          create: jest.fn().mockResolvedValue(mockReview),
          aggregate: jest.fn().mockResolvedValue({
            _count: { id: 1 },
            _avg: { rating: 5 },
          }),
        },
        product: {
          update: jest.fn().mockResolvedValue({}),
        },
      };

      const mockPrisma = {
        $transaction: jest.fn((cb: (tx: typeof mockTx) => Promise<unknown>) =>
          cb(mockTx),
        ),
      };

      const result = await ReviewsLifecycleHelper.executeReviewCreation(
        mockPrisma as unknown as PrismaService,
        {
          productId: 'prod-1',
          userId: 'user-1',
          reviewerName: 'Berkant G.',
          rating: 5,
          isVerified: true,
          title: 'Güzel',
          text: 'Çok iyi',
          images: [],
        },
      );

      expect(result).toBe(mockReview);
      expect(mockTx.review.create).toHaveBeenCalled();
      expect(mockTx.product.update).toHaveBeenCalled();
    });

    it('should delete review and update metrics within a transaction in executeReviewDeletion', async () => {
      const mockTx = {
        review: {
          delete: jest.fn().mockResolvedValue(mockReview),
          aggregate: jest.fn().mockResolvedValue({
            _count: { id: 0 },
            _avg: { rating: null },
          }),
        },
        product: {
          update: jest.fn().mockResolvedValue({}),
        },
      };

      const mockPrisma = {
        $transaction: jest.fn((cb: (tx: typeof mockTx) => Promise<unknown>) =>
          cb(mockTx),
        ),
      };

      await ReviewsLifecycleHelper.executeReviewDeletion(
        mockPrisma as unknown as PrismaService,
        'rev-1',
        'prod-1',
      );

      expect(mockTx.review.delete).toHaveBeenCalledWith({
        where: { id: 'rev-1' },
      });
      expect(mockTx.product.update).toHaveBeenCalled();
    });
  });
});
