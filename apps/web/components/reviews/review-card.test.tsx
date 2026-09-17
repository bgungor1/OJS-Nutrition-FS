import * as React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/test/test-utils';
import { ReviewCard } from './review-card';
import * as reviewActions from '@/lib/actions/review';
import type { ApiReview } from '@/types';

vi.mock('@/lib/actions/review', () => ({
  markHelpfulAction: vi.fn(),
}));

const mockReviewWithBadge: ApiReview = {
  id: 'rev_1',
  product_id: 'prod_1',
  reviewer_name: 'Ahmet Yılmaz',
  rating: 5,
  is_verified: true,
  title: 'Mükemmel Tat ve Çözünürlük',
  text: 'Hiç topaklanma yapmıyor, çikolata aroması çok hafif ve lezzetli.',
  images: ['https://example.com/photo1.jpg'],
  helpful_count: 12,
  created_at: '2026-09-17T10:00:00.000Z',
};

const mockReviewSimple: ApiReview = {
  id: 'rev_2',
  product_id: 'prod_1',
  reviewer_name: 'Can',
  rating: 3,
  is_verified: false,
  title: 'Ortalama ürün',
  text: 'Fiyatına göre idare eder ama daha iyisi olabilirdi.',
  images: [],
  helpful_count: 0,
  created_at: '2026-09-10T10:00:00.000Z',
};

describe('ReviewCard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders reviewer details, verified buyer badge, title, text and images', () => {
    render(<ReviewCard review={mockReviewWithBadge} slug="whey-protein" />);

    expect(screen.getByText('Ahmet Yılmaz')).toBeInTheDocument();
    expect(screen.getByText('AY')).toBeInTheDocument();
    expect(screen.getByText('Doğrulanmış Alıcı')).toBeInTheDocument();
    expect(screen.getByText('Mükemmel Tat ve Çözünürlük')).toBeInTheDocument();
    expect(
      screen.getByText('Hiç topaklanma yapmıyor, çikolata aroması çok hafif ve lezzetli.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /faydalı buldum/i })).toHaveTextContent('12');

    const images = screen.getAllByRole('img');
    expect(images.length).toBeGreaterThan(0);
  });

  it('renders correctly for unverified review without images', () => {
    render(<ReviewCard review={mockReviewSimple} slug="whey-protein" />);

    expect(screen.getByText('Can')).toBeInTheDocument();
    expect(screen.getByText('C')).toBeInTheDocument();
    expect(screen.queryByText('Doğrulanmış Alıcı')).not.toBeInTheDocument();
    expect(screen.getByText('Ortalama ürün')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /faydalı buldum/i })).toHaveTextContent('0');
  });

  it('optimistically increments helpful count when helpful button is clicked', async () => {
    vi.mocked(reviewActions.markHelpfulAction).mockResolvedValueOnce({
      success: true,
      helpful_count: 13,
    });

    const { user } = render(<ReviewCard review={mockReviewWithBadge} slug="whey-protein" />);

    const button = screen.getByRole('button', { name: /faydalı buldum/i });
    expect(button).toHaveTextContent('12');

    await user.click(button);

    expect(reviewActions.markHelpfulAction).toHaveBeenCalledWith('whey-protein', 'rev_1');
    expect(button).toHaveTextContent('13');
  });
});
