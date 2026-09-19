import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/test-utils';
import { RecentOrdersTable } from './recent-orders-table';
import type { AdminRecentOrder } from '@/types';

describe('components/dashboard/recent-orders-table', () => {
  const mockOrders: AdminRecentOrder[] = [
    {
      id: 'ord-1',
      orderNo: 'ORD-2026-001',
      customerName: 'Ahmet Yılmaz',
      customerEmail: 'ahmet@example.com',
      totalPrice: 1450.5,
      status: 'processing',
      itemsCount: 2,
      createdAt: '2026-03-18T10:00:00.000Z',
    },
    {
      id: 'ord-2',
      orderNo: 'ORD-2026-002',
      customerName: 'Ayşe Kaya',
      customerEmail: 'ayse@example.com',
      totalPrice: 890,
      status: 'delivered',
      itemsCount: 1,
      createdAt: '2026-03-18T11:00:00.000Z',
    },
  ];

  it('renders order numbers, customer details, prices, and status badges', () => {
    render(<RecentOrdersTable orders={mockOrders} />);

    expect(screen.getByText('Son Siparişler')).toBeInTheDocument();
    expect(screen.getByText('ORD-2026-001')).toBeInTheDocument();
    expect(screen.getByText('Ahmet Yılmaz')).toBeInTheDocument();
    expect(screen.getByText('ahmet@example.com')).toBeInTheDocument();
    expect(screen.getByText('₺1.450,50')).toBeInTheDocument();
    expect(screen.getByText('Hazırlanıyor')).toBeInTheDocument();

    expect(screen.getByText('ORD-2026-002')).toBeInTheDocument();
    expect(screen.getByText('Ayşe Kaya')).toBeInTheDocument();
    expect(screen.getByText('₺890,00')).toBeInTheDocument();
    expect(screen.getByText('Teslim Edildi')).toBeInTheDocument();
  });

  it('renders empty state when there are no recent orders', () => {
    render(<RecentOrdersTable orders={[]} />);

    expect(screen.getByTestId('recent-orders-empty')).toBeInTheDocument();
    expect(screen.getByText('Sipariş Bulunmuyor')).toBeInTheDocument();
  });
});
