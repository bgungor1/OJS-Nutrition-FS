import React from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { getImageUrl } from '@/lib/utils/image';

interface ProductGalleryProps {
  photoSrc?: string | null;
  name: string;
  discountPercentage?: number | null;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({
  photoSrc,
  name,
  discountPercentage,
}) => {
  const imageUrl = getImageUrl(photoSrc);

  return (
    <div className="relative w-full rounded-2xl border border-border bg-card p-6 sm:p-8 flex items-center justify-center overflow-hidden shadow-xs">
      {Boolean(discountPercentage && discountPercentage > 0) && (
        <Badge
          variant="destructive"
          className="absolute top-4 right-4 z-10 text-xs font-bold uppercase shadow-sm"
        >
          %{discountPercentage} İndirim
        </Badge>
      )}

      <div className="relative h-[300px] sm:h-[400px] w-full max-w-[400px] flex items-center justify-center">
        <Image
          src={imageUrl}
          alt={`${name} görseli`}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 500px"
          className="object-contain transition-transform duration-300 hover:scale-105"
        />
      </div>
    </div>
  );
};

export default ProductGallery;
