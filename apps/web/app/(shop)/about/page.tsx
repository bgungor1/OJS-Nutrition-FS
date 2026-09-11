import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AboutCertificates } from '@/components/about/about-certificates';
import { AboutValues } from '@/components/about/about-values';

export const metadata: Metadata = {
  title: 'Hakkımızda | OJS Nutrition',
  description:
    '2016 yılından beri sporcu gıdaları ve fonksiyonel takviyeler üreten OJS Nutrition; yüksek kalite standartları ve sertifikalı üretimiyle yanınızda.',
  openGraph: {
    title: 'Hakkımızda | OJS Nutrition',
    description:
      'Sağlıklı ve fit yaşamayı zevkli ve kolay hale getirmek için en kaliteli sporcu takviyelerini sunuyoruz.',
  },
};

const STATS = [
  { value: '1.000.000+', label: 'Mutlu Müşteri', desc: 'Türkiye genelinde sporcu ve sağlıklı yaşam tutkunu' },
  { value: '2016', label: 'Kuruluş Yılı', desc: 'Yılların getirdiği formülasyon ve üretim tecrübesi' },
  { value: '%100', label: 'Orijinal & Güvenli', desc: 'T.C. Tarım Bakanlığı onaylı, sertifikalı üretim' },
  { value: '14 Gün', label: 'Koşulsuz İade', desc: 'Müşteri memnuniyetini merkeze alan güvence' },
];

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-5xl">
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <li>
            <Link href="/" className="hover:text-foreground transition-colors">
              Ana Sayfa
            </Link>
          </li>
          <li>
            <ChevronRight className="h-3 w-3" />
          </li>
          <li className="font-medium text-foreground">Hakkımızda</li>
        </ol>
      </nav>

      <div className="space-y-6 max-w-3xl mb-12">
        <Badge variant="secondary" className="text-xs font-bold uppercase tracking-wider">
          Biz Kimiz?
        </Badge>
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
          Sağlıklı ve Fit Yaşamayı Zevkli ve Kolay Hale Getirmek İçin Varız
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          2016 yılından beri sporcu gıdaları, takviye edici gıdalar ve fonksiyonel besinler üreten bir marka olarak;
          müşterilerimize en kaliteli, en lezzetli ve tüketimi en pratik ürünleri sunuyoruz.
        </p>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          Müşteri memnuniyeti ve sağlığı daima en temel önceliğimiz olmuştur. Protein tozlarından amino asitlere,
          vitamin ve mineral takviyelerinden performans destekleyicilere kadar geniş ürün gamımızla, spor performansınızı
          en üst seviyeye taşımak için ideal besin değerlerini sunuyoruz.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-16">
        {STATS.map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-border bg-card p-5 text-center shadow-xs"
          >
            <span className="text-2xl sm:text-3xl font-black text-primary block mb-1">
              {item.value}
            </span>
            <span className="text-xs sm:text-sm font-bold text-foreground block mb-1">
              {item.label}
            </span>
            <span className="text-[11px] text-muted-foreground leading-tight block">
              {item.desc}
            </span>
          </div>
        ))}
      </div>

      <AboutCertificates />

      <AboutValues />

      <div className="rounded-2xl bg-muted/40 border border-border p-8 text-center max-w-2xl mx-auto space-y-4">
        <h3 className="text-lg sm:text-xl font-bold text-foreground">
          Hedeflerinize Ulaşmaya Hazır Mısınız?
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
          Zengin ürün yelpazemizi keşfedin, ihtiyacınıza uygun takviyeleri güvenle sipariş edin.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Button asChild>
            <Link href="/products" className="inline-flex items-center gap-1.5">
              <span>Ürünleri Keşfet</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/contact">Bize Ulaşın</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
