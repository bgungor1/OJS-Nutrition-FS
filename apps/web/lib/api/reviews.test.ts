import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getProductReviews,
  createProductReview,
  markReviewHelpful,
  uploadReviewImage,
} from './reviews';
import { serverFetch, ApiError } from '../api-client';
import type {
  ApiReview,
  CreateReviewPayload,
  PaginatedReviewsResponse,
} from '@/types';

vi.mock('../api-client', () => ({
  serverFetch: vi.fn(),
  ApiError: class ApiError extends Error {
    status: number;
    reason?: Record<string, string>;
    constructor(message: string, status = 500, reason?: Record<string, string>) {
      super(message);
      this.name = 'ApiError';
      this.status = status;
      this.reason = reason;
    }
  },
}));

const mockServerFetch = vi.mocked(serverFetch);

const mockReview: ApiReview = {
  id: 'rev_1',
  product_id: 'prod_1',
  reviewer_name: 'Ahmet Y.',
  rating: 5,
  is_verified: true,
  title: 'Mükemmel Lezzet',
  text: 'Çikolata aroması çok başarılı, topaklanma yapmıyor.',
  images: ['https://example.com/photo1.jpg'],
  helpful_count: 3,
  created_at: '2026-09-15T10:00:00.000Z',
};

const mockPaginatedResponse: PaginatedReviewsResponse = {
  count: 1,
  results: [mockReview],
  stats: {
    total_reviews: 1,
    average_rating: 5,
    rating_distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 1 },
    verified_reviews: 1,
  },
};

describe('Reviews API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getProductReviews', () => {
    it('fetches product reviews without query parameters', async () => {
      mockServerFetch.mockResolvedValueOnce(mockPaginatedResponse);

      const result = await getProductReviews('whey-protein');

      expect(mockServerFetch).toHaveBeenCalledTimes(1);
      expect(mockServerFetch).toHaveBeenCalledWith('/products/whey-protein/reviews', {
        next: {
          tags: ['reviews', 'product-whey-protein-reviews'],
          revalidate: 60,
        },
      });
      expect(result).toEqual(mockPaginatedResponse);
    });

    it('formats query string correctly with limit, offset, rating and sort', async () => {
      mockServerFetch.mockResolvedValueOnce(mockPaginatedResponse);

      await getProductReviews('creatine-monohydrate', {
        limit: 10,
        offset: 20,
        rating: 5,
        sort: 'most_helpful',
      });

      expect(mockServerFetch).toHaveBeenCalledWith(
        '/products/creatine-monohydrate/reviews?limit=10&offset=20&rating=5&sort=most_helpful',
        expect.objectContaining({
          next: {
            tags: ['reviews', 'product-creatine-monohydrate-reviews'],
            revalidate: 60,
          },
        }),
      );
    });

    it('propagates ApiError when backend returns an error', async () => {
      mockServerFetch.mockRejectedValueOnce(new ApiError('Ürün bulunamadı', 404));

      await expect(getProductReviews('non-existent')).rejects.toThrow('Ürün bulunamadı');
    });
  });

  describe('createProductReview', () => {
    it('sends POST request with Bearer authorization and json body', async () => {
      mockServerFetch.mockResolvedValueOnce(mockReview);

      const payload: CreateReviewPayload = {
        rating: 5,
        title: 'Harika Ürün',
        text: 'Tadı ve etkisi gerçekten başarılı.',
        images: ['https://example.com/image.jpg'],
      };

      const result = await createProductReview('whey-protein', 'test-token', payload);

      expect(mockServerFetch).toHaveBeenCalledTimes(1);
      expect(mockServerFetch).toHaveBeenCalledWith('/products/whey-protein/reviews', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer test-token',
        },
        body: JSON.stringify(payload),
      });
      expect(result).toEqual(mockReview);
    });
  });

  describe('markReviewHelpful', () => {
    it('sends POST request to helpful endpoint and returns updated review', async () => {
      const updatedReview = { ...mockReview, helpful_count: 4 };
      mockServerFetch.mockResolvedValueOnce(updatedReview);

      const result = await markReviewHelpful('whey-protein', 'rev_1');

      expect(mockServerFetch).toHaveBeenCalledTimes(1);
      expect(mockServerFetch).toHaveBeenCalledWith(
        '/products/whey-protein/reviews/rev_1/helpful',
        {
          method: 'POST',
        },
      );
      expect(result.helpful_count).toBe(4);
    });
  });

  describe('uploadReviewImage', () => {
    it('sends POST request to upload endpoint with FormData and returns response', async () => {
      const mockUploadResponse = {
        photo_src: 'media/uploads/photo.jpg',
        url: 'http://localhost:3000/media/uploads/photo.jpg',
      };
      mockServerFetch.mockResolvedValueOnce(mockUploadResponse);

      const formData = new FormData();
      formData.append('file', new Blob(['test']), 'photo.jpg');

      const result = await uploadReviewImage('whey-protein', 'test-token', formData);

      expect(mockServerFetch).toHaveBeenCalledTimes(1);
      expect(mockServerFetch).toHaveBeenCalledWith(
        '/products/whey-protein/reviews/upload',
        {
          method: 'POST',
          headers: {
            Authorization: 'Bearer test-token',
          },
          body: formData,
        },
      );
      expect(result).toEqual(mockUploadResponse);
    });
  });
});
