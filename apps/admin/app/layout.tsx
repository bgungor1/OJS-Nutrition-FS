import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'OJS Nutrition — Yönetici Paneli',
  description: 'OJS Nutrition e-ticaret yönetim ve operasyon paneli',
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className="dark">
      <body className="antialiased font-sans bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
