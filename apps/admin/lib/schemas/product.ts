import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(2, 'Ürün adı en az 2 karakter olmalıdır'),
  slug: z
    .string()
    .min(2, 'Slug en az 2 karakter olmalıdır')
    .regex(
      /^[a-z0-9-]+$/,
      'Slug yalnızca küçük harf, rakam ve tire (-) içerebilir',
    ),
  shortExplanation: z
    .string()
    .min(5, 'Kısa açıklama en az 5 karakter olmalıdır'),
  usage: z.string().min(5, 'Kullanım talimatı en az 5 karakter olmalıdır'),
  features: z.string().min(5, 'Özellikler en az 5 karakter olmalıdır'),
  description: z.string().min(10, 'Detaylı açıklama en az 10 karakter olmalıdır'),
  tags: z.array(z.string()).min(1, 'En az bir etiket eklenmelidir'),
  mainCategoryId: z.string().uuid('Geçerli bir ana kategori seçilmelidir'),
  subCategoryId: z.string().uuid('Geçerli bir alt kategori seçilmelidir'),
  isBestSeller: z.boolean().default(false),
  bestSellerRank: z.number().int().positive().optional().nullable(),
  photoSrc: z.string().optional(),
});

export type ProductFormValues = z.infer<typeof productSchema>;

export const variantSchema = z
  .object({
    aroma: z.string().min(1, 'Aroma / tat belirtilmelidir'),
    gram: z.number().int().positive('Gramaj 0 dan büyük olmalıdır'),
    pieces: z.number().int().positive('Adet 1 veya daha fazla olmalıdır').default(1),
    totalServings: z.number().int().positive('Servis sayısı 0 dan büyük olmalıdır'),
    totalPrice: z.number().positive('Satış fiyatı 0 dan büyük olmalıdır'),
    discountedPrice: z.number().positive('İndirimli fiyat 0 dan büyük olmalıdır').optional().nullable(),
    pricePerServing: z.number().positive('Servis başı fiyat 0 dan büyük olmalıdır'),
    photoSrc: z.string().min(1, 'Görsel yolu boş bırakılamaz'),
    isAvailable: z.boolean().default(true),
    stockQuantity: z.number().int().min(0, 'Stok adedi 0 veya daha fazla olmalıdır').default(0),
  })
  .refine(
    (data) => {
      if (data.discountedPrice != null && data.discountedPrice > 0) {
        return data.discountedPrice < data.totalPrice;
      }
      return true;
    },
    {
      message: 'İndirimli fiyat normal satış fiyatından düşük olmalıdır',
      path: ['discountedPrice'],
    },
  );

export type VariantFormValues = z.infer<typeof variantSchema>;

export function slugifyTurkish(text: string): string {
  return text
    .replace(/İ/g, 'i')
    .replace(/I/g, 'i')
    .replace(/Ğ/g, 'g')
    .replace(/Ü/g, 'u')
    .replace(/Ş/g, 's')
    .replace(/Ö/g, 'o')
    .replace(/Ç/g, 'c')
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

