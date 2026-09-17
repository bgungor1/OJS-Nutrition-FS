import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/test-utils';
import { ProductCard } from './product-card';

describe('ProductCard Component', () => {
  const defaultProps = {
    slug: 'whey-protein-1000g',
    name: 'Whey Protein 1000g',
    photoSrc: '/media/products/whey.jpg',
    shortExplanation: 'Yüksek kaliteli peynir altı suyu proteini',
    reviewCount: 42,
    averageStar: 4.6,
    price: 899,
    originalPrice: 1099,
    discountPercentage: 18,
    priority: true,
  };

  it('renders product information accurately', () => {
    render(<ProductCard {...defaultProps} />);

    expect(screen.getByRole('heading', { name: 'Whey Protein 1000g' })).toBeInTheDocument();
    expect(screen.getByText('Yüksek kaliteli peynir altı suyu proteini')).toBeInTheDocument();
    expect(screen.getByText('%18 İndirim')).toBeInTheDocument();
    expect(screen.getByText('899 TL')).toBeInTheDocument();
    expect(screen.getByText('1.099 TL')).toBeInTheDocument();
    expect(screen.getByText('(42)')).toBeInTheDocument();

    const links = screen.getAllByRole('link');
    expect(links.some((link) => link.getAttribute('href') === '/product/whey-protein-1000g')).toBe(true);

    const img = screen.getByRole('img', { name: /Whey Protein 1000g görseli/i });
    expect(img).toBeInTheDocument();
  });

  it('renders correctly without discount badge when discountPercentage is zero or undefined', () => {
    render(
      <ProductCard
        slug="creatine-300g"
        name="Creatine Monohydrate 300g"
        price={450}
        discountPercentage={0}
      />,
    );

    expect(screen.queryByText(/İndirim/i)).not.toBeInTheDocument();
    expect(screen.getByText('450 TL')).toBeInTheDocument();
    expect(screen.getByText('(0)')).toBeInTheDocument();
  });
});
