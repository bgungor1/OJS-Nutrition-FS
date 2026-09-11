import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tüm Ürünler',
  description: 'OJS Nutrition tüm sporcu gıdaları ve takviye ürünleri.',
};

export default function ProductsPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-10">
      <div className="space-y-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Tüm Ürünler</h1>
        <p className="text-sm text-muted-foreground">
          En çok tercih edilen besin takviyelerini keşfedin.
        </p>
      </div>
    </div>
  );
}
