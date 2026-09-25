import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '@prisma/client';
import type { Request } from 'express';
import { AuthenticatedUser } from '../common';
import { CreateReviewDto, ReviewQueryDto } from './dto';
import { ApiReview, PaginatedReviewsResponse } from './interfaces';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';

describe('ReviewsController', () => {
  let controller: ReviewsController;
  let service: {
    list: jest.Mock;
    create: jest.Mock;
    markHelpful: jest.Mock;
    delete: jest.Mock;
    uploadImage: jest.Mock;
  };

  const mockUser: AuthenticatedUser = {
    id: 'user-1',
    email: 'test@example.com',
    role: Role.customer,
  };

  const mockApiReview: ApiReview = {
    id: 'rev-1',
    product_id: 'prod-1',
    reviewer_name: 'Berkant G.',
    rating: 5,
    is_verified: true,
    title: 'Harika',
    text: 'Tadı çok güzel.',
    images: [],
    helpful_count: 0,
    created_at: '2026-03-01T12:00:00.000Z',
  };

  const mockPaginatedResponse: PaginatedReviewsResponse = {
    count: 1,
    results: [mockApiReview],
    stats: {
      total_reviews: 1,
      average_rating: 5,
      rating_distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 1 },
      verified_reviews: 1,
    },
  };

  beforeEach(async () => {
    service = {
      list: jest.fn(),
      create: jest.fn(),
      markHelpful: jest.fn(),
      delete: jest.fn(),
      uploadImage: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReviewsController],
      providers: [
        {
          provide: ReviewsService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<ReviewsController>(ReviewsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should call service.list with correct parameters', async () => {
      service.list.mockResolvedValue(mockPaginatedResponse);

      const query: ReviewQueryDto = { limit: 10, offset: 0, rating: 5 };
      const result = await controller.list('whey-protein', query);

      expect(service.list).toHaveBeenCalledWith('whey-protein', query);
      expect(result).toBe(mockPaginatedResponse);
    });
  });

  describe('create', () => {
    it('should call service.create with user ID and DTO', async () => {
      service.create.mockResolvedValue(mockApiReview);

      const dto: CreateReviewDto = {
        rating: 5,
        title: 'Harika',
        text: 'Tadı çok güzel.',
      };

      const result = await controller.create('whey-protein', mockUser, dto);

      expect(service.create).toHaveBeenCalledWith(
        'whey-protein',
        'user-1',
        dto,
      );
      expect(result).toBe(mockApiReview);
    });
  });

  describe('markHelpful', () => {
    it('should call service.markHelpful with slug and id', async () => {
      service.markHelpful.mockResolvedValue({
        ...mockApiReview,
        helpful_count: 1,
      });

      const result = await controller.markHelpful('whey-protein', 'rev-1');

      expect(service.markHelpful).toHaveBeenCalledWith('whey-protein', 'rev-1');
      expect(result.helpful_count).toBe(1);
    });
  });

  describe('delete', () => {
    it('should call service.delete with id', async () => {
      service.delete.mockResolvedValue({ id: 'rev-1' });

      const result = await controller.delete('rev-1');

      expect(service.delete).toHaveBeenCalledWith('rev-1');
      expect(result).toEqual({ id: 'rev-1' });
    });
  });

  describe('uploadImage', () => {
    it('should call service.uploadImage with slug, file, clientIp, and userId', async () => {
      const mockUploadResponse = {
        photo_src: 'media/uploads/photo.jpg',
        url: 'http://localhost:3000/media/uploads/photo.jpg',
        filename: 'photo.jpg',
        size: 1024,
        mimetype: 'image/jpeg',
      };
      service.uploadImage.mockResolvedValue(mockUploadResponse);

      const mockFile = { buffer: Buffer.from('test') } as Express.Multer.File;
      const mockReq = { ip: '127.0.0.1' } as unknown as Request;

      const result = await controller.uploadImage(
        'whey-protein',
        mockFile,
        mockReq,
        mockUser,
      );

      expect(service.uploadImage).toHaveBeenCalledWith(
        'whey-protein',
        mockFile,
        '127.0.0.1',
        'user-1',
      );
      expect(result).toBe(mockUploadResponse);
    });
  });
});
