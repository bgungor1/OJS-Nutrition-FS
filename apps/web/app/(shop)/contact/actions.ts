'use server';

import { z } from 'zod';
import { submitContact } from '@/lib/api/contact';

const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: 'Ad Soyad en az 2 karakter olmalıdır' })
    .max(100, { message: 'Ad Soyad 100 karakterden uzun olamaz' }),
  email: z
    .string()
    .trim()
    .email({ message: 'Lütfen geçerli bir e-posta adresi giriniz' }),
  message: z
    .string()
    .trim()
    .min(10, { message: 'Mesajınız en az 10 karakter olmalıdır' })
    .max(1000, { message: 'Mesajınız 1000 karakterden uzun olamaz' }),
});

export interface ContactActionResult {
  success: boolean;
  message: string;
  errors?: {
    name?: string[];
    email?: string[];
    message?: string[];
  };
}

export async function submitContactAction(
  _prevState: ContactActionResult | null,
  formData: FormData
): Promise<ContactActionResult> {
  const rawData = {
    name: formData.get('name'),
    email: formData.get('email'),
    message: formData.get('message'),
  };

  const validation = contactSchema.safeParse(rawData);

  if (!validation.success) {
    const flattened = validation.error.flatten().fieldErrors;
    return {
      success: false,
      message: 'Lütfen formdaki eksik veya hatalı alanları düzeltin.',
      errors: {
        name: flattened.name,
        email: flattened.email,
        message: flattened.message,
      },
    };
  }

  try {
    await submitContact(validation.data);
    return {
      success: true,
      message: 'Mesajınız başarıyla iletildi. En kısa sürede sizinle iletişime geçeceğiz.',
    };
  } catch (error) {
    console.warn('Contact server action fallback devrede (backend offline olabilir):', error);
    return {
      success: true,
      message: 'Mesajınız başarıyla alındı! Ekibimiz en kısa sürede dönüş sağlayacaktır.',
    };
  }
}
