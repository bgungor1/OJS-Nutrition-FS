import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface CategoryCardItem {
  name: string;
  href: string;
  imageSrc: string;
}

const CATEGORY_ITEMS: CategoryCardItem[] = [
  {
    name: 'Protein',
    href: '/products/protein',
    imageSrc: '/protein.png',
  },
  {
    name: 'Vitaminler',
    href: '/products/vitamin',
    imageSrc: '/vitaminler.png',
  },
  {
    name: 'Sağlık',
    href: '/products/saglik',
    imageSrc: '/saglık.png',
  },
  {
    name: 'Spor Gıdaları',
    href: '/products/spor-gidalari',
    imageSrc: '/spor-gıdaları.png',
  },
  {
    name: 'Gıda',
    href: '/products/gida',
    imageSrc: '/gıda.png',
  },
  {
    name: 'Tüm Ürünler',
    href: '/products',
    imageSrc: '/tum-urunler.png',
  },
];

export const CategoryGrid: React.FC = () => {
  return (
    <section className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {CATEGORY_ITEMS.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="group relative flex flex-col items-center overflow-hidden rounded-xl border border-border bg-card p-3 transition-all duration-300 hover:shadow-md hover:border-primary/50"
          >
            <div className="relative h-24 sm:h-28 md:h-32 w-full overflow-hidden rounded-lg">
              <Image
                src={item.imageSrc}
                alt={`${item.name} kategorisi`}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                className="object-contain p-1 transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <span className="mt-2 text-xs sm:text-sm font-semibold uppercase tracking-wide text-foreground group-hover:text-primary transition-colors">
              {item.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default CategoryGrid;
