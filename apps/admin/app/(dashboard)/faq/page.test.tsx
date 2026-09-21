import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import FaqPage from './page';
import * as faqApi from '@/lib/api/faq';

vi.mock('@/lib/api/faq', () => ({
  listFaqs: vi.fn(),
  createFaq: vi.fn(),
  updateFaq: vi.fn(),
  deleteFaq: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

describe('FaqPage', () => {
  it('renders FAQ listing page with header and items', async () => {
    vi.mocked(faqApi.listFaqs).mockResolvedValueOnce([
      {
        id: 'faq-1',
        question: 'İade politikası nedir?',
        answer: '14 gün içerisinde koşulsuz iade edebilirsiniz.',
        category: 'genel',
        sort_order: 1,
      },
    ]);

    const pageResult = await FaqPage({
      searchParams: Promise.resolve({}),
    });

    render(pageResult);

    expect(screen.getByText('Sıkça Sorulan Sorular (SSS)')).toBeInTheDocument();
    expect(screen.getByText('İade politikası nedir?')).toBeInTheDocument();
    expect(
      screen.getByText('14 gün içerisinde koşulsuz iade edebilirsiniz.'),
    ).toBeInTheDocument();
  });

  it('renders error message when API fails', async () => {
    vi.mocked(faqApi.listFaqs).mockRejectedValueOnce(
      new Error('Bağlantı hatası oluştu'),
    );

    const pageResult = await FaqPage({
      searchParams: Promise.resolve({}),
    });

    render(pageResult);

    expect(screen.getByText('Bağlantı hatası oluştu')).toBeInTheDocument();
  });
});
