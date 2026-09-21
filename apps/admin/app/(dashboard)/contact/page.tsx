import * as React from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { ContactManager } from '@/components/contact';
import { listContacts } from '@/lib/api/contact';
import { updateContactStatusAction } from './actions';
import type { ContactMessage } from '@/types';

export const dynamic = 'force-dynamic';

interface ContactPageProps {
  searchParams: Promise<{
    handled?: string;
  }>;
}

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const resolvedParams = await searchParams;
  const handledParam = resolvedParams.handled;
  const handledFilter =
    handledParam === 'true' ? true : handledParam === 'false' ? false : undefined;

  let messages: ContactMessage[] = [];
  let fetchError: string | null = null;

  try {
    const response = await listContacts({
      handled: handledFilter,
    });
    messages = response.results || [];
  } catch (err) {
    fetchError =
      err instanceof Error
        ? err.message
        : 'İletişim mesajları yüklenirken bir sorun oluştu.';
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="İletişim Mesajları"
        description="Müşterilerden gelen iletişim ve destek taleplerini görüntüleyin, inceleyin ve durumlarını takip edin."
      />

      {fetchError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
          {fetchError}
        </div>
      )}

      <ContactManager
        messages={messages}
        currentHandled={handledParam || 'all'}
        onToggleStatusAction={async (id, handled) => {
          'use server';
          await updateContactStatusAction(id, handled);
        }}
      />
    </div>
  );
}
