import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, Mail, Phone, MapPin, Star } from 'lucide-react';
import {
  DEFAULT_STORE_METRICS,
  type StoreMetrics,
} from '@/lib/constants/store-metrics';

interface FooterLink {
  label: string;
  href: string;
}

interface FooterProps {
  metrics?: Partial<StoreMetrics>;
}

const CORPORATE_LINKS: FooterLink[] = [
  { label: 'Hakkımızda', href: '/about' },
  { label: 'Sıkça Sorulan Sorular', href: '/faq' },
  { label: 'İletişim & Destek', href: '/contact' },
  { label: 'Tüm Ürünler', href: '/products' },
];

const CATEGORY_LINKS: FooterLink[] = [
  { label: 'Protein Tozları', href: '/products/protein' },
  { label: 'Spor Gıdaları & Amino Asit', href: '/products/spor-gidalari' },
  { label: 'Vitamin & Mineraller', href: '/products/vitamin' },
  { label: 'Sağlık & Yaşam', href: '/products/saglik' },
];

const CONTACT_ITEMS = [
  {
    icon: Mail,
    text: 'destek@ojsnutrition.com',
  },
  {
    icon: Phone,
    text: '0850 123 45 67 (Hafta içi 09:00 - 18:00)',
  },
  {
    icon: MapPin,
    text: 'İstanbul, Türkiye',
  },
];

export const Footer: React.FC<FooterProps> = ({ metrics }) => {
  const effectiveMetrics = { ...DEFAULT_STORE_METRICS, ...metrics };

  return (
    <footer className="border-t border-zinc-800 bg-zinc-950 text-white">
      <div className="container mx-auto px-4 sm:px-6 py-12 lg:py-16">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <div className="relative h-8 w-32">
              <Image
                src="/LOGO_Beyaz.png"
                alt="OJS Nutrition"
                fill
                className="object-contain"
              />
            </div>
            <p className="text-xs text-white leading-relaxed">
              Türkiye&apos;nin en kaliteli ve güvenilir sporcu besinleri, protein tozları ve takviye edici gıdaları.
            </p>
            <div className="flex flex-col gap-2.5 pt-1">
              <div
                className="inline-flex items-center gap-2 rounded-lg bg-zinc-900/90 px-3 py-2 border border-zinc-800 text-xs text-white"
                aria-label="Müşteri Değerlendirme Özeti"
              >
                <div className="flex text-amber-400 shrink-0">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                </div>
                <span className="font-semibold text-white">
                  {effectiveMetrics.averageRatingDisplay}
                </span>
                <span className="text-zinc-500">|</span>
                <span className="text-white">
                  {effectiveMetrics.satisfactionRateDisplay} Memnuniyet
                </span>
                <span className="text-zinc-500">|</span>
                <span className="text-white">
                  ({effectiveMetrics.totalReviewsDisplay} Yorum)
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-white">
                <ShieldCheck className="h-4 w-4 text-white shrink-0" />
                <span>%100 Orijinal Ürün & T.C. Tarım Bakanlığı Onaylı</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Kurumsal
            </h3>
            <ul className="space-y-2.5 text-xs text-white">
              {CORPORATE_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white hover:text-zinc-300 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Kategoriler
            </h3>
            <ul className="space-y-2.5 text-xs text-white">
              {CATEGORY_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white hover:text-zinc-300 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Müşteri Hizmetleri
            </h3>
            {CONTACT_ITEMS.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="flex items-start gap-2.5 text-xs text-white">
                  <Icon className="h-4 w-4 shrink-0 text-white mt-0.5" />
                  <span className="text-white">{item.text}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white">
          <p className="text-white">© {new Date().getFullYear()} OJS Nutrition. Tüm hakları saklıdır.</p>
          <div className="flex items-center gap-4 text-white">
            <span className="text-white">256-Bit SSL Güvenli Ödeme</span>
            <span>•</span>
            <span className="text-white">Visa / MasterCard / Troy</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
