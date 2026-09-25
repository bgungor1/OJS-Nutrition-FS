import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma';
import { MediaService } from '../media/media.service';
import { ReviewQueryDto } from './dto';
import { ReviewsService } from './reviews.service';
import { mockProduct, mockReview } from './test/reviews.fixtures';

describe('ReviewsService', () => {
  let service: ReviewsService;
  let mediaService: {
    uploadFile: jest.Mock;
  };
  let prisma: {
    product: {
      findUnique: jest.Mock;
    };
    review: {
      findUnique: jest.Mock;
      findFirst: jest.Mock;
      findMany: jest.Mock;
      count: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
    $transaction: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      product: {
        findUnique: jest.fn(),
      },
      review: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    mediaService = {
      uploadFile: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewsService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
        {
          provide: MediaService,
          useValue: mediaService,
        },
      ],
    }).compile();

    service = module.get<ReviewsService>(ReviewsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should throw NotFoundException when product is not found', async () => {
      prisma.product.findUnique.mockResolvedValue(null);

      await expect(service.list('olmayan-urun')).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.product.findUnique).toHaveBeenCalledWith({
        where: { slug: 'olmayan-urun' },
        select: { id: true },
      });
    });

    it('should return paginated reviews list and correct statistics', async () => {
      prisma.product.findUnique.mockResolvedValue(mockProduct);
      prisma.review.findMany
        .mockResolvedValueOnce([mockReview])
        .mockResolvedValueOnce([
          { rating: 5, isVerified: true },
          { rating: 4, isVerified: false },
        ]);
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

    it('should support rating filter and different sorting options', async () => {
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

  describe('markHelpful', () => {
    it('should throw NotFoundException when product is not found', async () => {
      prisma.product.findUnique.mockResolvedValue(null);

      await expect(
        service.markHelpful('olmayan-urun', 'rev-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when review is not found', async () => {
      prisma.product.findUnique.mockResolvedValue(mockProduct);
      prisma.review.findFirst.mockResolvedValue(null);

      await expect(
        service.markHelpful('whey-protein', 'rev-999'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should increment helpfulCount by 1 and return the updated review', async () => {
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
    it('should throw NotFoundException when review is not found', async () => {
      prisma.review.findUnique.mockResolvedValue(null);

      await expect(service.delete('rev-999')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should delete review and update product aggregate metrics within transaction', async () => {
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

  describe('uploadImage', () => {
    it('should throw NotFoundException when product does not exist', async () => {
      prisma.product.findUnique.mockResolvedValue(null);

      await expect(
        service.uploadImage('non-existing', undefined, '127.0.0.1', 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should delegate to mediaService.uploadFile when product exists', async () => {
      prisma.product.findUnique.mockResolvedValue(mockProduct);
      const mockUploadResponse = {
        photo_src: 'media/uploads/photo.jpg',
        url: 'http://localhost:3000/media/uploads/photo.jpg',
        filename: 'photo.jpg',
        size: 1024,
        mimetype: 'image/jpeg',
      };
      mediaService.uploadFile.mockResolvedValue(mockUploadResponse);

      const mockFile = { buffer: Buffer.from('test') } as Express.Multer.File;
      const result = await service.uploadImage(
        'whey-protein',
        mockFile,
        '127.0.0.1',
        'user-1',
      );

      expect(prisma.product.findUnique).toHaveBeenCalledWith({
        where: { slug: 'whey-protein' },
        select: { id: true },
      });
      expect(mediaService.uploadFile).toHaveBeenCalledWith(
        mockFile,
        '127.0.0.1',
        'user-1',
      );
      expect(result).toBe(mockUploadResponse);
    });
  });
});
