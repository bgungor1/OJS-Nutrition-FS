import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { OrderStatus, Review } from '@prisma/client';
import { PrismaService } from '../prisma';
import { CreateReviewDto, ReviewQueryDto } from './dto';
import { ReviewsService } from './reviews.service';

describe('ReviewsService', () => {
  let service: ReviewsService;
  let prisma: {
    product: {
      findUnique: jest.Mock;
      update: jest.Mock;
    };
    user: {
      findUnique: jest.Mock;
    };
    review: {
      findUnique: jest.Mock;
      findFirst: jest.Mock;
      findMany: jest.Mock;
      count: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
      aggregate: jest.Mock;
    };
    orderItem: {
      findFirst: jest.Mock;
    };
    $transaction: jest.Mock;
  };

  const mockProduct = {
    id: 'prod-1',
    slug: 'whey-protein',
    commentCount: 5,
    averageStar: 4.8,
  };

  const mockUser = {
    id: 'user-1',
    firstName: 'Berkant',
    lastName: 'Güngör',
  };

  const mockReview: Review = {
    id: 'rev-1',
    productId: 'prod-1',
    userId: 'user-1',
    reviewerName: 'Berkant G.',
    rating: 5,
    isVerified: true,
    title: 'Mükemmel tat',
    text: 'Sindirimi çok rahat ve performansı harika.',
    images: ['https://example.com/photo.jpg'],
    helpfulCount: 2,
    createdAt: new Date('2026-03-01T10:00:00Z'),
  };

  beforeEach(async () => {
    prisma = {
      product: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      user: {
        findUnique: jest.fn(),
      },
      review: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        aggregate: jest.fn(),
      },
      orderItem: {
        findFirst: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewsService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<ReviewsService>(ReviewsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('ürün bulunamadığında NotFoundException fırlatmalıdır', async () => {
      prisma.product.findUnique.mockResolvedValue(null);

      await expect(service.list('olmayan-urun')).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.product.findUnique).toHaveBeenCalledWith({
        where: { slug: 'olmayan-urun' },
        select: { id: true },
      });
    });

    it('sayfalanmış yorum listesini ve doğru istatistikleri dönmelidir', async () => {
      prisma.product.findUnique.mockResolvedValue(mockProduct);
      prisma.review.findMany
        .mockResolvedValueOnce([mockReview]) // sayfalı liste
        .mockResolvedValueOnce([
          { rating: 5, isVerified: true },
          { rating: 4, isVerified: false },
        ]); // istatistik özetleri
      prisma.review.count.mockResolvedValue(1);

      const query: ReviewQueryDto = { limit: 10, offset: 0, sort: 'newest' };
      const result = await service.list('whey-protein', query);

      expect(result.count).toBe(1);
      expect(result.results).toHaveLength(1);
      expect(result.results[0].id).toBe('rev-1');
      expect(result.stats.total_reviews).toBe(2);
      expect(result.stats.average_rating).toBe(4.5);
      expect(result.stats.verified_reviews).toBe(1);
      expect(result.stats.rating_distribution[5]).toBe(1);
      expect(result.stats.rating_distribution[4]).toBe(1);
    });

    it('rating filtresi ve farklı sıralama seçeneklerini desteklemelidir', async () => {
      prisma.product.findUnique.mockResolvedValue(mockProduct);
      prisma.review.findMany
        .mockResolvedValueOnce([mockReview])
        .mockResolvedValueOnce([{ rating: 5, isVerified: true }]);
      prisma.review.count.mockResolvedValue(1);

      const query: ReviewQueryDto = {
        limit: 5,
        offset: 0,
        rating: 5,
        sort: 'highest_rating',
      };
      await service.list('whey-protein', query);

      expect(prisma.review.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { productId: 'prod-1', rating: 5 },
          orderBy: [{ rating: 'desc' }, { createdAt: 'desc' }],
          take: 5,
          skip: 0,
        }),
      );
    });
  });

  describe('create', () => {
    const createDto: CreateReviewDto = {
      rating: 5,
      title: 'Mükemmel tat',
      text: 'Sindirimi çok rahat ve performansı harika.',
      images: ['https://example.com/photo.jpg'],
    };

    it('ürün bulunamadığında NotFoundException fırlatmalıdır', async () => {
      prisma.product.findUnique.mockResolvedValue(null);

      await expect(
        service.create('olmayan-urun', 'user-1', createDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('kullanıcı bulunamadığında NotFoundException fırlatmalıdır', async () => {
      prisma.product.findUnique.mockResolvedValue(mockProduct);
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.create('whey-protein', 'olmayan-user', createDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('kullanıcı daha önce yorum yaptıysa ConflictException fırlatmalıdır', async () => {
      prisma.product.findUnique.mockResolvedValue(mockProduct);
      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.review.findFirst.mockResolvedValue({ id: 'existing-rev' });

      await expect(
        service.create('whey-protein', 'user-1', createDto),
      ).rejects.toThrow(ConflictException);
    });

    it('doğrulanmış alıcı (isVerified=true) olarak transaction içinde yorum kaydetmeli ve ürünü güncellemelidir', async () => {
      prisma.product.findUnique.mockResolvedValue(mockProduct);
      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.review.findFirst.mockResolvedValue(null); // mükerrer yok
      prisma.orderItem.findFirst.mockResolvedValue({ id: 'item-1' }); // satın almış

      prisma.$transaction.mockImplementation(
        (callback: (tx: unknown) => Promise<unknown>) => {
          const tx = {
            review: {
              create: jest.fn().mockResolvedValue(mockReview),
              aggregate: jest.fn().mockResolvedValue({
                _count: { id: 6 },
                _avg: { rating: 4.83 },
              }),
            },
            product: {
              update: jest.fn().mockResolvedValue({}),
            },
          };
          return callback(tx);
        },
      );

      const result = await service.create('whey-protein', 'user-1', createDto);

      expect(result.id).toBe('rev-1');
      expect(result.reviewer_name).toBe('Berkant G.');
      expect(prisma.orderItem.findFirst).toHaveBeenCalledWith({
        where: {
          productId: 'prod-1',
          order: {
            userId: 'user-1',
            status: { not: OrderStatus.cancelled },
          },
        },
        select: { id: true },
      });
      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    });

    it('ürünü satın almamış kullanıcı için isVerified=false olarak yorum oluşturmalıdır', async () => {
      prisma.product.findUnique.mockResolvedValue(mockProduct);
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-2',
        firstName: 'Mehmet',
        lastName: null,
      });
      prisma.review.findFirst.mockResolvedValue(null);
      prisma.orderItem.findFirst.mockResolvedValue(null); // satın almamış

      const unverifiedReview = {
        ...mockReview,
        userId: 'user-2',
        reviewerName: 'Mehmet',
        isVerified: false,
      };

      prisma.$transaction.mockImplementation(
        (callback: (tx: unknown) => Promise<unknown>) => {
          const tx = {
            review: {
              create: jest.fn().mockResolvedValue(unverifiedReview),
              aggregate: jest.fn().mockResolvedValue({
                _count: { id: 1 },
                _avg: { rating: 5 },
              }),
            },
            product: {
              update: jest.fn().mockResolvedValue({}),
            },
          };
          return callback(tx);
        },
      );

      const result = await service.create('whey-protein', 'user-2', createDto);

      expect(result.is_verified).toBe(false);
      expect(result.reviewer_name).toBe('Mehmet');
    });
  });

  describe('markHelpful', () => {
    it('ürün bulunamadığında NotFoundException fırlatmalıdır', async () => {
      prisma.product.findUnique.mockResolvedValue(null);

      await expect(
        service.markHelpful('olmayan-urun', 'rev-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('yorum bulunamadığında NotFoundException fırlatmalıdır', async () => {
      prisma.product.findUnique.mockResolvedValue(mockProduct);
      prisma.review.findFirst.mockResolvedValue(null);

      await expect(
        service.markHelpful('whey-protein', 'rev-999'),
      ).rejects.toThrow(NotFoundException);
    });

    it('helpfulCount değerini 1 artırıp güncellenmiş yorumu dönmelidir', async () => {
      prisma.product.findUnique.mockResolvedValue(mockProduct);
      prisma.review.findFirst.mockResolvedValue(mockReview);
      prisma.review.update.mockResolvedValue({
        ...mockReview,
        helpfulCount: mockReview.helpfulCount + 1,
      });

      const result = await service.markHelpful('whey-protein', 'rev-1');

      expect(result.helpful_count).toBe(3);
      expect(prisma.review.update).toHaveBeenCalledWith({
        where: { id: 'rev-1' },
        data: { helpfulCount: { increment: 1 } },
      });
    });
  });

  describe('delete', () => {
    it('yorum bulunamadığında NotFoundException fırlatmalıdır', async () => {
      prisma.review.findUnique.mockResolvedValue(null);

      await expect(service.delete('rev-999')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('yorum silinip ürün aggregate verileri transaction içinde güncellenmelidir', async () => {
      prisma.review.findUnique.mockResolvedValue({
        id: 'rev-1',
        productId: 'prod-1',
      });

      prisma.$transaction.mockImplementation(
        (callback: (tx: unknown) => Promise<unknown>) => {
          const tx = {
            review: {
              delete: jest.fn().mockResolvedValue(mockReview),
              aggregate: jest.fn().mockResolvedValue({
                _count: { id: 4 },
                _avg: { rating: 4.75 },
              }),
            },
            product: {
              update: jest.fn().mockResolvedValue({}),
            },
          };
          return callback(tx);
        },
      );

      const result = await service.delete('rev-1');

      expect(result).toEqual({ id: 'rev-1' });
      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    });
  });
});
