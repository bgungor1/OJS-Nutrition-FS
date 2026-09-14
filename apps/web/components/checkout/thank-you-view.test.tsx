import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/test-utils';
import { ThankYouView } from './thank-you-view';
import type { OrderDetail } from '@/types';

const mockOrder: OrderDetail = {
  id: 'order_123',
  order_no: 'ORD-2026-0001',
  status: 'processing',
  total_price: 650,
  shipping_fee: 0,
  subtotal: 650,
  address_snapshot: {
    title: 'Ev',
    firstName: 'Ahmet',
    lastName: 'Yılmaz',
    phoneNumber: '05551234567',
    country: 'Türkiye',
    region: 'İstanbul',
    subregion: 'Kadıköy',
    fullAddress: 'Moda Cad. No: 12',
  },
  items: [
    {
      id: 'item_1',
      product_id: 'prod_1',
      product_variant_id: 'var_1',
      product_name: 'Whey Protein',
      variant_name: 'Çikolata',
      pieces: 1,
      unit_price: 650,
      total_price: 650,
      photo_src: null,
      photo: null,
    },
  ],
  created_at: '2026-09-14T12:00:00Z',
};

describe('ThankYouView', () => {
  it('renders fallback view when order is null', () => {
    render(<ThankYouView order={null} orderId="order_fallback_id" />);

    expect(screen.getByText('Siparişiniz Alındı!')).toBeInTheDocument();
    expect(screen.getByText('order_fallback_id')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /siparişlerime git/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /alışverişe devam et/i })).toBeInTheDocument();
  });

  it('renders order details, items and summaries when order is provided', () => {
    render(<ThankYouView order={mockOrder} />);

    expect(screen.getByText('ORD-2026-0001')).toBeInTheDocument();
    expect(screen.getByText('Whey Protein')).toBeInTheDocument();
    expect(screen.getByText('Çikolata')).toBeInTheDocument();
    expect(screen.getByText('Moda Cad. No: 12')).toBeInTheDocument();
  });

  it('renders action buttons linking to orders and products', () => {
    render(<ThankYouView order={mockOrder} />);

    const ordersLink = screen.getByRole('link', { name: /siparişlerime git/i });
    const productsLink = screen.getByRole('link', { name: /alışverişe devam et/i });

    expect(ordersLink).toHaveAttribute('href', '/account/orders');
    expect(productsLink).toHaveAttribute('href', '/products');
  });
});
