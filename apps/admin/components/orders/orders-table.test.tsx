import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { OrdersTable } from './orders-table';
import type { AdminOrderListItem } from '@/types';

describe('OrdersTable', () => {
  it('renders empty state when order list is empty', () => {
    render(<OrdersTable orders={[]} onUpdateStatus={vi.fn()} />);
    expect(screen.getByText('Sipariş Bulunamadı')).toBeInTheDocument();
  });

  it('renders orders list when orders are provided', () => {
    const mockOrders: AdminOrderListItem[] = [
      {
        id: 'ord-1',
        orderNo: 'OJS-20260918-0001',
        status: 'processing',
        totalPrice: 450,
        shippingFee: 29.9,
        itemCount: 3,
        createdAt: '2026-09-18T10:00:00.000Z',
        user: {
          id: 'u-1',
          email: 'ali@example.com',
          firstName: 'Ali',
          lastName: 'Kaya',
        },
      },
    ];

    render(<OrdersTable orders={mockOrders} onUpdateStatus={vi.fn()} />);

    expect(screen.getByText('OJS-20260918-0001')).toBeInTheDocument();
    expect(screen.getByText('Ali Kaya')).toBeInTheDocument();
    expect(screen.getByText('ali@example.com')).toBeInTheDocument();
    expect(screen.getByText('3 adet')).toBeInTheDocument();
    expect(screen.getByText('Hazırlanıyor')).toBeInTheDocument();
  });
});
