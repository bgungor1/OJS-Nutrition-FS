import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, Phone, Mail, Clock, Truck, HelpCircle } from 'lucide-react';
import { ContactForm } from '@/components/contact/contact-form';

export const metadata: Metadata = {
  title: 'İletişim | OJS Nutrition',
  description:
    'OJS Nutrition müşteri hizmetleri ve destek ekibi ile iletişime geçin. Sipariş, kargo ve ürün sorularınız için bize ulaşın.',
  openGraph: {
    title: 'İletişim | OJS Nutrition',
    description:
      'Müşteri hizmetleri telefon, e-posta ve iletişim formu üzerinden bize ulaşın.',
  },
};

const CONTACT_CHANNELS = [
  {
    icon: Phone,
    title: 'Telefon Desteği',
    value: '0850 000 00 00',
    description: 'Sesli mesaj bırakabilir, müşteri temsilcimizden geri arama talep edebilirsiniz.',
  },
  {
    icon: Mail,
    title: 'E-posta',
    value: 'destek@ojsnutrition.com',
    description: 'Tüm soru ve iş birliği talepleriniz için 24 saat içinde yanıt verilir.',
  },
  {
    icon: Clock,
    title: 'Çalışma Saatleri',
    value: 'Hafta İçi: 09:00 - 17:00',
    description: 'Hafta sonu ve resmi tatillerde iletilen mesajlara ilk iş günü dönülür.',
  },
];

export default function ContactPage() {
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
          <li className="font-medium text-foreground">İletişim</li>
        </ol>
      </nav>

      <div className="max-w-2xl mb-10 space-y-2">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
          Bize Ulaşın
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Ürünlerimiz, siparişleriniz veya önerileriniz hakkında bize dilediğiniz zaman ulaşabilirsiniz.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-6">
            {CONTACT_CHANNELS.map((channel) => {
              const Icon = channel.icon;
              return (
                <div key={channel.title} className="flex gap-4 items-start">
                  <div className="h-10 w-10 shrink-0 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      {channel.title}
                    </h3>
                    <p className="text-sm sm:text-base font-semibold text-foreground">
                      {channel.value}
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {channel.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="rounded-2xl border border-border bg-muted/40 p-5 space-y-3">
            <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
              <Truck className="h-4 w-4 text-primary" />
              <span>Hızlı Kargo Bilgilendirmesi</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Hafta içi 16:00&apos;a, Cumartesi günleri 11:00&apos;e kadar verilen siparişler aynı gün kargoya teslim edilir.
              Paketiniz kargoya verildiğinde e-posta ve SMS ile takip bağlantısı iletilir.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 flex items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3">
              <HelpCircle className="h-5 w-5 text-primary shrink-0" />
              <div className="text-xs">
                <p className="font-semibold text-foreground">Cevabınızı hemen bulmak ister misiniz?</p>
                <p className="text-muted-foreground">Sıkça sorulan sorular sayfamızı inceleyin.</p>
              </div>
            </div>
            <Link
              href="/faq"
              className="text-xs font-semibold text-primary hover:underline shrink-0"
            >
              SSS &rarr;
            </Link>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xs">
            <h2 className="text-lg sm:text-xl font-bold text-foreground mb-2">
              İletişim Formu
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mb-6">
              Aşağıdaki formu doldurarak bize doğrudan mesaj gönderebilirsiniz.
            </p>
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}
