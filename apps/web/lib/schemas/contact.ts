import { z } from 'zod';

export const contactSchema = z.object({
  name: z
    .string({
      required_error: 'İsim alanı boş bırakılamaz.',
    })
    .trim()
    .min(2, 'İsim en az 2 karakter olmalıdır.')
    .max(100, 'İsim en fazla 100 karakter olabilir.'),
  email: z
    .string({
      required_error: 'E-posta alanı boş bırakılamaz.',
    })
    .trim()
    .email('Geçerli bir e-posta adresi giriniz.')
    .max(255, 'E-posta en fazla 255 karakter olabilir.'),
  message: z
    .string({
      required_error: 'Mesaj alanı boş bırakılamaz.',
    })
    .trim()
    .min(10, 'Mesaj en az 10 karakter olmalıdır.')
    .max(3000, 'Mesaj en fazla 3000 karakter olabilir.'),
});

export type ContactInput = z.infer<typeof contactSchema>;
