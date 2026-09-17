import type { Metadata } from 'next';
import { inter } from '@/lib/fonts';
import './globals.css';

const siteUrl = process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'OJS Nutrition | Sporcu Besinleri & Takviye Gıdalar',
    template: '%s | OJS Nutrition',
  },
  description:
    'En kaliteli protein tozları, kreatinler, amino asitler ve vitaminler en uygun fiyatlarla OJS Nutrition\'da.',
  keywords: ['protein tozu', 'kreatin', 'amino asit', 'sporcu besinleri', 'supplement'],
  authors: [{ name: 'OJS Nutrition' }],
  creator: 'OJS Nutrition',
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: siteUrl,
    siteName: 'OJS Nutrition',
    title: 'OJS Nutrition | Sporcu Besinleri & Takviye Gıdalar',
    description:
      'En kaliteli protein tozları, kreatinler, amino asitler ve vitaminler en uygun fiyatlarla OJS Nutrition\'da.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OJS Nutrition | Sporcu Besinleri & Takviye Gıdalar',
    description:
      'En kaliteli protein tozları, kreatinler, amino asitler ve vitaminler en uygun fiyatlarla OJS Nutrition\'da.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased flex flex-col">
        {children}
      </body>
    </html>
  );
}
