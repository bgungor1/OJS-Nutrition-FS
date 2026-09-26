import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/test-utils';
import { CustomerReviewsPreview } from './customer-reviews-preview';

describe('CustomerReviewsPreview Component', () => {
  it('renders section title and default verified reviews count', () => {
    render(<CustomerReviewsPreview />);

    expect(
      screen.getByRole('heading', { name: 'Gerçek Müşteri Yorumları' }),
    ).toBeInTheDocument();
    expect(screen.getByText('198.000+ Doğrulanmış Yorum')).toBeInTheDocument();
    expect(screen.getByText('Harika Çözünürlük ve Tat')).toBeInTheDocument();
  });

  it('renders custom metrics when provided via props', () => {
    render(
      <CustomerReviewsPreview
        metrics={{
          totalReviewsDisplay: '220.000+',
        }}
      />,
    );

    expect(screen.getByText('220.000+ Doğrulanmış Yorum')).toBeInTheDocument();
  });
});
