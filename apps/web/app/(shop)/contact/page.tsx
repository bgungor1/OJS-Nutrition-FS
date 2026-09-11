import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'İletişim',
  description: 'OJS Nutrition ile iletişime geçin.',
};

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-10 max-w-xl">
      <h1 className="text-3xl font-bold tracking-tight mb-2">İletişim</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Sorularınız, önerileriniz veya destek talepleriniz için bize ulaşın.
      </p>
    </div>
  );
}
