import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/test-utils';
import ThankYouError from './error';

describe('ThankYouError Component', () => {
  it('renders heading, order retrieval notice, and navigation links', async () => {
    const reset = vi.fn();
    const error = new Error('Sipariş API zaman aşımı');

    const { user } = render(<ThankYouError error={error} reset={reset} />);

    expect(
      screen.getByRole('heading', { level: 2, name: 'Sipariş Detayı Yüklenemedi' })
    ).toBeInTheDocument();
    expect(screen.getByText('Sipariş API zaman aşımı')).toBeInTheDocument();

    const retryButton = screen.getByRole('button', { name: /tekrar dene/i });
    expect(retryButton).toBeInTheDocument();

    await user.click(retryButton);
    expect(reset).toHaveBeenCalledTimes(1);

    const ordersLink = screen.getByRole('link', { name: /siparişlerim/i });
    expect(ordersLink).toHaveAttribute('href', '/account/orders');

    const continueLink = screen.getByRole('link', { name: /alışverişe devam et/i });
    expect(continueLink).toHaveAttribute('href', '/products');
  });

  it('renders default fallback message recommending checking account orders', () => {
    const reset = vi.fn();
    const error = new Error('');

    render(<ThankYouError error={error} reset={reset} />);

    expect(
      screen.getByText(
        /siparişlerinizi hesabınızdan kontrol edebilirsiniz/i
      )
    ).toBeInTheDocument();
  });
});
