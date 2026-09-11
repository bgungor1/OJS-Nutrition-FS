import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hakkımızda',
  description: 'OJS Nutrition hakkında bilgi edinin.',
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-10 max-w-3xl">
      <h1 className="text-3xl font-bold tracking-tight mb-4">Hakkımızda</h1>
      <p className="text-muted-foreground leading-relaxed">
        OJS Nutrition, sporcuların ve sağlıklı yaşamı benimseyenlerin hedeflerine güvenle ulaşması için en yüksek kaliteli ve sertifikalı takviye gıdaları sunar.
      </p>
    </div>
  );
}
