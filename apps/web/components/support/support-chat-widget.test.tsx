import * as React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@/test/test-utils';
import { SupportChatWidget } from './support-chat-widget';

describe('SupportChatWidget Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders closed floating trigger button initially', () => {
    render(<SupportChatWidget />);

    const trigger = screen.getByRole('button', { name: 'Canlı Destek Başlat' });
    expect(trigger).toBeInTheDocument();
    expect(screen.getByText('Canlı Destek')).toBeInTheDocument();
  });

  it('opens chat dialog on trigger click and displays welcome message', () => {
    render(<SupportChatWidget />);

    fireEvent.click(screen.getByRole('button', { name: 'Canlı Destek Başlat' }));

    expect(screen.getByRole('dialog', { name: 'Canlı Destek Penceresi' })).toBeInTheDocument();
    expect(screen.getByText('OJS Canlı Destek')).toBeInTheDocument();
    expect(screen.getByText('Çevrimiçi')).toBeInTheDocument();
    expect(
      screen.getByText(/OJS Nutrition Canlı Destek hattına hoş geldiniz/i),
    ).toBeInTheDocument();
  });

  it('allows clicking quick topics and renders automatic response', () => {
    render(<SupportChatWidget />);

    fireEvent.click(screen.getByRole('button', { name: 'Canlı Destek Başlat' }));

    const topicButton = screen.getByRole('button', {
      name: /Kargo Ne Zaman Ulaşır\?/i,
    });
    fireEvent.click(topicButton);

    expect(
      screen.getByText(/Hafta içi saat 16:00'a kadar verilen tüm siparişler/i),
    ).toBeInTheDocument();
  });

  it('allows user to type a message and receives simulated response', async () => {
    vi.useFakeTimers();
    render(<SupportChatWidget />);

    fireEvent.click(screen.getByRole('button', { name: 'Canlı Destek Başlat' }));

    const input = screen.getByLabelText('Destek mesajı');
    fireEvent.change(input, { target: { value: 'iade yapmak istiyorum' } });

    const submitBtn = screen.getByRole('button', { name: 'Mesajı Gönder' });
    fireEvent.click(submitBtn);

    expect(screen.getByText('iade yapmak istiyorum')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(
      screen.getByText(/14 gün içerisinde orijinal ambalajı bozulmamış/i),
    ).toBeInTheDocument();
  });

  it('closes dialog when close button is clicked', () => {
    render(<SupportChatWidget />);

    fireEvent.click(screen.getByRole('button', { name: 'Canlı Destek Başlat' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Sohbeti Kapat' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Canlı Destek Başlat' })).toBeInTheDocument();
  });
});
