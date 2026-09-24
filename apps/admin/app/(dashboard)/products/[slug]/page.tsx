import * as React from 'react';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProductForm, VariantManager } from '@/components/products';
import { getProductBySlug, listCategories } from '@/lib/api/products';
import { ApiError } from '@/lib/api-client';
import { updateProductAction } from '../actions';
import type { UpdateProductInput } from '@/types';
import { ExternalLink } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;

  let product = null;
  let categories = [];

  try {
    const [prod, cats] = await Promise.all([
      getProductBySlug(slug),
      listCategories(),
    ]);
    product = prod;
    categories = cats;
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      notFound();
    }
    throw err;
  }

  if (!product) {
    notFound();
  }

  const handleUpdate = async (values: UpdateProductInput) => {
    'use server';
    const updated = await updateProductAction(product.id, values);
    if (updated.slug !== product.slug) {
      redirect(`/products/${updated.slug}`);
    }
  };

  const storefrontUrl = process.env.NEXT_PUBLIC_STOREFRONT_URL || 'http://localhost:3001';

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-5">
        <div>
          <div className="flex items-center gap-2">
            <PageHeader
              title={product.name}
              description={`Ürün ID: ${product.id}`}
            />
            <Badge variant="outline" className="font-mono text-xs">
              /{product.slug}
            </Badge>
          </div>
        </div>

        <Button asChild variant="outline" size="sm" className="gap-1.5 shrink-0 self-start sm:self-auto">
          <Link
            href={`${storefrontUrl}/products/${product.slug}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>Mağazada Görüntüle</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Ürün Bilgilerini Güncelle</h2>
        <ProductForm
          initialData={product}
          categories={categories}
          onSubmit={handleUpdate}
        />
      </div>

      <div className="pt-4 border-t">
        <VariantManager
          productId={product.id}
          initialVariants={product.variants}
        />
      </div>
    </div>
  );
}
