import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/test-utils';
import { Footer } from './footer';

describe('Footer Component', () => {
  it('renders default customer satisfaction and review count metrics', () => {
    render(<Footer />);

    expect(
      screen.getByLabelText('Müşteri Değerlendirme Özeti'),
    ).toBeInTheDocument();
    expect(screen.getByText('4.9 / 5.0')).toBeInTheDocument();
    expect(screen.getByText('%99 Memnuniyet')).toBeInTheDocument();
    expect(screen.getByText('(198.000+ Yorum)')).toBeInTheDocument();
  });

  it('renders custom store metrics when provided via props', () => {
    render(
      <Footer
        metrics={{
          averageRatingDisplay: '4.8 / 5.0',
          satisfactionRateDisplay: '%98',
          totalReviewsDisplay: '150.000+',
        }}
      />,
    );

    expect(screen.getByText('4.8 / 5.0')).toBeInTheDocument();
    expect(screen.getByText('%98 Memnuniyet')).toBeInTheDocument();
    expect(screen.getByText('(150.000+ Yorum)')).toBeInTheDocument();
  });

  it('renders brand logo and corporate links', () => {
    render(<Footer />);

    expect(screen.getByAltText('OJS Nutrition')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Hakkımızda' })).toHaveAttribute(
      'href',
      '/about',
    );
    expect(
      screen.getByRole('link', { name: 'Sıkça Sorulan Sorular' }),
    ).toHaveAttribute('href', '/faq');
    expect(
      screen.getByRole('link', { name: 'İletişim & Destek' }),
    ).toHaveAttribute('href', '/contact');
    expect(screen.getByRole('link', { name: 'Tüm Ürünler' })).toHaveAttribute(
      'href',
      '/products',
    );
  });

  it('renders category navigation links and contact info', () => {
    render(<Footer />);

    expect(
      screen.getByRole('link', { name: 'Protein Tozları' }),
    ).toHaveAttribute('href', '/products/protein');
    expect(screen.getByText('destek@ojsnutrition.com')).toBeInTheDocument();
    expect(
      screen.getByText(/256-Bit SSL Güvenli Ödeme/i),
    ).toBeInTheDocument();
  });
});
