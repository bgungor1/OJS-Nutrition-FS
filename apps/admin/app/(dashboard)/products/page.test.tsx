import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/test/test-utils';
import ProductsPage from './page';
import * as productsApi from '@/lib/api/products';

vi.mock('@/lib/api/products', () => ({
  listProducts: vi.fn(),
  listCategories: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/products',
  useSearchParams: () => new URLSearchParams(),
}));

describe('app/(dashboard)/products/page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders products listing page with table and controls', async () => {
    vi.mocked(productsApi.listProducts).mockResolvedValueOnce({
      count: 1,
      next: null,
      previous: null,
      results: [
        {
          id: 'prod-1',
          name: 'Whey Protein',
          slug: 'whey-protein',
          short_explanation: 'Short explanation',
          photo_src: '',
          comment_count: 10,
          average_star: 4.5,
          price_info: {
            total_price: 500,
            discounted_price: null,
            profit: null,
            price_per_servings: 15,
            discount_percentage: null,
          },
        },
      ],
    });

    vi.mocked(productsApi.listCategories).mockResolvedValueOnce([
      {
        id: 'cat-1',
        name: 'Protein',
        slug: 'protein',
        subCategories: [],
      },
    ]);

    const PageComponent = await ProductsPage({
      searchParams: Promise.resolve({}),
    });
    render(PageComponent);

    expect(screen.getByRole('heading', { level: 1, name: 'Ürün Yönetimi' })).toBeInTheDocument();
    expect(screen.getByText('Yeni Ürün Ekle')).toBeInTheDocument();
    expect(screen.getByText('Whey Protein')).toBeInTheDocument();
  });
});
