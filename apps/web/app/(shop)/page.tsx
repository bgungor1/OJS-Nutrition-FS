import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ana Sayfa | OJS Nutrition',
  description: 'Türkiye\'nin en kaliteli sporcu besinleri ve takviye gıdaları.',
};

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-12">
      <div className="space-y-4 text-center max-w-2xl mx-auto">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          Hedefine Ulaşman İçin <span className="text-primary">En İyisi</span>
        </h1>
        <p className="text-lg text-muted-foreground">
          OJS Nutrition yüksek kaliteli protein tozları, kreatinler ve sporcu gıdalarıyla antrenman veriminizi artırın.
        </p>
      </div>
    </div>
  );
}
