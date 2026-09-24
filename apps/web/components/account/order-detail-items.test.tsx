import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/test-utils';
import { OrderDetailItems } from './order-detail-items';
import type { OrderItem } from '@/types';

const mockItems: OrderItem[] = [
  {
    id: 'item_1',
    product_id: 'prod_1',
    product_variant_id: 'var_1',
    product_name: 'Günlük Vitamin Paketi',
    variant_name: '30 Paket',
    pieces: 2,
    unit_price: 250,
    total_price: 500,
    photo_src: 'media/products/gunluk-vitamin-paketi.png',
  },
  {
    id: 'item_2',
    product_id: 'prod_2',
    product_variant_id: 'var_2',
    product_name: 'Kreatin Monohidrat',
    pieces: 1,
    unit_price: 350,
    total_price: 350,
    photo_src: null,
  },
];

describe('OrderDetailItems component', () => {
  it('renders list of order items with names, variants and prices', () => {
    render(<OrderDetailItems items={mockItems} />);

    expect(screen.getByText(/Sipariş Kalemleri \(2 Ürün\)/i)).toBeInTheDocument();
    expect(screen.getByText('Günlük Vitamin Paketi')).toBeInTheDocument();
    expect(screen.getByText('30 Paket')).toBeInTheDocument();
    expect(screen.getByText('Kreatin Monohidrat')).toBeInTheDocument();
  });

  it('correctly transforms relative photo_src with getImageUrl to avoid Next.js image error', () => {
    render(<OrderDetailItems items={[mockItems[0]]} />);

    const img = screen.getByRole('img', { name: 'Günlük Vitamin Paketi' });
    expect(img).toBeInTheDocument();
    const src = img.getAttribute('src');
    expect(decodeURIComponent(src || '')).toContain(
      'http://localhost:3000/media/products/gunluk-vitamin-paketi.png',
    );
  });
});
