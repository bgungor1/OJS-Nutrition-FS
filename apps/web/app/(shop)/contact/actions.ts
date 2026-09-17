'use server';

import { submitContact } from '@/lib/api/contact';
import { contactSchema } from '@/lib/schemas/contact';
import { ApiError } from '@/lib/api-client';

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
  formData: FormData,
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
    if (error instanceof ApiError) {
      if (error.status === 429) {
        return {
          success: false,
          message: 'Çok fazla istek gönderdiniz, lütfen 1 dakika bekleyin.',
        };
      }

      return {
        success: false,
        message: error.message || 'Mesajınız iletilemedi. Lütfen tekrar deneyiniz.',
      };
    }

    return {
      success: false,
      message: 'Mesaj gönderilirken bir sunucu hatası oluştu. Lütfen daha sonra tekrar deneyiniz.',
    };
  }
}
