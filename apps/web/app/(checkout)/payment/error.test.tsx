import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/test-utils';
import PaymentError from './error';

describe('PaymentError Component', () => {
  it('renders heading, card safety message, and recovery actions', async () => {
    const reset = vi.fn();
    const error = new Error('Ödeme servisi yanıt vermedi');

    const { user } = render(<PaymentError error={error} reset={reset} />);

    expect(
      screen.getByRole('heading', { level: 2, name: 'Ödeme Bilgileri Yüklenemedi' })
    ).toBeInTheDocument();
    expect(screen.getByText('Ödeme servisi yanıt vermedi')).toBeInTheDocument();

    const retryButton = screen.getByRole('button', { name: /tekrar dene/i });
    expect(retryButton).toBeInTheDocument();

    await user.click(retryButton);
    expect(reset).toHaveBeenCalledTimes(1);

    const continueShoppingLink = screen.getByRole('link', { name: /alışverişe devam et/i });
    expect(continueShoppingLink).toHaveAttribute('href', '/');
  });

  it('renders default fallback message explaining no charge occurred', () => {
    const reset = vi.fn();
    const error = new Error('');

    render(<PaymentError error={error} reset={reset} />);

    expect(
      screen.getByText(
        /kartınızdan herhangi bir çekim yapılmamıştır/i
      )
    ).toBeInTheDocument();
  });
});
