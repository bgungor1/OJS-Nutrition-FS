'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ApiCategory } from '@/types';

interface CategoryNavProps {
  categories?: ApiCategory[];
  isOpen?: boolean;
  onItemClick?: () => void;
}

const FALLBACK_CATEGORIES: ApiCategory[] = [
  { id: '1', name: 'PROTEİN', slug: 'protein' },
  { id: '2', name: 'SPOR GIDALARI', slug: 'spor-gidalari' },
  { id: '3', name: 'SAĞLIK', slug: 'saglik' },
  { id: '4', name: 'GIDA', slug: 'gida' },
  { id: '5', name: 'VİTAMİN', slug: 'vitamin' },
];

export const CategoryNav: React.FC<CategoryNavProps> = ({
  categories = FALLBACK_CATEGORIES,
  isOpen = false,
  onItemClick,
}) => {
  const pathname = usePathname();
  const activeCategories = categories.length > 0 ? categories : FALLBACK_CATEGORIES;

  return (
    <nav
      aria-label="Kategori Menüsü"
      className={`bg-zinc-950 text-zinc-100 text-xs sm:text-sm font-semibold tracking-wider transition-all duration-300 border-t border-zinc-800 ${
        isOpen ? 'block' : 'hidden md:block'
      }`}
    >
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-center gap-1 md:gap-8 px-4 py-2 overflow-x-auto scrollbar-none">
        {activeCategories.map((cat) => {
          const href = `/products/${cat.slug}`;
          const isActive = pathname === href;

          return (
            <Link
              key={cat.id || cat.slug}
              href={href}
              onClick={onItemClick}
              className={`py-1.5 px-3 rounded-md uppercase transition-colors whitespace-nowrap ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-800/80'
              }`}
            >
              {cat.name}
            </Link>
          );
        })}

        <Link
          href="/products"
          onClick={onItemClick}
          className={`py-1.5 px-3 rounded-md uppercase transition-colors whitespace-nowrap ${
            pathname === '/products'
              ? 'bg-primary text-primary-foreground'
              : 'text-zinc-300 hover:text-white hover:bg-zinc-800/80'
          }`}
        >
          TÜM ÜRÜNLER
        </Link>
      </div>
    </nav>
  );
};

export default CategoryNav;
