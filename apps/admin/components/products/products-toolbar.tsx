import * as React from 'react';
import { Search } from 'lucide-react';

interface ProductsToolbarProps {
  search?: string;
  category?: string;
  sort?: string;
  categories: Array<{ id: string; name: string; slug: string }>;
}

export function ProductsToolbar({
  search,
  category,
  sort,
  categories,
}: ProductsToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-3">
      <form method="GET" className="relative flex-1 w-full">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <input
          type="search"
          name="search"
          defaultValue={search || ''}
          placeholder="Ürün adı veya slug ile ara..."
          className="w-full pl-9 pr-4 py-2 text-xs rounded-md border border-input bg-card shadow-xs focus:outline-none focus:ring-1 focus:ring-ring"
        />
        {category && <input type="hidden" name="category" value={category} />}
        {sort && <input type="hidden" name="sort" value={sort} />}
      </form>

      <div className="flex items-center gap-2 w-full sm:w-auto">
        <form method="GET" className="w-full sm:w-auto">
          {search && <input type="hidden" name="search" value={search} />}
          {sort && <input type="hidden" name="sort" value={sort} />}
          <select
            name="category"
            defaultValue={category || ''}
            className="w-full sm:w-44 py-2 px-3 text-xs rounded-md border border-input bg-card shadow-xs focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
          >
            <option value="">Tüm Kategoriler</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </form>

        <form method="GET" className="w-full sm:w-auto">
          {search && <input type="hidden" name="search" value={search} />}
          {category && <input type="hidden" name="category" value={category} />}
          <select
            name="sort"
            defaultValue={sort || 'newest'}
            className="w-full sm:w-40 py-2 px-3 text-xs rounded-md border border-input bg-card shadow-xs focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
          >
            <option value="newest">En Yeniler</option>
            <option value="price_asc">Fiyat: Düşükten Yükseğe</option>
            <option value="price_desc">Fiyat: Yüksekten Düşüğe</option>
            <option value="rating">En Yüksek Puan</option>
          </select>
        </form>
      </div>
    </div>
  );
}
