import { z } from 'zod';

export const adminLoginSchema = z.object({
  email: z
    .string()
    .min(1, 'E-posta adresi gereklidir')
    .email('Geçerli bir e-posta adresi giriniz'),
  password: z
    .string()
    .min(6, 'Şifre en az 6 karakter olmalıdır'),
});

export type AdminLoginFormValues = z.infer<typeof adminLoginSchema>;
