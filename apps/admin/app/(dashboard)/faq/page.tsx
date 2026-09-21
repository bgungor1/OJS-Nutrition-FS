import * as React from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { FaqManager } from '@/components/faq';
import { listFaqs } from '@/lib/api/faq';
import {
  createFaqAction,
  updateFaqAction,
  deleteFaqAction,
} from './actions';
import type { FaqItem } from '@/types';

export const dynamic = 'force-dynamic';

interface FaqPageProps {
  searchParams: Promise<{
    category?: string;
  }>;
}

export default async function FaqPage({ searchParams }: FaqPageProps) {
  const resolvedParams = await searchParams;
  const category = resolvedParams.category;

  let items: FaqItem[] = [];
  let fetchError: string | null = null;

  try {
    items = await listFaqs(category ? { category } : {});
  } catch (err) {
    fetchError =
      err instanceof Error
        ? err.message
        : 'Sıkça sorulan sorular yüklenirken bir sorun oluştu.';
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sıkça Sorulan Sorular (SSS)"
        description="Müşterilerin mağaza, ürünler ve kargo süreçleri hakkında en sık sorduğu soruları ve yanıtlarını yönetin."
      />

      {fetchError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
          {fetchError}
        </div>
      )}

      <FaqManager
        items={items}
        currentCategory={category}
        onCreateAction={async (values) => {
          'use server';
          await createFaqAction(values);
        }}
        onUpdateAction={async (id, values) => {
          'use server';
          await updateFaqAction(id, values);
        }}
        onDeleteAction={async (id) => {
          'use server';
          await deleteFaqAction(id);
        }}
      />
    </div>
  );
}
