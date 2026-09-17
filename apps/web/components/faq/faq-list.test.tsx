import * as React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@/test/test-utils';
import { FaqList } from './faq-list';
import type { ApiFaqItem } from '@/types';

const mockFaqItems: ApiFaqItem[] = [
  {
    id: 'faq_1',
    question: 'OJS Nutrition ürünlerinin menşei neresi?',
    answer: 'T.C. Tarım ve Orman Bakanlığı onaylı modern tesislerde üretilmektedir.',
    category: 'genel',
    sort_order: 1,
  },
  {
    id: 'faq_2',
    question: 'Sattığınız ürünler ilaç mıdır?',
    answer: 'Hayır, ürünlerimiz sporcu gıdası ve takviye edici gıdadır.',
    category: 'urunler',
    sort_order: 2,
  },
  {
    id: 'faq_3',
    question: 'Siparişler ne kadar sürede kargoya verilir?',
    answer: 'Hafta içi saat 16:00\'a kadar verilen siparişler aynı gün kargoya teslim edilir.',
    category: 'kargo',
    sort_order: 3,
  },
];

describe('FaqList Component', () => {
  beforeEach(() => {
  });

  it('renders all categories, search input, questions and customer support banner', () => {
    render(<FaqList items={mockFaqItems} />);

    expect(screen.getByRole('button', { name: /tüm sorular/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /genel bilgiler/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ürünler & kalite/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /kargo & teslimat/i })).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText(/sorularda ara/i);
    expect(searchInput).toBeInTheDocument();

    expect(screen.getByText('OJS Nutrition ürünlerinin menşei neresi?')).toBeInTheDocument();
    expect(screen.getByText('Sattığınız ürünler ilaç mıdır?')).toBeInTheDocument();
    expect(screen.getByText('Siparişler ne kadar sürede kargoya verilir?')).toBeInTheDocument();

    expect(screen.getByRole('link', { name: /bize ulaşın/i })).toHaveAttribute('href', '/contact');
  });

  it('filters questions by category when a category button is clicked', async () => {
    const { user } = render(<FaqList items={mockFaqItems} />);

    const productCategoryButton = screen.getByRole('button', { name: /ürünler & kalite/i });
    await user.click(productCategoryButton);

    expect(screen.getByText('Sattığınız ürünler ilaç mıdır?')).toBeInTheDocument();
    expect(screen.queryByText('OJS Nutrition ürünlerinin menşei neresi?')).not.toBeInTheDocument();
    expect(screen.queryByText('Siparişler ne kadar sürede kargoya verilir?')).not.toBeInTheDocument();

    const shippingCategoryButton = screen.getByRole('button', { name: /kargo & teslimat/i });
    await user.click(shippingCategoryButton);

    expect(screen.getByText('Siparişler ne kadar sürede kargoya verilir?')).toBeInTheDocument();
    expect(screen.queryByText('Sattığınız ürünler ilaç mıdır?')).not.toBeInTheDocument();

    const allCategoryButton = screen.getByRole('button', { name: /tüm sorular/i });
    await user.click(allCategoryButton);

    expect(screen.getByText('OJS Nutrition ürünlerinin menşei neresi?')).toBeInTheDocument();
    expect(screen.getByText('Sattığınız ürünler ilaç mıdır?')).toBeInTheDocument();
    expect(screen.getByText('Siparişler ne kadar sürede kargoya verilir?')).toBeInTheDocument();
  });

  it('filters questions dynamically based on search query', async () => {
    const { user } = render(<FaqList items={mockFaqItems} />);

    const searchInput = screen.getByPlaceholderText(/sorularda ara/i);
    await user.type(searchInput, 'ilaç');

    expect(screen.getByText('Sattığınız ürünler ilaç mıdır?')).toBeInTheDocument();
    expect(screen.queryByText('OJS Nutrition ürünlerinin menşei neresi?')).not.toBeInTheDocument();
    expect(screen.queryByText('Siparişler ne kadar sürede kargoya verilir?')).not.toBeInTheDocument();
  });

  it('displays empty state message when search query yields no matches', async () => {
    const { user } = render(<FaqList items={mockFaqItems} />);

    const searchInput = screen.getByPlaceholderText(/sorularda ara/i);
    await user.type(searchInput, 'bulunmayan kelime xyz');

    expect(screen.getByText(/aramanıza uygun soru bulunamadı/i)).toBeInTheDocument();
    expect(screen.queryByText('OJS Nutrition ürünlerinin menşei neresi?')).not.toBeInTheDocument();
  });

  it('toggles accordion content when clicking on a question trigger', async () => {
    const { user } = render(<FaqList items={mockFaqItems} />);

    const questionTrigger = screen.getByText('OJS Nutrition ürünlerinin menşei neresi?');
    await user.click(questionTrigger);

    const answer = await screen.findByText(/t.c. tarım ve orman bakanlığı onaylı/i);
    expect(answer).toBeInTheDocument();
  });
});
