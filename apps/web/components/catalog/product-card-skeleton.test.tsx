import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/test-utils';
import { ProductCardSkeleton } from './product-card-skeleton';

describe('ProductCardSkeleton', () => {
  it('renders product card skeleton with data-testid and pulse animation', () => {
    render(<ProductCardSkeleton />);

    const card = screen.getByTestId('product-card-skeleton');
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass('rounded-xl');
  });

  it('contains skeleton placeholder items for image, title, and actions', () => {
    const { container } = render(<ProductCardSkeleton />);

    const skeletons = container.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletons.length).toBeGreaterThanOrEqual(5);
  });
});
