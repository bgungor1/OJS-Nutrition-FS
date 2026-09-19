'use client';

import * as React from 'react';
import { VariantList } from './variant-list';
import { VariantModal } from './variant-modal';
import {
  createVariantAction,
  updateVariantAction,
  deleteVariantAction,
} from '@/app/(dashboard)/products/actions';
import type { ApiProductVariant, CreateVariantInput } from '@/types';

export interface VariantManagerProps {
  productId: string;
  initialVariants: ApiProductVariant[];
}

export function VariantManager({
  productId,
  initialVariants,
}: VariantManagerProps) {
  const [variants, setVariants] = React.useState<ApiProductVariant[]>(initialVariants);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editingVariant, setEditingVariant] = React.useState<ApiProductVariant | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    setVariants(initialVariants);
  }, [initialVariants]);

  const handleAdd = () => {
    setEditingVariant(null);
    setModalOpen(true);
  };

  const handleEdit = (v: ApiProductVariant) => {
    setEditingVariant(v);
    setModalOpen(true);
  };

  const handleSubmit = async (values: CreateVariantInput) => {
    try {
      setIsSubmitting(true);
      if (editingVariant) {
        const updatedProduct = await updateVariantAction(
          productId,
          editingVariant.id,
          values,
        );
        setVariants(updatedProduct.variants);
      } else {
        const updatedProduct = await createVariantAction(productId, values);
        setVariants(updatedProduct.variants);
      }
      setModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (variantId: string) => {
    await deleteVariantAction(productId, variantId);
    setVariants((prev) => prev.filter((v) => v.id !== variantId));
  };

  return (
    <div className="space-y-4">
      <VariantList
        variants={variants}
        onAddVariant={handleAdd}
        onEditVariant={handleEdit}
        onDeleteVariant={handleDelete}
      />

      <VariantModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        initialData={editingVariant}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
