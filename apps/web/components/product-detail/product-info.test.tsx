import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/test-utils';
import { ProductInfo } from './product-info';

describe('ProductInfo Component', () => {
  it('renders dynamic rating and review counts when reviews exist', () => {
    render(
      <ProductInfo
        name="Whey Isolate"
        shortExplanation="Ultra saf protein"
        averageStar={4.8}
        commentCount={1250}
        tags={['ORİJİNAL', 'VEJETARYEN']}
        categorySlug="protein"
        categoryName="Protein"
      />,
    );

    expect(screen.getByRole('heading', { level: 1, name: 'Whey Isolate' })).toBeInTheDocument();
    expect(screen.getByText('4.8')).toBeInTheDocument();
    expect(screen.getByText('(1.250 Değerlendirme)')).toBeInTheDocument();
    expect(screen.getByText('Ultra saf protein')).toBeInTheDocument();
    expect(screen.getByText('ORİJİNAL')).toBeInTheDocument();
  });

  it('renders 0.0 and unreviewed message when product has no reviews without hardcoded 5.0', () => {
    render(
      <ProductInfo
        name="Yeni Ürün"
        shortExplanation="Henüz yeni çıkan ürün"
        averageStar={0}
        commentCount={0}
      />,
    );

    expect(screen.getByRole('heading', { level: 1, name: 'Yeni Ürün' })).toBeInTheDocument();
    expect(screen.getByText('0.0')).toBeInTheDocument();
    expect(screen.queryByText('5.0')).not.toBeInTheDocument();
    expect(screen.getByText('(Henüz değerlendirilmedi)')).toBeInTheDocument();
  });
});
