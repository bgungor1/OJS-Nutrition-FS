import { z } from 'zod';

export const FAQ_CATEGORIES = ['genel', 'urunler', 'kargo'] as const;

export const faqFormSchema = z.object({
  question: z
    .string()
    .trim()
    .min(5, 'Soru en az 5 karakter olmalıdır.')
    .max(255, 'Soru en fazla 255 karakter olabilir.'),
  answer: z
    .string()
    .trim()
    .min(10, 'Yanıt en az 10 karakter olmalıdır.')
    .max(2000, 'Yanıt en fazla 2000 karakter olabilir.'),
  category: z.enum(FAQ_CATEGORIES, {
    message: 'Lütfen geçerli bir kategori seçiniz.',
  }),
  sortOrder: z.coerce
    .number({ message: 'Sıralama bir sayı olmalıdır.' })
    .int('Sıralama tam sayı olmalıdır.')
    .min(0, 'Sıralama 0 veya daha büyük olmalıdır.')
    .default(0),
});

export type FaqFormValues = z.infer<typeof faqFormSchema>;
