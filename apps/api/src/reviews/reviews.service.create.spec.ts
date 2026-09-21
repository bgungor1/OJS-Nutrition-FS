import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { OrderStatus } from '@prisma/client';
import { PrismaService } from '../prisma';
import { ReviewsService } from './reviews.service';
import {
  createMockReviewDto,
  mockProduct,
  mockReview,
  mockUser,
} from './test/reviews.fixtures';

describe('ReviewsService - create', () => {
  let service: ReviewsService;
  let prisma: {
    product: {
      findUnique: jest.Mock;
    };
    user: {
      findUnique: jest.Mock;
    };
    review: {
      findFirst: jest.Mock;
    };
    orderItem: {
      findFirst: jest.Mock;
    };
    $transaction: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      product: {
        findUnique: jest.fn(),
      },
      user: {
        findUnique: jest.fn(),
      },
      review: {
        findFirst: jest.fn(),
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

  it('should throw NotFoundException when product is not found', async () => {
    prisma.product.findUnique.mockResolvedValue(null);

    await expect(
      service.create('olmayan-urun', 'user-1', createMockReviewDto),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw NotFoundException when user is not found', async () => {
    prisma.product.findUnique.mockResolvedValue(mockProduct);
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(
      service.create('whey-protein', 'olmayan-user', createMockReviewDto),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw ConflictException when user has already reviewed the product', async () => {
    prisma.product.findUnique.mockResolvedValue(mockProduct);
    prisma.user.findUnique.mockResolvedValue(mockUser);
    prisma.review.findFirst.mockResolvedValue({ id: 'existing-rev' });

    await expect(
      service.create('whey-protein', 'user-1', createMockReviewDto),
    ).rejects.toThrow(ConflictException);
  });

  it('should create review with isVerified=true and update product metrics within transaction for verified buyer', async () => {
    prisma.product.findUnique.mockResolvedValue(mockProduct);
    prisma.user.findUnique.mockResolvedValue(mockUser);
    prisma.review.findFirst.mockResolvedValue(null);
    prisma.orderItem.findFirst.mockResolvedValue({ id: 'item-1' });

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

    const result = await service.create(
      'whey-protein',
      'user-1',
      createMockReviewDto,
    );

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

  it('should create review with isVerified=false for non-purchasing user', async () => {
    prisma.product.findUnique.mockResolvedValue(mockProduct);
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-2',
      firstName: 'Mehmet',
      lastName: null,
    });
    prisma.review.findFirst.mockResolvedValue(null);
    prisma.orderItem.findFirst.mockResolvedValue(null);

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

    const result = await service.create(
      'whey-protein',
      'user-2',
      createMockReviewDto,
    );

    expect(result.is_verified).toBe(false);
    expect(result.reviewer_name).toBe('Mehmet');
  });
});
