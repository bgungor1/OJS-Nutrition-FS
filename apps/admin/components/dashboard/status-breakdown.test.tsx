import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/test-utils';
import { StatusBreakdown } from './status-breakdown';
import type { OrdersByStatus } from '@/types';

describe('components/dashboard/status-breakdown', () => {
  const mockStatusData: OrdersByStatus = {
    pending: 10,
    processing: 20,
    shipped: 30,
    delivered: 40,
    cancelled: 0,
    returned: 0,
  };

  it('calculates and displays total order count correctly', () => {
    render(<StatusBreakdown ordersByStatus={mockStatusData} />);

    expect(screen.getByText('Sipariş Statü Dağılımı')).toBeInTheDocument();
    expect(screen.getByText('Toplam: 100 sipariş')).toBeInTheDocument();
  });

  it('renders each status with label, count, and percentage', () => {
    render(<StatusBreakdown ordersByStatus={mockStatusData} />);

    expect(screen.getByText('Beklemede')).toBeInTheDocument();
    expect(screen.getByText('Hazırlanıyor')).toBeInTheDocument();
    expect(screen.getByText('Kargoda')).toBeInTheDocument();
    expect(screen.getByText('Teslim Edildi')).toBeInTheDocument();

    const deliveredItem = screen.getByTestId('status-item-delivered');
    expect(deliveredItem).toHaveTextContent('40');
    expect(deliveredItem).toHaveTextContent('(40%)');

    const progressbar = deliveredItem.querySelector('[role="progressbar"]');
    expect(progressbar).toHaveAttribute('aria-valuenow', '40');
  });

  it('renders empty state when there are zero orders in all statuses', () => {
    const emptyStatus: OrdersByStatus = {
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      returned: 0,
    };

    render(<StatusBreakdown ordersByStatus={emptyStatus} />);

    expect(screen.getByTestId('status-breakdown-empty')).toBeInTheDocument();
    expect(screen.getByText('Henüz sipariş kaydı bulunmuyor.')).toBeInTheDocument();
  });
});
