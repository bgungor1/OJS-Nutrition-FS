import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/test-utils';
import CategoryError from './error';

describe('CategoryError Component', () => {
  it('renders heading, error message, and all recovery action buttons', async () => {
    const reset = vi.fn();
    const error = new Error('Kategori sunucusuna ulaşılamadı');

    const { user } = render(<CategoryError error={error} reset={reset} />);

    expect(
      screen.getByRole('heading', { level: 2, name: 'Kategori Ürünleri Yüklenemedi' })
    ).toBeInTheDocument();
    expect(screen.getByText('Kategori sunucusuna ulaşılamadı')).toBeInTheDocument();

    const retryButton = screen.getByRole('button', { name: /tekrar dene/i });
    expect(retryButton).toBeInTheDocument();

    await user.click(retryButton);
    expect(reset).toHaveBeenCalledTimes(1);

    const productsLink = screen.getByRole('link', { name: /tüm ürünler/i });
    expect(productsLink).toHaveAttribute('href', '/products');

    const homeLink = screen.getByRole('link', { name: /ana sayfa/i });
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('renders fallback error message when error.message is empty', () => {
    const reset = vi.fn();
    const error = new Error('');

    render(<CategoryError error={error} reset={reset} />);

    expect(
      screen.getByText(
        /bu kategoriye ait ürünler yüklenirken bir bağlantı hatası oluştu/i
      )
    ).toBeInTheDocument();
  });
});
