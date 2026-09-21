'use client';

import * as React from 'react';
import { Eye } from 'lucide-react';
import { TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ContactStatusBadge } from './contact-status-badge';
import { formatDate } from '@/lib/utils';
import type { ContactMessage } from '@/types';

interface ContactMessageRowProps {
  message: ContactMessage;
  onView: (message: ContactMessage) => void;
}

export function ContactMessageRow({ message, onView }: ContactMessageRowProps) {
  const dateStr = message.created_at || message.createdAt || '';

  return (
    <TableRow className={message.handled ? 'opacity-85' : 'bg-primary/5 font-medium'}>
      <TableCell className="py-3.5">
        <div className="flex flex-col">
          <span className="font-semibold text-foreground text-sm">{message.name}</span>
          <span className="text-xs text-muted-foreground">{message.email}</span>
        </div>
      </TableCell>

      <TableCell className="max-w-xs truncate text-muted-foreground text-sm py-3.5">
        {message.subject ? (
          <span className="font-medium text-foreground mr-1">[{message.subject}]</span>
        ) : null}
        {message.message}
      </TableCell>

      <TableCell className="text-xs text-muted-foreground whitespace-nowrap py-3.5">
        {dateStr ? formatDate(dateStr) : '-'}
      </TableCell>

      <TableCell className="py-3.5">
        <ContactStatusBadge handled={message.handled} />
      </TableCell>

      <TableCell className="text-right py-3.5">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onView(message)}
          className="h-8 px-2.5"
          aria-label={`Görüntüle: ${message.name}`}
        >
          <Eye className="h-4 w-4 mr-1" />
          Görüntüle
        </Button>
      </TableCell>
    </TableRow>
  );
}
