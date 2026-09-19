'use client';

import * as React from 'react';
import { uploadMediaAction } from '@/app/(dashboard)/products/actions';
import { Button } from '@/components/ui/button';
import { Upload, X, Loader2 } from 'lucide-react';

export interface MediaUploaderProps {
  value?: string;
  onChange: (photoSrc: string) => void;
  disabled?: boolean;
}

export function MediaUploader({ value, onChange, disabled = false }: MediaUploaderProps) {
  const [isUploading, setIsUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    if (file.type === 'image/svg+xml' || file.name.endsWith('.svg')) {
      setError('Güvenlik gerekçesiyle SVG dosyaları kabul edilmemektedir.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Dosya boyutu en fazla 5MB olabilir.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setIsUploading(true);
      const res = await uploadMediaAction(formData);
      onChange(res.photo_src);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Görsel yüklenirken hata oluştu.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || isUploading}
        data-testid="media-file-input"
      />

      {value ? (
        <div className="relative group rounded-lg border border-border/60 overflow-hidden w-36 h-36 bg-muted/40 flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value.startsWith('http') ? value : `/${value}`}
            alt="Varyant Görseli"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="h-7 text-[11px]"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || isUploading}
            >
              Değiştir
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => onChange('')}
              disabled={disabled || isUploading}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
          className="cursor-pointer flex flex-col items-center justify-center border-2 border-dashed border-border/70 hover:border-primary/50 rounded-lg p-6 text-center transition-colors bg-card hover:bg-muted/20"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-7 w-7 animate-spin text-primary mb-2" />
              <p className="text-xs font-medium">Görsel Yükleniyor...</p>
            </>
          ) : (
            <>
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mb-2">
                <Upload className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-xs font-medium text-foreground">Görsel Seçin veya Sürükleyin</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">JPEG, PNG, WEBP (Maksimum 5MB)</p>
            </>
          )}
        </div>
      )}

      {error && <p className="text-[11px] text-destructive">{error}</p>}
    </div>
  );
}
