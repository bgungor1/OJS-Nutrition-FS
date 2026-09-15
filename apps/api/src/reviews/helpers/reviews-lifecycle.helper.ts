import { Prisma, Review } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ReviewSortOption } from '../reviews.constants';

export interface CreateReviewParams {
  productId: string;
  userId: string;
  reviewerName: string;
  rating: number;
  isVerified: boolean;
  title: string;
  text: string;
  images: string[];
}

export class ReviewsLifecycleHelper {
  static buildOrderBy(
    sort: ReviewSortOption,
  ): Prisma.ReviewOrderByWithRelationInput[] {
    switch (sort) {
      case 'oldest':
        return [{ createdAt: 'asc' }];
      case 'highest_rating':
        return [{ rating: 'desc' }, { createdAt: 'desc' }];
      case 'lowest_rating':
        return [{ rating: 'asc' }, { createdAt: 'desc' }];
      case 'most_helpful':
        return [{ helpfulCount: 'desc' }, { createdAt: 'desc' }];
      case 'newest':
      default:
        return [{ createdAt: 'desc' }];
    }
  }

  static async recalculateProductMetrics(
    tx: Prisma.TransactionClient,
    productId: string,
  ): Promise<{ commentCount: number; averageStar: number }> {
    const aggregate = await tx.review.aggregate({
      where: { productId },
      _count: { id: true },
      _avg: { rating: true },
    });

    const commentCount = aggregate._count.id;
    const averageStar =
      aggregate._avg.rating !== null
        ? Math.round(aggregate._avg.rating * 10) / 10
        : 0;

    await tx.product.update({
      where: { id: productId },
      data: { commentCount, averageStar },
    });

    return { commentCount, averageStar };
  }

  static async executeReviewCreation(
    prisma: PrismaService,
    params: CreateReviewParams,
  ): Promise<Review> {
    return prisma.$transaction(async (tx) => {
      const created = await tx.review.create({
        data: {
          productId: params.productId,
          userId: params.userId,
          reviewerName: params.reviewerName,
          rating: params.rating,
          isVerified: params.isVerified,
          title: params.title.trim(),
          text: params.text.trim(),
          images: params.images,
        },
      });

      await ReviewsLifecycleHelper.recalculateProductMetrics(
        tx,
        params.productId,
      );

      return created;
    });
  }

  static async executeReviewDeletion(
    prisma: PrismaService,
    reviewId: string,
    productId: string,
  ): Promise<void> {
    await prisma.$transaction(async (tx) => {
      await tx.review.delete({ where: { id: reviewId } });
      await ReviewsLifecycleHelper.recalculateProductMetrics(tx, productId);
    });
  }
}
