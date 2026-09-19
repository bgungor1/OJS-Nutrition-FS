import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/test-utils';
import { Badge } from './badge';

describe('components/ui/badge', () => {
  it('renders badge content correctly', () => {
    render(<Badge>Admin</Badge>);
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('applies success variant styles', () => {
    render(<Badge variant="success">Delivered</Badge>);
    const badge = screen.getByText('Delivered');
    expect(badge).toHaveClass('text-emerald-600');
  });

  it('applies warning variant styles', () => {
    render(<Badge variant="warning">Low Stock</Badge>);
    const badge = screen.getByText('Low Stock');
    expect(badge).toHaveClass('text-amber-600');
  });

  it('applies destructive variant styles', () => {
    render(<Badge variant="destructive">Cancelled</Badge>);
    const badge = screen.getByText('Cancelled');
    expect(badge).toHaveClass('bg-destructive');
  });
});
