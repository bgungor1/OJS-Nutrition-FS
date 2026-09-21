'use client';

import * as React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FaqCategoryBadge } from './faq-category-badge';
import type { FaqItem } from '@/types';

interface FaqListItemProps {
  item: FaqItem;
  onEdit: (item: FaqItem) => void;
  onDelete: (item: FaqItem) => void;
}

export function FaqListItem({ item, onEdit, onDelete }: FaqListItemProps) {
  const order = item.sort_order ?? item.sortOrder ?? item.order ?? 0;

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-xs transition-shadow hover:shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="space-y-2 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <FaqCategoryBadge category={item.category} />
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full font-mono">
              Sıra: #{order}
            </span>
          </div>
          <h3 className="text-base font-semibold text-foreground tracking-tight">
            {item.question}
          </h3>
          <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
            {item.answer}
          </p>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-start shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(item)}
            className="h-8 px-2.5"
            aria-label={`Düzenle: ${item.question}`}
          >
            <Pencil className="h-3.5 w-3.5 mr-1.5" />
            Düzenle
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(item)}
            className="h-8 px-2.5"
            aria-label={`Sil: ${item.question}`}
          >
            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
            Sil
          </Button>
        </div>
      </div>
    </div>
  );
}
