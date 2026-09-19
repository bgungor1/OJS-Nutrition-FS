import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@/test/test-utils';
import { ProductForm } from './product-form';
import type { CategoryTree } from '@/types';

describe('components/products/product-form', () => {
  const mockCategories: CategoryTree[] = [
    {
      id: '11111111-1111-4111-8111-111111111111',
      name: 'Protein',
      slug: 'protein',
      subCategories: [
        {
          id: '22222222-2222-4222-8222-222222222222',
          name: 'Whey Protein',
          slug: 'whey-protein',
          categoryId: '11111111-1111-4111-8111-111111111111',
        },
      ],
    },
  ];

  it('renders form inputs correctly', () => {
    render(<ProductForm categories={mockCategories} onSubmit={vi.fn()} />);

    expect(screen.getByLabelText(/ürün adı/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/slug/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/kısa açıklama/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/ana kategori/i)).toBeInTheDocument();
  });

  it('displays validation errors when submitting empty form', async () => {
    const mockSubmit = vi.fn();
    render(<ProductForm categories={mockCategories} onSubmit={mockSubmit} />);

    const submitBtn = screen.getByRole('button', { name: /ürünü oluştur/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText('Ürün adı en az 2 karakter olmalıdır')).toBeInTheDocument();
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  it('automatically derives slug from product name', () => {
    render(<ProductForm categories={mockCategories} onSubmit={vi.fn()} />);

    const nameInput = screen.getByLabelText(/ürün adı/i);
    fireEvent.change(nameInput, { target: { value: 'İzole Whey Çikolata' } });

    const slugInput = screen.getByLabelText(/slug/i) as HTMLInputElement;
    expect(slugInput.value).toBe('izole-whey-cikolata');
  });
});
