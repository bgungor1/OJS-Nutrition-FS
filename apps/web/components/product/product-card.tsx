import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getImageUrl } from '@/lib/utils/image';

export interface ProductCardProps {
  slug: string;
  name: string;
  photoSrc?: string | null;
  shortExplanation?: string;
  reviewCount?: number;
  averageStar?: number;
  price: number;
  originalPrice?: number | null;
  discountPercentage?: number | null;
  priority?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  slug,
  name,
  photoSrc,
  shortExplanation,
  reviewCount = 0,
  averageStar = 0,
  price,
  originalPrice,
  discountPercentage,
  priority = false,
}) => {
  const imageUrl = getImageUrl(photoSrc);
  const roundedRating = Math.round(averageStar);

  return (
    <div className="group relative flex flex-col h-full rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:shadow-md hover:border-primary/40">
      {Boolean(discountPercentage && discountPercentage > 0) && (
        <Badge
          variant="destructive"
          className="absolute -top-2 -right-2 z-10 font-bold text-xs uppercase shadow-sm"
        >
          %{discountPercentage} İndirim
        </Badge>
      )}

      <Link
        href={`/product/${slug}`}
        className="relative mb-3 flex h-40 w-full items-center justify-center overflow-hidden rounded-lg bg-muted/30"
      >
        <Image
          src={imageUrl}
          alt={`${name} görseli`}
          width={220}
          height={220}
          priority={priority}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 220px"
          className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
        />
      </Link>

      <Link href={`/product/${slug}`} className="mb-1 block">
        <h3 className="line-clamp-2 text-sm sm:text-base font-semibold text-foreground tracking-tight hover:text-primary transition-colors">
          {name}
        </h3>
      </Link>

      {shortExplanation && (
        <p className="mb-2 line-clamp-1 text-xs text-muted-foreground">
          {shortExplanation}
        </p>
      )}

      <div className="mb-3 flex items-center gap-1">
        <div className="flex text-amber-500">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-3.5 w-3.5 ${i < roundedRating
                ? 'fill-amber-400 text-amber-500'
                : 'text-muted-foreground/30'
                }`}
            />
          ))}
        </div>
        <span className="text-xs text-muted-foreground ml-1">
          ({reviewCount.toLocaleString('tr-TR')})
        </span>
      </div>

      <div className="mt-auto flex items-end justify-between pt-2 border-t border-border/50">
        <div>
          {originalPrice && originalPrice > price && (
            <span className="block text-xs text-muted-foreground line-through">
              {originalPrice.toLocaleString('tr-TR')} TL
            </span>
          )}
          <span className="text-base font-bold text-primary">
            {price.toLocaleString('tr-TR')} TL
          </span>
        </div>

        <Button
          size="sm"
          variant="secondary"
          className="h-8 w-8 p-0 rounded-full hover:bg-primary hover:text-primary-foreground transition-colors"
          asChild
        >
          <Link href={`/product/${slug}`} aria-label={`${name} detayına git`}>
            <ShoppingCart className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;
