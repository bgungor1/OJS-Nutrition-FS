import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/test-utils';
import { OrderStatusBadge } from './order-status-badge';
import type { OrderStatus } from '@/types';

describe('OrderStatusBadge component', () => {
  const statusCases: Array<{ status: OrderStatus; expectedLabel: string; expectedColorClass: string }> = [
    { status: 'pending', expectedLabel: 'Ödeme Bekleniyor', expectedColorClass: 'text-amber-600' },
    { status: 'processing', expectedLabel: 'Hazırlanıyor', expectedColorClass: 'text-blue-600' },
    { status: 'shipped', expectedLabel: 'Kargoya Verildi', expectedColorClass: 'text-indigo-600' },
    { status: 'delivered', expectedLabel: 'Teslim Edildi', expectedColorClass: 'text-emerald-600' },
    { status: 'cancelled', expectedLabel: 'İptal Edildi', expectedColorClass: 'text-destructive' },
    { status: 'returned', expectedLabel: 'İade Edildi', expectedColorClass: 'text-muted-foreground' },
  ];

  it.each(statusCases)(
    'renders label "$expectedLabel" for status "$status"',
    ({ status, expectedLabel, expectedColorClass }) => {
      render(<OrderStatusBadge status={status} />);
      const badge = screen.getByText(expectedLabel);

      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass(expectedColorClass);
    },
  );

  it('falls back to raw status string for unknown status', () => {
    render(<OrderStatusBadge status={'unknown_status' as OrderStatus} />);
    const badge = screen.getByText('unknown_status');

    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('text-muted-foreground');
  });

  it('merges custom className with status classes', () => {
    render(<OrderStatusBadge status="delivered" className="shadow-lg" />);
    const badge = screen.getByText('Teslim Edildi');

    expect(badge).toHaveClass('shadow-lg');
    expect(badge).toHaveClass('text-emerald-600');
  });
});
