import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/test-utils';
import {
  BestSellersSection,
  BestSellersSkeleton,
} from './best-sellers-section';
import type { ApiBestSellerProduct } from '@/types';

const mockProduct: ApiBestSellerProduct = {
  id: 'prod-1',
  name: 'Whey Protein 1000g',
  slug: 'whey-protein-1000g',
  short_explanation: 'Yüksek kaliteli whey proteini',
  photo_src: 'media/products/whey.jpg',
  comment_count: 45,
  average_star: 4.8,
  price_info: {
    total_price: 899.9,
    discounted_price: 799.9,
    discount_percentage: 11,
    profit: 100,
    price_per_servings: 26.6,
  },
};

describe('BestSellersSection Component', () => {
  it('renders BestSellersSkeleton with accessibility attribute', () => {
    render(<BestSellersSkeleton />);

    expect(
      screen.getByLabelText('En Çok Satanlar Yükleniyor'),
    ).toBeInTheDocument();
  });

  it('renders product cards and heading when products are provided', () => {
    render(<BestSellersSection products={[mockProduct]} />);

    expect(
      screen.getByRole('heading', { name: 'En Çok Satanlar' }),
    ).toBeInTheDocument();
    const allProductsLink = screen.getByText('Tüm Ürünleri İncele').closest('a');
    expect(allProductsLink).toHaveAttribute('href', '/products');
    expect(screen.getByText('Whey Protein 1000g')).toBeInTheDocument();
  });

  it('renders null when products array is empty', () => {
    const { container } = render(<BestSellersSection products={[]} />);
    expect(container.firstChild).toBeNull();
  });
});
