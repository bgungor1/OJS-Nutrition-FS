import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/test-utils';
import ProductsError from './error';

describe('ProductsError Component', () => {
  it('renders heading, custom error message and action buttons', async () => {
    const reset = vi.fn();
    const error = new Error('Ağ bağlantısı koptu');

    const { user } = render(<ProductsError error={error} reset={reset} />);

    expect(
      screen.getByRole('heading', { level: 2, name: 'Ürün Kataloğu Yüklenemedi' })
    ).toBeInTheDocument();
    expect(screen.getByText('Ağ bağlantısı koptu')).toBeInTheDocument();

    const retryButton = screen.getByRole('button', { name: /tekrar dene/i });
    expect(retryButton).toBeInTheDocument();

    await user.click(retryButton);
    expect(reset).toHaveBeenCalledTimes(1);

    const homeLink = screen.getByRole('link', { name: /ana sayfa/i });
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('renders fallback error message when error message is not provided', () => {
    const reset = vi.fn();
    const error = new Error('');

    render(<ProductsError error={error} reset={reset} />);

    expect(
      screen.getByText(
        /ürün listesi yüklenirken bir bağlantı hatası oluştu/i
      )
    ).toBeInTheDocument();
  });
});
