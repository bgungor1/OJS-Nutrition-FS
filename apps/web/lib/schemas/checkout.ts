import { z } from 'zod';
import { validateLuhn, isCardExpired } from '@/lib/utils/card';

export const CARD_HOLDER_REGEX = /^[a-zA-ZğüşıöçĞÜŞİÖÇ\s.]+$/;

export const checkoutPaymentSchema = z
  .object({
    address_id: z
      .string({ required_error: 'Lütfen bir teslimat adresi seçiniz.' })
      .uuid('Lütfen geçerli bir teslimat adresi seçiniz.'),
    payment_type: z.enum(['credit_card', 'debit_card'], {
      errorMap: () => ({
        message: "Ödeme yöntemi 'credit_card' veya 'debit_card' olmalıdır.",
      }),
    }).default('credit_card'),
    card_holder: z
      .string({ required_error: 'Kart üzerindeki isim zorunludur.' })
      .trim()
      .min(3, 'Kart üzerindeki ad en az 3 karakter olmalıdır.')
      .max(60, 'Kart üzerindeki ad en fazla 60 karakter olabilir.')
      .regex(CARD_HOLDER_REGEX, 'Kart sahibi adı sadece harflerden oluşmalıdır.'),
    card_holder_first_name: z.string().trim().optional(),
    card_holder_last_name: z.string().trim().optional(),
    card_number: z
      .string({ required_error: 'Kart numarası zorunludur.' })
      .trim()
      .refine((val) => /^\d{15,16}$/.test(val.replace(/\s+/g, '')), {
        message: 'Kart numarası 15 veya 16 haneli olmalıdır.',
      })
      .refine((val) => validateLuhn(val.replace(/\s+/g, '')), {
        message: 'Geçersiz kart numarası. Lütfen kontrol ediniz.',
      }),
    expire_month: z
      .string({ required_error: 'Son kullanma ayı zorunludur.' })
      .trim()
      .regex(/^(0[1-9]|1[0-2])$/, 'Ay 01 ile 12 arasında olmalıdır.'),
    expire_year: z
      .string({ required_error: 'Son kullanma yılı zorunludur.' })
      .trim()
      .regex(/^(\d{2}|\d{4})$/, 'Yıl 2 veya 4 haneli olmalıdır.'),
    cvv: z
      .string({ required_error: 'Güvenlik kodu (CVV) zorunludur.' })
      .trim()
      .regex(/^\d{3,4}$/, 'Güvenlik kodu (CVV) 3 veya 4 haneli olmalıdır.'),
    terms_accepted: z.literal(true, {
      errorMap: () => ({
        message:
          'Mesafeli Satış Sözleşmesi ve Ön Bilgilendirme Koşullarını onaylamalısınız.',
      }),
    }),
  })
  .superRefine((data, ctx) => {
    if (isCardExpired(data.expire_month, data.expire_year)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Kartın son kullanma tarihi geçmiş olamaz.',
        path: ['expire_year'],
      });
    }
  });

export type CheckoutPaymentInput = z.infer<typeof checkoutPaymentSchema>;

export interface CheckoutFormData {
  address_id: string;
  payment_type: 'credit_card' | 'debit_card';
  card_holder: string;
  card_holder_first_name?: string;
  card_holder_last_name?: string;
  card_number: string;
  expire_month: string;
  expire_year: string;
  cvv: string;
  terms_accepted: boolean;
}

export const DEFAULT_CHECKOUT_FORM: CheckoutFormData = {
  address_id: '',
  payment_type: 'credit_card',
  card_holder: '',
  card_holder_first_name: '',
  card_holder_last_name: '',
  card_number: '',
  expire_month: '',
  expire_year: '',
  cvv: '',
  terms_accepted: false,
};
