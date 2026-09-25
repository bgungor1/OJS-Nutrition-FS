'use client';

import React, { useState, useTransition } from 'react';
import { Star, Loader2, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ReviewImageUploader } from './review-image-uploader';
import { submitReviewAction } from '@/lib/actions/review';
import type { ApiReview } from '@/types';

interface ReviewFormModalProps {
  slug: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newReview: ApiReview) => void;
}

const RATING_LABELS: Record<number, string> = {
  5: 'Harika - Kesinlikle tavsiye ederim',
  4: 'Çok İyi - Beğendim',
  3: 'Orta - İdare eder',
  2: 'Kötü - Beklentimi karşılamadı',
  1: 'Çok Kötü - Memnun kalmadım',
};

export const ReviewFormModal: React.FC<ReviewFormModalProps> = ({ slug, isOpen, onClose, onSuccess }) => {
  const [rating, setRating] = useState<number>(5);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const activeRating = hoveredRating ?? rating;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setGlobalError(null);
    const formData = new FormData();
    formData.set('rating', rating.toString());
    formData.set('title', title);
    formData.set('text', text);
    for (const img of images) {
      if (img.trim()) formData.append('images', img.trim());
    }

    startTransition(async () => {
      const result = await submitReviewAction(slug, null, formData);
      if (!result.success) {
        if (result.fieldErrors) setFieldErrors(result.fieldErrors);
        setGlobalError(result.message);
      } else {
        if (result.review && onSuccess) onSuccess(result.review);
        setTitle('');
        setText('');
        setImages([]);
        setRating(5);
        onClose();
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isPending && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ürünü Değerlendir</DialogTitle>
          <DialogDescription>Deneyiminizi paylaşarak diğer kullanıcılara yardımcı olun.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {globalError && (
            <div role="alert" className="p-3 text-xs rounded-lg bg-destructive/10 text-destructive flex items-center gap-2 border border-destructive/20">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{globalError}</span>
            </div>
          )}

          <div className="space-y-2">
            <Label>Puanınız</Label>
            <div className="flex items-center gap-1.5" role="radiogroup" aria-label="Puan seçimi">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(null)}
                  disabled={isPending}
                  role="radio"
                  aria-checked={rating === star}
                  aria-label={`${star} yıldız`}
                  className="p-1 rounded-md transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                >
                  <Star className={`w-7 h-7 transition-colors ${star <= activeRating ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/30'}`} />
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground font-medium h-4">{RATING_LABELS[activeRating]}</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="review-title">Başlık</Label>
            <Input id="review-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Örn: Lezzet ve çözünürlük başarılı" disabled={isPending} aria-invalid={!!fieldErrors.title} />
            {fieldErrors.title && <p className="text-xs text-destructive">{fieldErrors.title}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="review-text">Yorumunuz</Label>
            <Textarea id="review-text" value={text} onChange={(e) => setText(e.target.value)} placeholder="Ürünün tadı, karışımı, etkisi hakkındaki düşünceleriniz..." rows={4} disabled={isPending} aria-invalid={!!fieldErrors.text} />
            {fieldErrors.text && <p className="text-xs text-destructive">{fieldErrors.text}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="review-image-input">Görsel Ekle (Opsiyonel)</Label>
            <ReviewImageUploader
              slug={slug}
              images={images}
              onChange={setImages}
              disabled={isPending}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>Vazgeç</Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="w-4 h-4 animate-spin mr-1.5" />}
              <span>Değerlendirmeyi Gönder</span>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
