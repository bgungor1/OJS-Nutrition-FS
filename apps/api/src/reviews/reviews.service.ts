import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { OrderStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma';
import { MediaService } from '../media/media.service';
import { MediaUploadResponse } from '../media/interfaces/media-upload-response.interface';
import { CreateReviewDto, ReviewQueryDto } from './dto';
import { ReviewsLifecycleHelper } from './helpers';
import { ApiReview, PaginatedReviewsResponse } from './interfaces';
import { REVIEWS_PAGINATION } from './reviews.constants';
import { ReviewsMapper } from './reviews.mapper';

@Injectable()
export class ReviewsService {
  private readonly logger = new Logger(ReviewsService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Optional() private readonly mediaService?: MediaService,
  ) {}

  async list(
    slug: string,
    query?: ReviewQueryDto,
  ): Promise<PaginatedReviewsResponse> {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!product) {
      throw new NotFoundException('Ürün bulunamadı.');
    }

    const limit = query?.limit ?? REVIEWS_PAGINATION.DEFAULT_LIMIT;
    const offset = query?.offset ?? REVIEWS_PAGINATION.DEFAULT_OFFSET;
    const sort = query?.sort ?? 'newest';

    const where: Prisma.ReviewWhereInput = {
      productId: product.id,
      ...(query?.rating ? { rating: query.rating } : {}),
    };

    const orderBy = ReviewsLifecycleHelper.buildOrderBy(sort);

    const [reviews, count, allSummaries] = await Promise.all([
      this.prisma.review.findMany({
        where,
        orderBy,
        skip: offset,
        take: limit,
      }),
      this.prisma.review.count({ where }),
      this.prisma.review.findMany({
        where: { productId: product.id },
        select: { rating: true, isVerified: true },
      }),
    ]);

    const stats = ReviewsMapper.calculateStats(allSummaries);

    return ReviewsMapper.toPaginatedReviewsResponse(reviews, count, stats);
  }

  async create(
    slug: string,
    userId: string,
    dto: CreateReviewDto,
  ): Promise<ApiReview> {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!product) {
      throw new NotFoundException('Ürün bulunamadı.');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, firstName: true, lastName: true },
    });

    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı.');
    }

    const existingReview = await this.prisma.review.findFirst({
      where: { productId: product.id, userId },
      select: { id: true },
    });

    if (existingReview) {
      throw new ConflictException(
        'Bu ürün için zaten bir değerlendirme yaptınız.',
      );
    }

    const orderItem = await this.prisma.orderItem.findFirst({
      where: {
        productId: product.id,
        order: {
          userId,
          status: { not: OrderStatus.cancelled },
        },
      },
      select: { id: true },
    });

    const isVerified = Boolean(orderItem);
    const reviewerName = user.lastName
      ? `${user.firstName} ${user.lastName.charAt(0).toUpperCase()}.`
      : user.firstName;

    const review = await ReviewsLifecycleHelper.executeReviewCreation(
      this.prisma,
      {
        productId: product.id,
        userId,
        reviewerName,
        rating: dto.rating,
        isVerified,
        title: dto.title,
        text: dto.text,
        images: dto.images ?? [],
      },
    );

    this.logger.log(
      `[REVIEW_CREATED] Product: ${slug} | User: ${userId} | Rating: ${dto.rating} | Verified: ${isVerified}`,
    );

    return ReviewsMapper.toApiReview(review);
  }

  async markHelpful(slug: string, reviewId: string): Promise<ApiReview> {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!product) {
      throw new NotFoundException('Ürün bulunamadı.');
    }

    const review = await this.prisma.review.findFirst({
      where: { id: reviewId, productId: product.id },
    });

    if (!review) {
      throw new NotFoundException('Yorum bulunamadı.');
    }

    const updated = await this.prisma.review.update({
      where: { id: reviewId },
      data: { helpfulCount: { increment: 1 } },
    });

    return ReviewsMapper.toApiReview(updated);
  }

  async delete(reviewId: string): Promise<{ id: string }> {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
      select: { id: true, productId: true },
    });

    if (!review) {
      throw new NotFoundException('Yorum bulunamadı.');
    }

    await ReviewsLifecycleHelper.executeReviewDeletion(
      this.prisma,
      reviewId,
      review.productId,
    );

    this.logger.warn(
      `[REVIEW_DELETED] ReviewId: ${reviewId} | ProductId: ${review.productId}`,
    );

    return { id: reviewId };
  }

  async uploadImage(
    slug: string,
    file?: Express.Multer.File,
    clientIp?: string,
    userId?: string,
  ): Promise<MediaUploadResponse> {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!product) {
      throw new NotFoundException('Ürün bulunamadı.');
    }

    if (!this.mediaService) {
      throw new NotFoundException('Medya servisi aktif değil.');
    }

    return this.mediaService.uploadFile(file, clientIp, userId);
  }
}
