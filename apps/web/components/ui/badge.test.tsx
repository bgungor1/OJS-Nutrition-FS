import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/test-utils';
import { Badge } from './badge';

describe('Badge component', () => {
  it('renders with children and default variant classes', () => {
    render(<Badge>New Item</Badge>);
    const badge = screen.getByText('New Item');

    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-primary');
    expect(badge).toHaveClass('text-primary-foreground');
  });

  it('renders all variant styles correctly', () => {
    const { rerender } = render(<Badge variant="secondary">Secondary</Badge>);
    expect(screen.getByText('Secondary')).toHaveClass('bg-secondary');

    rerender(<Badge variant="destructive">Warning</Badge>);
    expect(screen.getByText('Warning')).toHaveClass('bg-destructive');

    rerender(<Badge variant="outline">Outline</Badge>);
    expect(screen.getByText('Outline')).toHaveClass('text-foreground');
  });

  it('applies custom className alongside default styles', () => {
    render(<Badge className="custom-badge-class">Custom</Badge>);
    expect(screen.getByText('Custom')).toHaveClass('custom-badge-class');
  });

  it('renders as custom slot element when asChild is true', () => {
    render(
      <Badge asChild>
        <span data-testid="custom-slot">Slot Badge</span>
      </Badge>,
    );

    const badge = screen.getByTestId('custom-slot');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-primary');
  });
});
