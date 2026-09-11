import type { Metadata } from 'next';

type CategoryPageProps = {
  params: Promise<{
    category: string;
  }>;
};

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const formattedTitle = category.charAt(0).toUpperCase() + category.slice(1);
  return {
    title: `${formattedTitle} Ürünleri`,
    description: `OJS Nutrition ${formattedTitle} kategorisindeki en kaliteli ürünler.`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;

  return (
    <div className="container mx-auto px-4 sm:px-6 py-10">
      <div className="space-y-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight capitalize">{category} Ürünleri</h1>
        <p className="text-sm text-muted-foreground">
          {category} kategorisindeki tüm seçenekleri inceleyin.
        </p>
      </div>
    </div>
  );
}
