import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/test-utils';
import { MetricCard } from './metric-card';
import { DollarSign } from 'lucide-react';

describe('components/dashboard/metric-card', () => {
  it('renders title and value properly', () => {
    render(<MetricCard title="Total Revenue" value="₺150.000,00" />);

    expect(screen.getByText('Total Revenue')).toBeInTheDocument();
    expect(screen.getByText('₺150.000,00')).toBeInTheDocument();
  });

  it('renders icon when provided', () => {
    const { container } = render(
      <MetricCard title="Sales" value={42} icon={DollarSign} />,
    );

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('renders description, badge, and positive trend indicator', () => {
    render(
      <MetricCard
        title="Orders"
        value={120}
        description="Compared to last month"
        badgeText="Active"
        badgeVariant="success"
        trend={{ value: '15%', isPositive: true, label: 'increase' }}
      />,
    );

    expect(screen.getByText('Compared to last month')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    const trendValue = screen.getByText('+15%');
    expect(trendValue).toBeInTheDocument();
    expect(trendValue).toHaveClass('text-emerald-600');
    expect(screen.getByText('increase')).toBeInTheDocument();
  });

  it('renders negative trend indicator with destructive style', () => {
    render(
      <MetricCard
        title="Refunds"
        value={5}
        trend={{ value: '3%', isPositive: false }}
      />,
    );

    const trendValue = screen.getByText('3%');
    expect(trendValue).toHaveClass('text-destructive');
  });

  it('forwards testId and custom classNames', () => {
    render(
      <MetricCard
        testId="custom-metric"
        title="Custom Metric"
        value="100"
        className="custom-card-class"
      />,
    );

    const card = screen.getByTestId('custom-metric');
    expect(card).toHaveClass('custom-card-class');
  });
});
