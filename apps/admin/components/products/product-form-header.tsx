'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';

interface ProductFormHeaderProps {
  isEditing: boolean;
  isSubmitting: boolean;
}

export function ProductFormHeader({ isEditing, isSubmitting }: ProductFormHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <Button asChild variant="ghost" size="sm" className="gap-1.5 text-xs">
        <Link href="/products">
          <ArrowLeft className="h-4 w-4" />
          <span>Ürün Listesine Dön</span>
        </Link>
      </Button>

      <Button type="submit" size="sm" disabled={isSubmitting} className="gap-1.5">
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Kaydediliyor...</span>
          </>
        ) : (
          <>
            <Save className="h-4 w-4" />
            <span>{isEditing ? 'Değişiklikleri Kaydet' : 'Ürünü Oluştur'}</span>
          </>
        )}
      </Button>
    </div>
  );
}
