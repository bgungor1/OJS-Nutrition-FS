import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@/test/test-utils';
import { SalesTrendChart } from './sales-trend-chart';
import type { AdminSalesTrendItem } from '@/types';

describe('components/dashboard/sales-trend-chart', () => {
  const mockTrendData: AdminSalesTrendItem[] = [
    { date: '2026-03-01', orderCount: 5, totalRevenue: 5000 },
    { date: '2026-03-02', orderCount: 10, totalRevenue: 12000 },
    { date: '2026-03-03', orderCount: 8, totalRevenue: 9500 },
  ];

  it('renders aggregated revenue and order count in header summary', () => {
    render(<SalesTrendChart data={mockTrendData} />);

    expect(screen.getByText('Satış ve Gelir Trendi')).toBeInTheDocument();
    expect(screen.getByText('23 sipariş')).toBeInTheDocument();
  });

  it('renders graphics symbols for all daily trend data points', () => {
    render(<SalesTrendChart data={mockTrendData} />);

    const bars = screen.getAllByRole('graphics-symbol');
    expect(bars).toHaveLength(3);
    expect(bars[0]).toHaveAttribute(
      'aria-label',
      expect.stringContaining('2026-03-01'),
    );
  });

  it('displays detailed info when user hovers over a bar', () => {
    render(<SalesTrendChart data={mockTrendData} />);

    const bars = screen.getAllByRole('graphics-symbol');
    fireEvent.mouseEnter(bars[1]);

    const activeInfo = screen.getByTestId('active-trend-info');
    expect(activeInfo).toHaveTextContent('2026-03-02');
    expect(activeInfo).toHaveTextContent('(10 sipariş)');

    fireEvent.mouseLeave(bars[1]);
    expect(
      screen.getByText('Detayları görmek için gün sütunlarının üzerine gelin'),
    ).toBeInTheDocument();
  });

  it('renders empty fallback message when dataset is empty', () => {
    render(<SalesTrendChart data={[]} />);

    expect(screen.getByTestId('sales-trend-empty')).toBeInTheDocument();
    expect(
      screen.getByText('Son 30 güne ait satış verisi bulunamadı.'),
    ).toBeInTheDocument();
  });
});
