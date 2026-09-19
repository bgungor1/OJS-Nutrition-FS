import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/test-utils';
import { CriticalStockTable } from './critical-stock-table';
import type { AdminLowStockVariant } from '@/types';

describe('components/dashboard/critical-stock-table', () => {
  const mockLowStockVariants: AdminLowStockVariant[] = [
    {
      variantId: 'var-1',
      productId: 'prod-1',
      productName: 'Whey Isolate',
      productSlug: 'whey-isolate',
      aroma: 'Vanilya',
      gram: 1000,
      stockQuantity: 0,
      isAvailable: false,
      photoSrc: '/media/whey-vanilla.jpg',
    },
    {
      variantId: 'var-2',
      productId: 'prod-2',
      productName: 'Creatine Monohydrate',
      productSlug: 'creatine-monohydrate',
      aroma: 'Aromasız',
      gram: 300,
      stockQuantity: 2,
      isAvailable: true,
      photoSrc: '/media/creatine.jpg',
    },
    {
      variantId: 'var-3',
      productId: 'prod-3',
      productName: 'BCAA 4:1:1',
      productSlug: 'bcaa-411',
      aroma: 'Karpuz',
      gram: 500,
      stockQuantity: 5,
      isAvailable: true,
      photoSrc: '/media/bcaa.jpg',
    },
  ];

  it('renders critical stock table with all variant rows and badges', () => {
    render(<CriticalStockTable variants={mockLowStockVariants} />);

    expect(screen.getByText('Kritik Stok Takibi')).toBeInTheDocument();
    expect(screen.getByText('3 uyarı')).toBeInTheDocument();

    expect(screen.getByText('Whey Isolate')).toBeInTheDocument();
    expect(screen.getByText('Vanilya - 1000g')).toBeInTheDocument();
    expect(screen.getByText('Tükendi')).toBeInTheDocument();

    expect(screen.getByText('Creatine Monohydrate')).toBeInTheDocument();
    expect(screen.getByText('Aromasız - 300g')).toBeInTheDocument();
    expect(screen.getByText('Çok Az')).toBeInTheDocument();

    expect(screen.getByText('BCAA 4:1:1')).toBeInTheDocument();
    expect(screen.getByText('Azalıyor')).toBeInTheDocument();
  });

  it('renders safe stock level message when there are no low stock variants', () => {
    render(<CriticalStockTable variants={[]} />);

    expect(screen.getByTestId('critical-stock-empty')).toBeInTheDocument();
    expect(screen.getByText('Stok Seviyesi Güvenli')).toBeInTheDocument();
  });
});
