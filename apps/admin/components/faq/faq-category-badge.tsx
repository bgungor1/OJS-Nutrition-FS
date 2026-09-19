import { Badge } from '@/components/ui';

interface FaqCategoryBadgeProps {
  category: string;
}

const CATEGORY_MAP: Record<string, { label: string; variant: 'default' | 'info' | 'warning' | 'secondary' }> = {
  genel: { label: 'Genel', variant: 'secondary' },
  urunler: { label: 'Ürünler', variant: 'info' },
  kargo: { label: 'Kargo & Teslimat', variant: 'warning' },
};

export function FaqCategoryBadge({ category }: FaqCategoryBadgeProps) {
  const meta = CATEGORY_MAP[category] ?? {
    label: category,
    variant: 'secondary',
  };

  return <Badge variant={meta.variant}>{meta.label}</Badge>;
}
