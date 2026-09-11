import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, Mail, Phone, MapPin } from 'lucide-react';

interface FooterLink {
  label: string;
  href: string;
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

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-border bg-zinc-950 text-zinc-300">
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
            <p className="text-xs text-zinc-400 leading-relaxed">
              Türkiye&apos;nin en kaliteli ve güvenilir sporcu besinleri, protein tozları ve takviye edici gıdaları.
            </p>
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span>%100 Orijinal Ürün & T.C. Tarım Bakanlığı Onaylı</span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Kurumsal
            </h3>
            <ul className="space-y-2.5 text-xs text-zinc-400">
              {CORPORATE_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-primary transition-colors">
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
            <ul className="space-y-2.5 text-xs text-zinc-400">
              {CATEGORY_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-primary transition-colors">
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
                <div key={index} className="flex items-start gap-2.5 text-xs text-zinc-400">
                  <Icon className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                  <span>{item.text}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>© {new Date().getFullYear()} OJS Nutrition. Tüm hakları saklıdır.</p>
          <div className="flex items-center gap-4">
            <span>256-Bit SSL Güvenli Ödeme</span>
            <span>•</span>
            <span>Visa / MasterCard / Troy</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
