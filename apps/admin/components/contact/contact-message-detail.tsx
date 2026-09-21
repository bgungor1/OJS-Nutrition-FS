'use client';

import * as React from 'react';
import { Mail, CheckCircle2, Clock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ContactStatusBadge } from './contact-status-badge';
import { formatDateTime } from '@/lib/utils';
import type { ContactMessage } from '@/types';

interface ContactMessageDetailProps {
  message: ContactMessage | null;
  isUpdating: boolean;
  onClose: () => void;
  onToggleStatus: (id: string, handled: boolean) => Promise<void>;
}

export function ContactMessageDetail({
  message,
  isUpdating,
  onClose,
  onToggleStatus,
}: ContactMessageDetailProps) {
  if (!message) return null;

  const dateStr = message.created_at || message.createdAt || '';

  return (
    <Dialog open={Boolean(message)} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center justify-between pr-6">
            <DialogTitle className="text-lg font-bold">Mesaj Detayı</DialogTitle>
            <ContactStatusBadge handled={message.handled} />
          </div>
          <DialogDescription className="sr-only">
            Müşteri tarafından gönderilen iletişim mesajının ayrıntıları.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="rounded-lg bg-muted/50 p-3.5 space-y-1.5 text-sm">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground">{message.name}</span>
              <span className="text-xs text-muted-foreground">
                {dateStr ? formatDateTime(dateStr) : '-'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Mail className="h-3.5 w-3.5" />
              <a
                href={`mailto:${message.email}`}
                className="hover:underline text-primary"
              >
                {message.email}
              </a>
            </div>
            {message.subject && (
              <div className="text-xs font-medium text-foreground pt-1 border-t border-border/50">
                Konu: {message.subject}
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Mesaj İçeriği:
            </span>
            <div className="rounded-lg border border-border bg-background p-4 text-sm leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
              {message.message}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant={message.handled ? 'outline' : 'default'}
            disabled={isUpdating}
            onClick={() => onToggleStatus(message.id, !message.handled)}
            className="sm:mr-auto"
          >
            {message.handled ? (
              <>
                <Clock className="h-4 w-4 mr-1.5 text-warning" />
                Bekliyor Olarak İşaretle
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-1.5 text-success" />
                İncelendi Olarak İşaretle
              </>
            )}
          </Button>

          <Button type="button" variant="outline" onClick={onClose}>
            Kapat
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
