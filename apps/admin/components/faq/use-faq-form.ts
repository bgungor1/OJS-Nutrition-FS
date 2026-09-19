'use client';

import { useState, useEffect } from 'react';
import { faqFormSchema, type FaqFormValues } from '@/lib/schemas/faq';
import type { FaqItem } from '@/types';

interface UseFaqFormProps {
  initialFaq?: FaqItem | null;
  onSubmit: (values: FaqFormValues) => Promise<void>;
  onSuccess?: () => void;
}

export function useFaqForm({ initialFaq, onSubmit, onSuccess }: UseFaqFormProps) {
  const [question, setQuestion] = useState(initialFaq?.question ?? '');
  const [answer, setAnswer] = useState(initialFaq?.answer ?? '');
  const [category, setCategory] = useState<'genel' | 'urunler' | 'kargo'>(
    (initialFaq?.category as 'genel' | 'urunler' | 'kargo') ?? 'genel',
  );
  const [sortOrder, setSortOrder] = useState(
    initialFaq?.sortOrder ?? initialFaq?.sort_order ?? initialFaq?.order ?? 0,
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialFaq) {
      setQuestion(initialFaq.question);
      setAnswer(initialFaq.answer);
      setCategory((initialFaq.category as 'genel' | 'urunler' | 'kargo') ?? 'genel');
      setSortOrder(
        initialFaq.sortOrder ?? initialFaq.sort_order ?? initialFaq.order ?? 0,
      );
    } else {
      setQuestion('');
      setAnswer('');
      setCategory('genel');
      setSortOrder(0);
    }
    setErrors({});
  }, [initialFaq]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const parseResult = faqFormSchema.safeParse({
      question,
      answer,
      category,
      sortOrder,
    });

    if (!parseResult.success) {
      const fieldErrors: Record<string, string> = {};
      parseResult.error.issues.forEach((issue) => {
        const path = issue.path[0];
        if (path) {
          fieldErrors[String(path)] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(parseResult.data);
      onSuccess?.();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Bir hata oluştu';
      setErrors({ form: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    question,
    setQuestion,
    answer,
    setAnswer,
    category,
    setCategory,
    sortOrder,
    setSortOrder,
    errors,
    isSubmitting,
    handleSubmit,
  };
}
