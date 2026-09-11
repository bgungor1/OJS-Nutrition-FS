import React from 'react';
import Link from 'next/link';
import { Star, ChevronRight, ShieldCheck, Leaf } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ProductInfoProps {
  name: string;
  shortExplanation: string;
  averageStar: number;
  commentCount: number;
  tags?: string[];
  categorySlug?: string;
  categoryName?: string;
}

export const ProductInfo: React.FC<ProductInfoProps> = ({
  name,
  shortExplanation,
  averageStar,
  commentCount,
  tags = [],
  categorySlug = 'protein',
  categoryName = 'Protein',
}) => {
  const roundedRating = Math.round(averageStar);

  return (
    <div className="space-y-3">
      <nav aria-label="Breadcrumb" className="flex items-center text-xs text-muted-foreground">
        <Link href="/" className="hover:text-primary transition-colors">
          Ana Sayfa
        </Link>
        <ChevronRight className="h-3 w-3 mx-1 text-muted-foreground/60" />
        <Link href="/products" className="hover:text-primary transition-colors">
          Ürünler
        </Link>
        <ChevronRight className="h-3 w-3 mx-1 text-muted-foreground/60" />
        <Link href={`/products/${categorySlug}`} className="hover:text-primary transition-colors capitalize">
          {categoryName}
        </Link>
        <ChevronRight className="h-3 w-3 mx-1 text-muted-foreground/60" />
        <span className="text-foreground font-medium line-clamp-1">{name}</span>
      </nav>

      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          {name}
        </h1>
        {shortExplanation && (
          <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {shortExplanation}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 pt-1 border-b border-border/60 pb-3">
        <div className="flex text-amber-500">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${
                i < roundedRating ? 'fill-amber-400 text-amber-500' : 'text-muted-foreground/30'
              }`}
            />
          ))}
        </div>
        <span className="text-xs font-semibold text-foreground">
          {averageStar > 0 ? averageStar.toFixed(1) : '5.0'}
        </span>
        <span className="text-xs text-muted-foreground">
          ({commentCount.toLocaleString('tr-TR')} Değerlendirme)
        </span>
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-[10px] font-medium uppercase py-0.5 px-2">
              {tag.includes('VEJETARYEN') && <Leaf className="h-3 w-3 mr-1 text-green-600" />}
              {tag.includes('ORİJİNAL') && <ShieldCheck className="h-3 w-3 mr-1 text-primary" />}
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductInfo;
