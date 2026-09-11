import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const HeroBanner: React.FC = () => {
  return (
    <section className="relative w-full overflow-hidden bg-zinc-950">
      <div className="relative h-[280px] sm:h-[380px] md:h-[460px] lg:h-[560px] xl:h-[620px] w-full">
        <Image
          src="/banner_slider.jpg"
          alt="OJS Nutrition Kampanya ve Sporcu Besinleri"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center brightness-90"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent flex items-center">
          <div className="container mx-auto px-4 sm:px-6 lg:px-12">
            <div className="max-w-xl space-y-4">
              <span className="inline-block rounded-full bg-primary/20 border border-primary/40 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
                Yüksek Kalite & Güven
              </span>
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                Hedefine Ulaşman İçin <span className="text-primary">En İyisi</span>
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-zinc-300 line-clamp-3 leading-relaxed">
                Avrupa standartlarında üretilen whey proteinler, kreatinler ve amino asit takviyeleri ile antrenman veriminizi zirveye taşıyın.
              </p>
              <div className="pt-2 flex flex-wrap gap-3">
                <Button size="lg" className="font-semibold" asChild>
                  <Link href="/products">Ürünleri Keşfet</Link>
                </Button>
                <Button size="lg" variant="outline" className="text-white border-white/30 hover:bg-white/10" asChild>
                  <Link href="/products/protein">Protein Tozları</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
