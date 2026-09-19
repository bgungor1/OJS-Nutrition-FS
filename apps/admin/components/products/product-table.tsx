'use client';

import * as React from 'react';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ProductDeleteDialog } from './product-delete-dialog';
import { ProductTableRow } from './product-table-row';
import { ProductTableEmpty } from './product-table-empty';
import type { ApiProduct } from '@/types';

export interface ProductTableProps {
  products: ApiProduct[];
  onDelete?: (id: string) => Promise<void>;
}

export function ProductTable({ products, onDelete }: ProductTableProps) {
  const [productToDelete, setProductToDelete] = React.useState<ApiProduct | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleConfirmDelete = async () => {
    if (!productToDelete || !onDelete) return;
    try {
      setIsDeleting(true);
      await onDelete(productToDelete.id);
      setProductToDelete(null);
    } catch {
      // Handled by caller or toast
    } finally {
      setIsDeleting(false);
    }
  };

  if (products.length === 0) {
    return <ProductTableEmpty />;
  }

  return (
    <>
      <div className="rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 text-xs">Görsel</TableHead>
              <TableHead className="text-xs">Ürün Adı</TableHead>
              <TableHead className="text-xs">Slug</TableHead>
              <TableHead className="text-xs">Fiyat Aralığı</TableHead>
              <TableHead className="text-xs">Değerlendirme</TableHead>
              <TableHead className="text-xs text-right">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <ProductTableRow
                key={product.id}
                product={product}
                onDelete={onDelete ? (p) => setProductToDelete(p) : undefined}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      <ProductDeleteDialog
        product={productToDelete}
        isDeleting={isDeleting}
        onClose={() => setProductToDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
