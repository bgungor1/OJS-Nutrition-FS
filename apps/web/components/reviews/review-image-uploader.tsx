'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { Upload, X, Loader2, ImagePlus } from 'lucide-react';
import { getImageUrl } from '@/lib/utils/image';
import { uploadReviewImageAction } from '@/lib/actions/review';

interface ReviewImageUploaderProps {
  slug: string;
  images: string[];
  onChange: (images: string[]) => void;
  disabled?: boolean;
  maxImages?: number;
}

export const ReviewImageUploader: React.FC<ReviewImageUploaderProps> = ({
  slug,
  images,
  onChange,
  disabled = false,
  maxImages = 5,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setError(null);

    const remainingSlots = maxImages - images.length;
    if (remainingSlots <= 0) {
      setError(`En fazla ${maxImages} adet görsel ekleyebilirsiniz.`);
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);

    for (const file of filesToUpload) {
      if (file.type === 'image/svg+xml' || file.name.endsWith('.svg')) {
        setError('Güvenlik gerekçesiyle SVG dosyaları kabul edilmemektedir.');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError('Görsel boyutu en fazla 5MB olabilir.');
        return;
      }
    }

    setIsUploading(true);

    try {
      const newImages = [...images];

      for (const file of filesToUpload) {
        const formData = new FormData();
        formData.append('file', file);

        const result = await uploadReviewImageAction(slug, formData);
        if (!result.success || (!result.url && !result.photo_src)) {
          throw new Error(result.error || 'Görsel yüklenirken bir sorun oluştu.');
        }

        const uploadedUrl = result.url || result.photo_src!;
        newImages.push(uploadedUrl);
      }

      onChange(newImages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Görsel yüklenirken hata oluştu.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = (indexToRemove: number) => {
    onChange(images.filter((_, idx) => idx !== indexToRemove));
    setError(null);
  };

  const canUploadMore = images.length < maxImages;

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || isUploading || !canUploadMore}
        data-testid="review-image-file-input"
        id="review-image-input"
      />

      {images.length > 0 && (
        <div className="flex flex-wrap gap-2.5">
          {images.map((imgUrl, index) => (
            <div
              key={`${imgUrl}-${index}`}
              className="relative group w-18 h-18 rounded-lg overflow-hidden border border-border bg-muted/40 shrink-0"
            >
              <Image
                src={getImageUrl(imgUrl)}
                alt={`Yüklenen görsel ${index + 1}`}
                fill
                sizes="72px"
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemove(index)}
                disabled={disabled || isUploading}
                aria-label={`Görseli kaldır ${index + 1}`}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 hover:bg-destructive text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}

          {canUploadMore && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || isUploading}
              aria-label="Daha fazla görsel ekle"
              className="w-18 h-18 rounded-lg border-2 border-dashed border-border/70 hover:border-primary/50 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer bg-card hover:bg-muted/30 shrink-0 disabled:opacity-50"
            >
              <ImagePlus className="w-4 h-4" />
              <span className="text-[10px] font-medium">Ekle</span>
            </button>
          )}
        </div>
      )}

      {images.length === 0 && (
        <div
          onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
          className="cursor-pointer flex flex-col items-center justify-center border-2 border-dashed border-border/70 hover:border-primary/50 rounded-lg p-4 text-center transition-colors bg-card hover:bg-muted/20"
        >
          {isUploading ? (
            <div className="flex flex-col items-center py-1">
              <Loader2 className="h-6 w-6 animate-spin text-primary mb-1.5" />
              <p className="text-xs font-medium">Görsel Yükleniyor...</p>
            </div>
          ) : (
            <>
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center mb-1.5">
                <Upload className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-xs font-medium text-foreground">Görsel Seçin veya Sürükleyin</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                JPEG, PNG, WEBP (Maksimum 5MB, en fazla {maxImages} adet)
              </p>
            </>
          )}
        </div>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
};
