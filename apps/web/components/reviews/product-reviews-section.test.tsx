import * as React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/test/test-utils';
import { ProductReviewsSection } from './product-reviews-section';
import type { PaginatedReviewsResponse } from '@/types';

const mockPaginatedReviews: PaginatedReviewsResponse = {
  count: 2,
  results: [
    {
      id: 'rev_1',
      product_id: 'prod_1',
      reviewer_name: 'Ahmet Yılmaz',
      rating: 5,
      is_verified: true,
      title: 'Mükemmel Tat',
      text: 'Çok lezzetli.',
      images: [],
      helpful_count: 5,
      created_at: '2026-09-17T12:00:00.000Z',
    },
    {
      id: 'rev_2',
      product_id: 'prod_1',
      reviewer_name: 'Mehmet Kaya',
      rating: 3,
      is_verified: false,
      title: 'Ortalama Etki',
      text: 'Beklediğim gibi.',
      images: [],
      helpful_count: 1,
      created_at: '2026-09-15T12:00:00.000Z',
    },
  ],
  stats: {
    total_reviews: 2,
    average_rating: 4.0,
    rating_distribution: { 5: 1, 4: 0, 3: 1, 2: 0, 1: 0 },
    verified_reviews: 1,
  },
};

describe('ProductReviewsSection Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders section title, stats, distribution and review cards', () => {
    render(
      <ProductReviewsSection
        slug="whey-protein"
        initialReviews={mockPaginatedReviews}
        isAuthenticated={true}
      />,
    );

    expect(
      screen.getByRole('heading', { name: 'Müşteri Değerlendirmeleri' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Mükemmel Tat')).toBeInTheDocument();
    expect(screen.getByText('Ortalama Etki')).toBeInTheDocument();
    expect(screen.getByText('Ahmet Yılmaz')).toBeInTheDocument();
    expect(screen.getByText('Mehmet Kaya')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /değerlendirme yaz/i })).toBeInTheDocument();
  });

  it('filters reviews by star rating and shows empty state when no matches', async () => {
    const { user } = render(
      <ProductReviewsSection
        slug="whey-protein"
        initialReviews={mockPaginatedReviews}
        isAuthenticated={true}
      />,
    );

    const fiveStarButtons = screen.getAllByRole('button', { name: /5 yıldız/i });
    await user.click(fiveStarButtons[0]);

    expect(screen.getByText('Mükemmel Tat')).toBeInTheDocument();
    expect(screen.queryByText('Ortalama Etki')).not.toBeInTheDocument();

    const oneStarButtons = screen.getAllByRole('button', { name: /1 yıldız/i });
    await user.click(oneStarButtons[0]);

    expect(screen.queryByText('Mükemmel Tat')).not.toBeInTheDocument();
    expect(screen.queryByText('Ortalama Etki')).not.toBeInTheDocument();
    expect(screen.getByText('1 Yıldızlı Değerlendirme Bulunamadı')).toBeInTheDocument();

    const clearButton = screen.getByRole('button', { name: /tüm değerlendirmeleri göster/i });
    await user.click(clearButton);

    expect(screen.getByText('Mükemmel Tat')).toBeInTheDocument();
    expect(screen.getByText('Ortalama Etki')).toBeInTheDocument();
  });

  it('renders login CTA when user is not authenticated', () => {
    render(
      <ProductReviewsSection
        slug="whey-protein"
        initialReviews={mockPaginatedReviews}
        isAuthenticated={false}
      />,
    );

    expect(screen.queryByRole('button', { name: /değerlendirme yaz/i })).not.toBeInTheDocument();
    const loginLink = screen.getByRole('link', { name: /giriş yap ve değerlendir/i });
    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute('href', '/login?redirect=/product/whey-protein');
  });

  it('opens review form modal when authenticated user clicks write review button', async () => {
    const { user } = render(
      <ProductReviewsSection
        slug="whey-protein"
        initialReviews={mockPaginatedReviews}
        isAuthenticated={true}
      />,
    );

    const writeButton = screen.getAllByRole('button', { name: /değerlendirme (yaz|başlat)/i })[0];
    await user.click(writeButton);

    expect(screen.getByRole('heading', { name: 'Ürünü Değerlendir' })).toBeInTheDocument();
  });
});
