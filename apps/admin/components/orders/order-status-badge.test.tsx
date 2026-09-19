import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { OrderStatusBadge } from './order-status-badge';
import type { OrderStatus } from '@/types';

describe('OrderStatusBadge', () => {
  const statuses: Array<{ status: OrderStatus; expectedText: string }> = [
    { status: 'pending', expectedText: 'Beklemede' },
    { status: 'processing', expectedText: 'Hazırlanıyor' },
    { status: 'shipped', expectedText: 'Kargoya Verildi' },
    { status: 'delivered', expectedText: 'Teslim Edildi' },
    { status: 'cancelled', expectedText: 'İptal Edildi' },
    { status: 'refunded', expectedText: 'İade Edildi' },
  ];

  statuses.forEach(({ status, expectedText }) => {
    it(`renders correct text for status "${status}"`, () => {
      render(<OrderStatusBadge status={status} />);
      expect(screen.getByText(expectedText)).toBeInTheDocument();
    });
  });
});
