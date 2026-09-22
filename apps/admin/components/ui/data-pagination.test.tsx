import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/test-utils';
import { DataPagination } from './data-pagination';

describe('components/ui/data-pagination', () => {
  it('returns null when total is 0 or negative', () => {
    const { container } = render(
      <DataPagination total={0} offset={0} limit={20} basePath="/orders" />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders pagination label and active range correctly', () => {
    render(
      <DataPagination
        total={45}
        offset={0}
        limit={20}
        basePath="/orders"
        itemLabel="sipariş"
      />,
    );

    expect(
      screen.getByText(/Toplam 45 sipariş içerisinden 1-20 arası gösteriliyor/i),
    ).toBeInTheDocument();
  });

  it('disables previous button on first page and enables next button', () => {
    render(
      <DataPagination total={50} offset={0} limit={20} basePath="/products" />,
    );

    const prevLink = screen.getByRole('link', { name: /önceki/i });
    const nextLink = screen.getByRole('link', { name: /sonraki/i });

    expect(prevLink).toHaveClass('pointer-events-none');
    expect(nextLink).not.toHaveClass('pointer-events-none');
    expect(nextLink).toHaveAttribute('href', '/products?offset=20&limit=20');
  });

  it('disables next button on last page', () => {
    render(
      <DataPagination total={35} offset={20} limit={20} basePath="/products" />,
    );

    const prevLink = screen.getByRole('link', { name: /önceki/i });
    const nextLink = screen.getByRole('link', { name: /sonraki/i });

    expect(prevLink).not.toHaveClass('pointer-events-none');
    expect(prevLink).toHaveAttribute('href', '/products?offset=0&limit=20');
    expect(nextLink).toHaveClass('pointer-events-none');
  });

  it('appends query parameters to navigation links', () => {
    render(
      <DataPagination
        total={60}
        offset={20}
        limit={20}
        basePath="/orders"
        queryParams={{ status: 'pending', sort: 'total_desc', search: 'ahmet' }}
      />,
    );

    const nextLink = screen.getByRole('link', { name: /sonraki/i });
    expect(nextLink.getAttribute('href')).toContain('status=pending');
    expect(nextLink.getAttribute('href')).toContain('sort=total_desc');
    expect(nextLink.getAttribute('href')).toContain('search=ahmet');
    expect(nextLink.getAttribute('href')).toContain('offset=40');
  });
});
