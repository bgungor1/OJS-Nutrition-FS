'use client';

import * as React from 'react';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FaqListItem } from './faq-list-item';
import { FaqFormModal } from './faq-form-modal';
import { FaqDeleteDialog } from './faq-delete-dialog';
import type { FaqItem } from '@/types';
import type { FaqFormValues } from '@/lib/schemas/faq';

interface FaqManagerProps {
  items: FaqItem[];
  currentCategory?: string;
  onCreateAction: (values: FaqFormValues) => Promise<void>;
  onUpdateAction: (id: string, values: FaqFormValues) => Promise<void>;
  onDeleteAction: (id: string) => Promise<void>;
}

const CATEGORIES = [
  { id: '', label: 'Tümü' },
  { id: 'genel', label: 'Genel' },
  { id: 'urunler', label: 'Ürünler' },
  { id: 'kargo', label: 'Kargo & Teslimat' },
];

export function FaqManager({
  items,
  currentCategory = '',
  onCreateAction,
  onUpdateAction,
  onDeleteAction,
}: FaqManagerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FaqItem | null>(null);
  const [deletingFaq, setDeletingFaq] = useState<FaqItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCategoryChange = (category: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (category) {
      params.set('category', category);
    } else {
      params.delete('category');
    }
    router.push(`/faq?${params.toString()}`);
  };

  const handleOpenCreate = () => {
    setEditingFaq(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (faq: FaqItem) => {
    setEditingFaq(faq);
    setModalOpen(true);
  };

  const handleFormSubmit = async (values: FaqFormValues) => {
    if (editingFaq) {
      await onUpdateAction(editingFaq.id, values);
    } else {
      await onCreateAction(values);
    }
    setModalOpen(false);
    setEditingFaq(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingFaq) return;
    try {
      setIsDeleting(true);
      await onDeleteAction(deletingFaq.id);
      setDeletingFaq(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <Button
              key={cat.id}
              type="button"
              variant={currentCategory === cat.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleCategoryChange(cat.id)}
            >
              {cat.label}
            </Button>
          ))}
        </div>

        <Button onClick={handleOpenCreate} size="sm" className="shrink-0">
          <Plus className="h-4 w-4 mr-1.5" />
          Yeni SSS Ekle
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <HelpCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-60" />
          <h4 className="text-base font-medium text-foreground">Henüz SSS eklenmemiş</h4>
          <p className="text-sm text-muted-foreground mt-1">
            Bu kategoride veya genel listede henüz kayıtlı bir sıkça sorulan soru bulunmuyor.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {items.map((item) => (
            <FaqListItem
              key={item.id}
              item={item}
              onEdit={handleOpenEdit}
              onDelete={setDeletingFaq}
            />
          ))}
        </div>
      )}

      <FaqFormModal
        open={modalOpen}
        faq={editingFaq}
        onClose={() => {
          setModalOpen(false);
          setEditingFaq(null);
        }}
        onSubmit={handleFormSubmit}
      />

      <FaqDeleteDialog
        faq={deletingFaq}
        isDeleting={isDeleting}
        onClose={() => setDeletingFaq(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
