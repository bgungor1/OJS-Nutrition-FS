import { Review } from '@prisma/client';
import { CreateReviewDto } from '../dto';

export const mockProduct = {
  id: 'prod-1',
  slug: 'whey-protein',
  commentCount: 5,
  averageStar: 4.8,
};

export const mockUser = {
  id: 'user-1',
  firstName: 'Berkant',
  lastName: 'Güngör',
};

export const mockReview: Review = {
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

export const createMockReviewDto: CreateReviewDto = {
  rating: 5,
  title: 'Mükemmel tat',
  text: 'Sindirimi çok rahat ve performansı harika.',
  images: ['https://example.com/photo.jpg'],
};
