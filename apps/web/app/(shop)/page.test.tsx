import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/test/test-utils';
import HomePage from './page';
import * as api from '@/lib/api';

vi.mock('@/lib/api', () => ({
  getBestSellers: vi.fn(),
}));

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all main homepage sections and hero banner', async () => {
    vi.mocked(api.getBestSellers).mockResolvedValue([]);

    const page = await HomePage();
    const { container } = render(page);

    expect(
      screen.getByRole('link', {
        name: /tüm sporcu besinlerini ve kampanyaları keşfet/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('Protein')).toBeInTheDocument();
    expect(screen.getByText('Gerçek Müşteri Yorumları')).toBeInTheDocument();
    expect(screen.getByText('MEMNUNİYET GARANTİSİ')).toBeInTheDocument();
    expect(container).toBeInTheDocument();
  });
});
