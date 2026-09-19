import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@/test/test-utils';
import { VariantList } from './variant-list';
import type { ApiProductVariant } from '@/types';

describe('components/products/variant-list', () => {
  const mockVariants: ApiProductVariant[] = [
    {
      id: 'var-1',
      aroma: 'Çikolata',
      size: { gram: 1000, pieces: 1, total_services: 33 },
      price: {
        total_price: 700,
        discounted_price: 630,
        profit: 70,
        price_per_servings: 21.2,
        discount_percentage: 10,
      },
      photo_src: 'media/products/whey-cikolata.jpg',
      is_available: true,
    },
  ];

  it('renders variants with aroma, gram, and prices', () => {
    render(
      <VariantList
        variants={mockVariants}
        onAddVariant={vi.fn()}
        onEditVariant={vi.fn()}
        onDeleteVariant={vi.fn()}
      />,
    );

    expect(screen.getByText('Çikolata')).toBeInTheDocument();
    expect(screen.getByText(/1000g/)).toBeInTheDocument();
    expect(screen.getByText('₺630,00')).toBeInTheDocument();
    expect(screen.getByText('Satışta')).toBeInTheDocument();
  });

  it('renders empty fallback when there are no variants', () => {
    render(
      <VariantList
        variants={[]}
        onAddVariant={vi.fn()}
        onEditVariant={vi.fn()}
        onDeleteVariant={vi.fn()}
      />,
    );

    expect(screen.getByTestId('variant-list-empty')).toBeInTheDocument();
    expect(screen.getByText('Henüz Varyant Eklenmedi')).toBeInTheDocument();
  });

  it('opens delete dialog and confirms deletion', async () => {
    const mockDelete = vi.fn().mockResolvedValue(undefined);
    render(
      <VariantList
        variants={mockVariants}
        onAddVariant={vi.fn()}
        onEditVariant={vi.fn()}
        onDeleteVariant={mockDelete}
      />,
    );

    const deleteBtn = screen.getByRole('button', { name: /sil/i });
    fireEvent.click(deleteBtn);

    expect(
      screen.getByText('Varyantı Silmek İstediğinize Emin Misiniz?'),
    ).toBeInTheDocument();

    const confirmBtn = screen.getByRole('button', { name: /evet, varyantı sil/i });
    fireEvent.click(confirmBtn);

    expect(mockDelete).toHaveBeenCalledWith('var-1');
  });
});
