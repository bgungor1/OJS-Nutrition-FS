import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export const PromoBanner: React.FC = () => {
  return (
    <section className="container mx-auto px-4 sm:px-6 my-8 sm:my-14">
      <Link
        href="/products"
        className="block relative w-full h-[140px] sm:h-[220px] md:h-[280px] lg:h-[320px] overflow-hidden rounded-2xl shadow-sm border border-border group"
      >
        <Image
          src="/ojs-nutrition-banner.png"
          alt="OJS Nutrition Fırsatları ve Kampanyalar"
          fill
          sizes="(max-width: 1280px) 100vw, 1280px"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
        />
      </Link>
    </section>
  );
};

export default PromoBanner;
