import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@/test/test-utils';
import { VariantModal } from './variant-modal';

describe('components/products/variant-modal', () => {
  it('renders inputs when open is true', () => {
    render(
      <VariantModal
        open={true}
        onOpenChange={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByText('Yeni Varyant Ekle')).toBeInTheDocument();
    expect(screen.getByLabelText(/aroma \/ tat/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/gramaj/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/satış fiyatı/i)).toBeInTheDocument();
  });

  it('shows error when discounted price is equal to or higher than total price', async () => {
    const mockSubmit = vi.fn();
    render(
      <VariantModal
        open={true}
        onOpenChange={vi.fn()}
        onSubmit={mockSubmit}
      />,
    );

    fireEvent.change(screen.getByLabelText(/aroma \/ tat/i), { target: { value: 'Muz' } });
    fireEvent.change(screen.getByLabelText(/gramaj/i), { target: { value: '1000' } });
    fireEvent.change(screen.getByLabelText(/servis sayısı/i), { target: { value: '30' } });
    fireEvent.change(screen.getByLabelText(/satış fiyatı/i), { target: { value: '500' } });
    fireEvent.change(screen.getByLabelText(/[İi]ndirimli [Ff]iyat/i), { target: { value: '600' } });

    const submitBtn = screen.getByRole('button', { name: /^kaydet$/i });
    fireEvent.click(submitBtn);

    expect(
      screen.getByText('İndirimli fiyat normal satış fiyatından düşük olmalıdır'),
    ).toBeInTheDocument();
    expect(mockSubmit).not.toHaveBeenCalled();
  });
});
