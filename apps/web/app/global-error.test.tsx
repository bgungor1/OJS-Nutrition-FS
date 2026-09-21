import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import GlobalError from './global-error';

describe('GlobalError Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('renders heading, description, error digest and buttons', () => {
    const error = new Error('Database connection failed') as Error & { digest?: string };
    error.digest = 'ERR_GLOBAL_500';
    const reset = vi.fn();

    render(<GlobalError error={error} reset={reset} />);

    expect(
      screen.getByRole('heading', { name: /kritik bir hata oluştu/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/uygulama genelinde beklenmedik bir sistem hatası meydana geldi/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/hata referansı: ERR_GLOBAL_500/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /yeniden dene/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /ana sayfa/i })).toHaveAttribute('href', '/');
  });

  it('calls reset function when retry button is clicked', async () => {
    const error = new Error('Critical runtime crash');
    const reset = vi.fn();

    render(<GlobalError error={error} reset={reset} />);

    const retryButton = screen.getByRole('button', { name: /yeniden dene/i });
    await userEvent.click(retryButton);

    expect(reset).toHaveBeenCalledTimes(1);
  });
});
