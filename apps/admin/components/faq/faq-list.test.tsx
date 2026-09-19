import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FaqManager } from './faq-manager';
import type { FaqItem } from '@/types';

const mockPush = vi.fn();
let mockSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => mockSearchParams,
}));

describe('FaqManager component', () => {
  const mockItems: FaqItem[] = [
    {
      id: 'faq-1',
      question: 'Kargom ne zaman gelir?',
      answer: 'Siparişiniz 1-3 iş günü içerisinde adresinize teslim edilir.',
      category: 'kargo',
      sort_order: 1,
    },
    {
      id: 'faq-2',
      question: 'Ürünlerin içeriği organik mi?',
      answer: 'Tüm hammaddelerimiz sertifikalı ve helal onaylıdır.',
      category: 'urunler',
      sort_order: 2,
    },
  ];

  const mockCreate = vi.fn().mockResolvedValue(undefined);
  const mockUpdate = vi.fn().mockResolvedValue(undefined);
  const mockDelete = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams();
  });

  it('renders FAQ list with questions, answers, and category badges', () => {
    render(
      <FaqManager
        items={mockItems}
        onCreateAction={mockCreate}
        onUpdateAction={mockUpdate}
        onDeleteAction={mockDelete}
      />,
    );

    expect(screen.getByText('Kargom ne zaman gelir?')).toBeInTheDocument();
    expect(
      screen.getByText('Siparişiniz 1-3 iş günü içerisinde adresinize teslim edilir.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Ürünlerin içeriği organik mi?')).toBeInTheDocument();
    expect(screen.getAllByText('Kargo & Teslimat').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Ürünler').length).toBeGreaterThan(0);
  });

  it('displays empty state message when items list is empty', () => {
    render(
      <FaqManager
        items={[]}
        onCreateAction={mockCreate}
        onUpdateAction={mockUpdate}
        onDeleteAction={mockDelete}
      />,
    );

    expect(screen.getByText('Henüz SSS eklenmemiş')).toBeInTheDocument();
  });

  it('opens create modal when clicking "Yeni SSS Ekle"', () => {
    render(
      <FaqManager
        items={mockItems}
        onCreateAction={mockCreate}
        onUpdateAction={mockUpdate}
        onDeleteAction={mockDelete}
      />,
    );

    const createBtn = screen.getByRole('button', { name: /Yeni SSS Ekle/i });
    fireEvent.click(createBtn);

    expect(screen.getByText('Yeni SSS Maddesi Ekle')).toBeInTheDocument();
    expect(screen.getByLabelText(/Soru Metni/i)).toBeInTheDocument();
  });

  it('opens edit modal with prefilled data when clicking edit button', () => {
    render(
      <FaqManager
        items={mockItems}
        onCreateAction={mockCreate}
        onUpdateAction={mockUpdate}
        onDeleteAction={mockDelete}
      />,
    );

    const editBtn = screen.getByRole('button', {
      name: 'Düzenle: Kargom ne zaman gelir?',
    });
    fireEvent.click(editBtn);

    expect(screen.getByText('SSS Maddesini Düzenle')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Kargom ne zaman gelir?')).toBeInTheDocument();
  });

  it('opens delete confirmation dialog when clicking delete button', () => {
    render(
      <FaqManager
        items={mockItems}
        onCreateAction={mockCreate}
        onUpdateAction={mockUpdate}
        onDeleteAction={mockDelete}
      />,
    );

    const deleteBtn = screen.getByRole('button', {
      name: 'Sil: Kargom ne zaman gelir?',
    });
    fireEvent.click(deleteBtn);

    expect(screen.getByText('SSS Maddesini Sil')).toBeInTheDocument();
    expect(
      screen.getByText(/sorusu silinecektir\. Bu işlem geri alınamaz\./i),
    ).toBeInTheDocument();
  });

  it('navigates when clicking a category filter tab', () => {
    render(
      <FaqManager
        items={mockItems}
        onCreateAction={mockCreate}
        onUpdateAction={mockUpdate}
        onDeleteAction={mockDelete}
      />,
    );

    const kargoFilterBtn = screen.getByRole('button', { name: 'Kargo & Teslimat' });
    fireEvent.click(kargoFilterBtn);

    expect(mockPush).toHaveBeenCalledWith('/faq?category=kargo');
  });
});
