import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/test-utils';
import { TopProductsCard } from './top-products-card';
import type { AdminTopProduct } from '@/types';

describe('components/dashboard/top-products-card', () => {
  const mockProducts: AdminTopProduct[] = [
    {
      productId: 'prod-1',
      productName: 'Whey Protein',
      totalQuantitySold: 150,
      totalRevenue: 125000,
      photoSrc: '/media/whey.jpg',
    },
    {
      productId: 'prod-2',
      productName: 'Creatine 300g',
      totalQuantitySold: 95,
      totalRevenue: 47500,
      photoSrc: null,
    },
  ];

  it('renders top products list with ranks, product titles, sold counts, and revenue', () => {
    render(<TopProductsCard products={mockProducts} />);

    expect(screen.getByText('En Çok Satan Ürünler')).toBeInTheDocument();
    expect(screen.getByText('Whey Protein')).toBeInTheDocument();
    expect(screen.getByText('150 adet satıldı')).toBeInTheDocument();
    expect(screen.getByText('₺125.000,00')).toBeInTheDocument();

    expect(screen.getByText('Creatine 300g')).toBeInTheDocument();
    expect(screen.getByText('95 adet satıldı')).toBeInTheDocument();
    expect(screen.getByText('₺47.500,00')).toBeInTheDocument();
  });

  it('renders empty fallback when products list is empty', () => {
    render(<TopProductsCard products={[]} />);

    expect(screen.getByTestId('top-products-empty')).toBeInTheDocument();
    expect(screen.getByText('Satış Verisi Yok')).toBeInTheDocument();
  });
});
