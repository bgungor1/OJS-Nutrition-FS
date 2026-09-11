import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sıkça Sorulan Sorular',
  description: 'OJS Nutrition sipariş, kargo ve ürünlerle ilgili sıkça sorulan sorular.',
};

export default function FaqPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-10 max-w-3xl">
      <h1 className="text-3xl font-bold tracking-tight mb-4">Sıkça Sorulan Sorular</h1>
      <p className="text-muted-foreground">
        Sipariş, kargo süreçleri ve ürün kullanımı hakkında en sık sorulan soruların yanıtları.
      </p>
    </div>
  );
}
