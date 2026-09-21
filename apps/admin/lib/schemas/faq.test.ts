import { describe, it, expect } from 'vitest';
import { faqFormSchema } from './faq';

describe('faqFormSchema', () => {
  it('validates a correct FAQ payload', () => {
    const valid = {
      question: 'Siparişler ne zaman kargolanır?',
      answer: 'Hafta içi saat 16:00ya kadar verilen siparişler aynı gün kargoya verilir.',
      category: 'kargo',
      sortOrder: 1,
    };

    const result = faqFormSchema.safeParse(valid);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.question).toBe(valid.question);
      expect(result.data.category).toBe('kargo');
      expect(result.data.sortOrder).toBe(1);
    }
  });

  it('fails when question is shorter than 5 characters', () => {
    const invalid = {
      question: 'Soru',
      answer: 'Hafta içi saat 16:00ya kadar verilen siparişler kargolanır.',
      category: 'kargo',
      sortOrder: 0,
    };

    const result = faqFormSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('fails when answer is shorter than 10 characters', () => {
    const invalid = {
      question: 'Kargo süresi nedir?',
      answer: 'Kısa',
      category: 'kargo',
      sortOrder: 0,
    };

    const result = faqFormSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('fails with invalid category', () => {
    const invalid = {
      question: 'Kargo süresi nedir?',
      answer: 'Hafta içi saat 16:00ya kadar verilen siparişler kargolanır.',
      category: 'bilinmeyen',
      sortOrder: 0,
    };

    const result = faqFormSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('defaults sortOrder to 0 when omitted', () => {
    const validWithoutOrder = {
      question: 'Genel bir soru başlığı burada?',
      answer: 'Bu genel sorunun detaylı yanıtıdır.',
      category: 'genel',
    };

    const result = faqFormSchema.safeParse(validWithoutOrder);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.sortOrder).toBe(0);
    }
  });
});
