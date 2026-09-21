import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ContactManager } from './contact-manager';
import type { ContactMessage } from '@/types';

const mockPush = vi.fn();
let mockSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => mockSearchParams,
}));

describe('ContactManager component', () => {
  const mockMessages: ContactMessage[] = [
    {
      id: 'msg-1',
      name: 'Mehmet Demir',
      email: 'mehmet@example.com',
      subject: 'Kargo Takibi',
      message: 'Siparişim ne zaman kargoya verilecek?',
      handled: false,
      created_at: '2026-09-18T10:00:00.000Z',
    },
    {
      id: 'msg-2',
      name: 'Selin Aydın',
      email: 'selin@example.com',
      message: 'Teşekkürler, ürünler harika!',
      handled: true,
      created_at: '2026-09-17T14:30:00.000Z',
    },
  ];

  const mockToggleStatus = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams();
  });

  it('renders messages table with sender details, messages and badges', () => {
    render(
      <ContactManager
        messages={mockMessages}
        onToggleStatusAction={mockToggleStatus}
      />,
    );

    expect(screen.getByText('Mehmet Demir')).toBeInTheDocument();
    expect(screen.getByText('mehmet@example.com')).toBeInTheDocument();
    expect(screen.getByText('Selin Aydın')).toBeInTheDocument();
    expect(screen.getByText('Bekliyor')).toBeInTheDocument();
    expect(screen.getByText('İncelendi')).toBeInTheDocument();
  });

  it('displays empty state when message list is empty', () => {
    render(
      <ContactManager
        messages={[]}
        onToggleStatusAction={mockToggleStatus}
      />,
    );

    expect(screen.getByText('Mesaj bulunamadı')).toBeInTheDocument();
  });

  it('opens detail modal when clicking "Görüntüle" button', () => {
    render(
      <ContactManager
        messages={mockMessages}
        onToggleStatusAction={mockToggleStatus}
      />,
    );

    const viewBtn = screen.getByRole('button', {
      name: 'Görüntüle: Mehmet Demir',
    });
    fireEvent.click(viewBtn);

    expect(screen.getByText('Mesaj Detayı')).toBeInTheDocument();
    expect(screen.getByText('Konu: Kargo Takibi')).toBeInTheDocument();
    expect(
      screen.getAllByText('Siparişim ne zaman kargoya verilecek?').length,
    ).toBeGreaterThan(0);
  });

  it('toggles message handled status inside modal', async () => {
    render(
      <ContactManager
        messages={mockMessages}
        onToggleStatusAction={mockToggleStatus}
      />,
    );

    const viewBtn = screen.getByRole('button', {
      name: 'Görüntüle: Mehmet Demir',
    });
    fireEvent.click(viewBtn);

    const markBtn = screen.getByRole('button', {
      name: /İncelendi Olarak İşaretle/i,
    });
    fireEvent.click(markBtn);

    expect(mockToggleStatus).toHaveBeenCalledWith('msg-1', true);
  });

  it('navigates when selecting a filter tab', () => {
    render(
      <ContactManager
        messages={mockMessages}
        onToggleStatusAction={mockToggleStatus}
      />,
    );

    const pendingTab = screen.getByRole('button', { name: /Bekleyenler/i });
    fireEvent.click(pendingTab);

    expect(mockPush).toHaveBeenCalledWith('/contact?handled=false');
  });
});
