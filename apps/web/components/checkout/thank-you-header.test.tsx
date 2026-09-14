import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/test-utils';
import { ThankYouHeader } from './thank-you-header';
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
  items: [],
  created_at: '2026-09-14T12:00:00Z',
};

describe('ThankYouHeader', () => {
  it('renders order confirmation heading and info', () => {
    render(<ThankYouHeader order={mockOrder} />);

    expect(screen.getByText('Siparişiniz Alındı!')).toBeInTheDocument();
    expect(screen.getByText('ORD-2026-0001')).toBeInTheDocument();
  });

  it('renders order status badge correctly', () => {
    render(<ThankYouHeader order={mockOrder} />);

    expect(screen.getByText('Hazırlanıyor')).toBeInTheDocument();
  });
});
