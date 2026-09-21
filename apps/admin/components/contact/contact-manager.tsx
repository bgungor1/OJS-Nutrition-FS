'use client';

import * as React from 'react';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Inbox } from 'lucide-react';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ContactMessageRow } from './contact-message-row';
import { ContactMessageDetail } from './contact-message-detail';
import type { ContactMessage } from '@/types';

interface ContactManagerProps {
  messages: ContactMessage[];
  currentHandled?: string;
  onToggleStatusAction: (id: string, handled: boolean) => Promise<void>;
}

const FILTER_TABS = [
  { id: 'all', label: 'Tüm Mesajlar' },
  { id: 'false', label: 'Bekleyenler' },
  { id: 'true', label: 'İncelenenler' },
];

export function ContactManager({
  messages,
  currentHandled = 'all',
  onToggleStatusAction,
}: ContactManagerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeMessage, setActiveMessage] = useState<ContactMessage | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleFilterChange = (handled: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (handled === 'all') {
      params.delete('handled');
    } else {
      params.set('handled', handled);
    }
    router.push(`/contact?${params.toString()}`);
  };

  const handleToggleStatus = async (id: string, handled: boolean) => {
    try {
      setIsUpdating(true);
      await onToggleStatusAction(id, handled);
      if (activeMessage && activeMessage.id === id) {
        setActiveMessage({ ...activeMessage, handled });
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const pendingCount = messages.filter((m) => !m.handled).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {FILTER_TABS.map((tab) => (
            <Button
              key={tab.id}
              type="button"
              variant={currentHandled === tab.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleFilterChange(tab.id)}
            >
              {tab.label}
              {tab.id === 'false' && pendingCount > 0 && (
                <span className="ml-1.5 rounded-full bg-warning px-1.5 py-0.2 text-[11px] font-bold text-warning-foreground">
                  {pendingCount}
                </span>
              )}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Mail className="h-4 w-4" />
          <span>Toplam {messages.length} mesaj listeleniyor</span>
        </div>
      </div>

      {messages.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <Inbox className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-60" />
          <h4 className="text-base font-medium text-foreground">Mesaj bulunamadı</h4>
          <p className="text-sm text-muted-foreground mt-1">
            Bu filtreleme kriterine uyan herhangi bir iletişim mesajı bulunmuyor.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/4">Gönderen</TableHead>
                <TableHead className="w-2/5">Mesaj Özeti</TableHead>
                <TableHead>Tarih</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead className="text-right">İşlem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {messages.map((message) => (
                <ContactMessageRow
                  key={message.id}
                  message={message}
                  onView={setActiveMessage}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <ContactMessageDetail
        message={activeMessage}
        isUpdating={isUpdating}
        onClose={() => setActiveMessage(null)}
        onToggleStatus={handleToggleStatus}
      />
    </div>
  );
}
