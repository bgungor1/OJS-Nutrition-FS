import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ContactPage from './page';
import * as contactApi from '@/lib/api/contact';

vi.mock('@/lib/api/contact', () => ({
  listContacts: vi.fn(),
  updateContactStatus: vi.fn(),
  deleteContact: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

describe('ContactPage', () => {
  it('renders contact messages listing page with header and messages', async () => {
    vi.mocked(contactApi.listContacts).mockResolvedValueOnce({
      count: 1,
      results: [
        {
          id: 'msg-101',
          name: 'Burak Güngör',
          email: 'burak@example.com',
          message: 'Toplu sipariş indirimi bulunuyor mu?',
          handled: false,
          created_at: '2026-09-18T10:00:00.000Z',
        },
      ],
    });

    const pageResult = await ContactPage({
      searchParams: Promise.resolve({}),
    });

    render(pageResult);

    expect(screen.getByText('İletişim Mesajları')).toBeInTheDocument();
    expect(screen.getByText('Burak Güngör')).toBeInTheDocument();
    expect(screen.getByText('burak@example.com')).toBeInTheDocument();
    expect(
      screen.getByText('Toplu sipariş indirimi bulunuyor mu?'),
    ).toBeInTheDocument();
  });

  it('renders error message when API fails', async () => {
    vi.mocked(contactApi.listContacts).mockRejectedValueOnce(
      new Error('Mesajlar yüklenemedi'),
    );

    const pageResult = await ContactPage({
      searchParams: Promise.resolve({}),
    });

    render(pageResult);

    expect(screen.getByText('Mesajlar yüklenemedi')).toBeInTheDocument();
  });
});
