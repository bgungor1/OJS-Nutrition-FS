import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export const HeroBanner: React.FC = () => {
  return (
    <section className="relative w-full overflow-hidden bg-zinc-950">
      <Link
        href="/products"
        className="block relative h-[240px] sm:h-[360px] md:h-[460px] lg:h-[560px] xl:h-[620px] w-full group"
        aria-label="Tüm Sporcu Besinlerini ve Kampanyaları Keşfet"
      >
        <Image
          src="/banner_slider.jpg"
          alt="OJS Nutrition Kampanya ve Sporcu Besinleri"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.01]"
        />
      </Link>
    </section>
  );
};

export default HeroBanner;
