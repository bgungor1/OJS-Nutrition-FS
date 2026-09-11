import { z } from 'zod';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'E-posta adresi zorunludur.')
    .email('Geçerli bir e-posta adresi giriniz.'),
  password: z
    .string()
    .min(1, 'Şifre alanı zorunludur.'),
});

export const registerSchema = z
  .object({
    first_name: z
      .string()
      .trim()
      .min(2, 'Ad en az 2 karakter olmalıdır.')
      .max(50, 'Ad en fazla 50 karakter olabilir.'),
    last_name: z
      .string()
      .trim()
      .min(2, 'Soyad en az 2 karakter olmalıdır.')
      .max(50, 'Soyad en fazla 50 karakter olabilir.'),
    email: z
      .string()
      .trim()
      .min(1, 'E-posta adresi zorunludur.')
      .email('Geçerli bir e-posta adresi giriniz.'),
    password: z
      .string()
      .min(8, 'Şifre en az 8 karakter olmalıdır.')
      .regex(
        PASSWORD_REGEX,
        'Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermelidir.',
      ),
    password2: z
      .string()
      .min(1, 'Şifre tekrarı zorunludur.'),
  })
  .refine((data) => data.password === data.password2, {
    message: 'Şifreler eşleşmiyor.',
    path: ['password2'],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
