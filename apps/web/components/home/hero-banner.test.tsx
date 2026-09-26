import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/test-utils';
import { HeroBanner } from './hero-banner';

describe('HeroBanner Component', () => {
  it('renders clean hero banner image linked to products catalog', () => {
    render(<HeroBanner />);

    const link = screen.getByRole('link', {
      name: /tüm sporcu besinlerini ve kampanyaları keşfet/i,
    });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/products');

    const image = screen.getByAltText('OJS Nutrition Kampanya ve Sporcu Besinleri');
    expect(image).toBeInTheDocument();
  });

  it('does not render redundant text overlay or buttons over banner image', () => {
    render(<HeroBanner />);

    expect(screen.queryByText(/hedefine ulaşman için/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/yüksek kalite & güven/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /ürünleri keşfet/i })).not.toBeInTheDocument();
  });
});
