'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { VariantDeleteDialog } from './variant-delete-dialog';
import { VariantListRow } from './variant-list-row';
import type { ApiProductVariant } from '@/types';
import { Plus, Layers } from 'lucide-react';

export interface VariantListProps {
  variants: ApiProductVariant[];
  onAddVariant: () => void;
  onEditVariant: (variant: ApiProductVariant) => void;
  onDeleteVariant: (variantId: string) => Promise<void>;
}

export function VariantList({
  variants,
  onAddVariant,
  onEditVariant,
  onDeleteVariant,
}: VariantListProps) {
  const [variantToDelete, setVariantToDelete] = React.useState<ApiProductVariant | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleConfirmDelete = async () => {
    if (!variantToDelete) return;
    try {
      setIsDeleting(true);
      await onDeleteVariant(variantToDelete.id);
      setVariantToDelete(null);
    } catch {
      // Handled by parent or toast
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base">Ürün Varyantları</CardTitle>
            <CardDescription className="text-xs">
              Bu ürüne ait aroma, gramaj, paket seçenekleri ve stok durumları
            </CardDescription>
          </div>
          <Button type="button" size="sm" onClick={onAddVariant} className="gap-1 text-xs">
            <Plus className="h-4 w-4" />
            <span>Varyant Ekle</span>
          </Button>
        </CardHeader>

        <CardContent>
          {variants.length === 0 ? (
            <div
              data-testid="variant-list-empty"
              className="flex flex-col items-center justify-center py-10 text-center border border-dashed rounded-lg"
            >
              <Layers className="h-8 w-8 text-muted-foreground/60 mb-2" />
              <p className="text-sm font-medium text-foreground">Henüz Varyant Eklenmedi</p>
              <p className="text-xs text-muted-foreground mt-0.5 max-w-xs">
                Müşterilerin bu ürünü satın alabilmesi için en az bir varyant (aroma ve gramaj) eklenmelidir.
              </p>
              <Button type="button" variant="outline" size="sm" onClick={onAddVariant} className="mt-3 text-xs">
                İlk Varyantı Ekle
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12 text-xs">Görsel</TableHead>
                    <TableHead className="text-xs">Aroma</TableHead>
                    <TableHead className="text-xs">Gramaj / Servis</TableHead>
                    <TableHead className="text-xs">Fiyat</TableHead>
                    <TableHead className="text-xs">Durum</TableHead>
                    <TableHead className="text-xs text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {variants.map((v) => (
                    <VariantListRow
                      key={v.id}
                      variant={v}
                      onEdit={onEditVariant}
                      onDelete={(variant) => setVariantToDelete(variant)}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <VariantDeleteDialog
        variant={variantToDelete}
        isDeleting={isDeleting}
        onClose={() => setVariantToDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
