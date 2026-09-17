import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/test-utils';
import { ProductGrid } from './product-grid';
import type { ApiProduct } from '@/types';

const mockProducts: ApiProduct[] = Array.from({ length: 6 }, (_, i) => ({
  id: `prod_${i + 1}`,
  slug: `product-${i + 1}`,
  name: `Ürün ${i + 1}`,
  short_explanation: `Açıklama ${i + 1}`,
  photo_src: `/media/prod-${i + 1}.jpg`,
  comment_count: 10 + i,
  average_star: 4.5,
  price_info: {
    total_price: 100 * (i + 1),
    discounted_price: 120 * (i + 1),
    discount_percentage: 15,
    profit: 20 * (i + 1),
    price_per_servings: 10,
  },
}));

describe('ProductGrid Component', () => {
  it('renders empty state message and redirect link when products array is empty', () => {
    render(<ProductGrid products={[]} />);

    expect(screen.getByText('Ürün Bulunamadı')).toBeInTheDocument();
    expect(
      screen.getByText(/Seçtiğiniz filtreye veya kategoriye ait ürün bulunamadı/i),
    ).toBeInTheDocument();
    const link = screen.getByRole('link', { name: /Tüm Ürünleri Gör/i });
    expect(link).toHaveAttribute('href', '/products');
  });

  it('renders grid with all product cards when products are provided', () => {
    render(<ProductGrid products={mockProducts} />);

    expect(screen.queryByText('Ürün Bulunamadı')).not.toBeInTheDocument();
    mockProducts.forEach((product) => {
      expect(screen.getByText(product.name)).toBeInTheDocument();
    });

    const headings = screen.getAllByRole('heading', { level: 3 });
    expect(headings).toHaveLength(6);
  });
});
