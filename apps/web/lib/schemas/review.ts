import { z } from 'zod';

export const createReviewSchema = z.object({
  rating: z
    .number({
      required_error: 'Lütfen bir puan seçiniz.',
      invalid_type_error: 'Puan tam sayı olmalıdır.',
    })
    .int('Puan tam sayı olmalıdır.')
    .min(1, 'Puan en az 1 olmalıdır.')
    .max(5, 'Puan en fazla 5 olabilir.'),
  title: z
    .string({
      required_error: 'Başlık alanı zorunludur.',
    })
    .trim()
    .min(2, 'Başlık en az 2 karakter olmalıdır.')
    .max(150, 'Başlık en fazla 150 karakter olabilir.'),
  text: z
    .string({
      required_error: 'Yorum metni zorunludur.',
    })
    .trim()
    .min(5, 'Yorum en az 5 karakter olmalıdır.')
    .max(2000, 'Yorum en fazla 2000 karakter olabilir.'),
  images: z
    .array(z.string().url('Geçerli bir görsel URL adresi giriniz.'))
    .max(5, 'En fazla 5 görsel eklenebilir.')
    .optional()
    .default([]),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
