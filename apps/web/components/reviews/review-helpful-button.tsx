'use client';

import React, { useState, useTransition } from 'react';
import { ThumbsUp, Loader2 } from 'lucide-react';
import { markHelpfulAction } from '@/lib/actions/review';

interface ReviewHelpfulButtonProps {
  slug: string;
  reviewId: string;
  initialHelpfulCount: number;
}

export const ReviewHelpfulButton: React.FC<ReviewHelpfulButtonProps> = ({
  slug,
  reviewId,
  initialHelpfulCount,
}) => {
  const [helpfulCount, setHelpfulCount] = useState(initialHelpfulCount);
  const [hasVoted, setHasVoted] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleHelpfulClick = () => {
    if (hasVoted || isPending) return;

    setHasVoted(true);
    setHelpfulCount((prev) => prev + 1);

    startTransition(async () => {
      const result = await markHelpfulAction(slug, reviewId);
      if (!result.success) {
        setHasVoted(false);
        setHelpfulCount((prev) => Math.max(0, prev - 1));
      } else if (result.helpful_count !== undefined) {
        setHelpfulCount(result.helpful_count);
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleHelpfulClick}
      disabled={hasVoted || isPending}
      aria-label={`Bu yorumu faydalı buldum (${helpfulCount} oy)`}
      aria-pressed={hasVoted}
      className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md transition-colors cursor-pointer disabled:cursor-not-allowed ${
        hasVoted
          ? 'bg-primary/10 text-primary border border-primary/20'
          : 'text-muted-foreground hover:text-foreground hover:bg-accent/60'
      }`}
    >
      {isPending ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
      ) : (
        <ThumbsUp
          className={`w-3.5 h-3.5 transition-transform ${
            hasVoted ? 'fill-primary text-primary scale-110' : ''
          }`}
          aria-hidden="true"
        />
      )}
      <span>Faydalı ({helpfulCount})</span>
    </button>
  );
};
