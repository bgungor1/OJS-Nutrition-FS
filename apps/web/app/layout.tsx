import type { Metadata } from 'next';
import { inter } from '@/lib/fonts';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'OJS Nutrition | Sporcu Besinleri & Takviye Gıdalar',
    template: '%s | OJS Nutrition',
  },
  description:
    'En kaliteli protein tozları, kreatinler, amino asitler ve vitaminler en uygun fiyatlarla OJS Nutrition\'da.',
  keywords: ['protein tozu', 'kreatin', 'amino asit', 'sporcu besinleri', 'supplement'],
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
