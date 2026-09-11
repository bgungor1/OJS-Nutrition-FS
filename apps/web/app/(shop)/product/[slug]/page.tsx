import type { Metadata } from 'next';

type ProductDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `Ürün Detayı: ${slug}`,
    description: 'OJS Nutrition ürün detayları, besin içeriği ve kullanıcı yorumları.',
  };
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { slug } = await params;

  return (
    <div className="container mx-auto px-4 sm:px-6 py-10">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Ürün: {slug}</h1>
        <p className="text-muted-foreground">
          Ürün varyantları, besin değerleri ve özellikleri Faz 1&apos;de entegre edilecek.
        </p>
      </div>
    </div>
  );
}
