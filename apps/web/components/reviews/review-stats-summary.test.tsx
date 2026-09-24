import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/test-utils';
import { ReviewStatsSummary } from './review-stats-summary';
import type { ReviewStats } from '@/types';

describe('ReviewStatsSummary Component', () => {
  it('renders correctly with reviews data', () => {
    const stats: ReviewStats = {
      total_reviews: 20,
      average_rating: 4.5,
      rating_distribution: { 1: 0, 2: 1, 3: 2, 4: 5, 5: 12 },
      verified_reviews: 18,
    };

    render(<ReviewStatsSummary stats={stats} />);

    expect(screen.getByText('4.5')).toBeInTheDocument();
    expect(screen.getByText('/ 5')).toBeInTheDocument();
    expect(screen.getByText('20 Değerlendirme')).toBeInTheDocument();
    expect(screen.getByText('%90 Doğrulanmış Müşteri')).toBeInTheDocument();
    expect(screen.getByText(/Kullanıcıların %85'i ürünü tavsiye ediyor/i)).toBeInTheDocument();
  });

  it('renders 0.0 without hardcoded values when product has 0 reviews', () => {
    const emptyStats: ReviewStats = {
      total_reviews: 0,
      average_rating: 0,
      rating_distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      verified_reviews: 0,
    };

    render(<ReviewStatsSummary stats={emptyStats} />);

    expect(screen.getByText('0.0')).toBeInTheDocument();
    expect(screen.getByText('0 Değerlendirme')).toBeInTheDocument();
    expect(screen.getByText(/Bu ürün için ilk değerlendirmeyi yaparak/i)).toBeInTheDocument();
  });
});
