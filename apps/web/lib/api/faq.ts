import { serverFetch } from '../api-client';
import type { ApiFaqItem } from '@/types';

export const FALLBACK_FAQS: ApiFaqItem[] = [
  {
    id: 1,
    question: 'OJS Nutrition ürünlerinin menşei neresi?',
    answer: 'OJS Nutrition ürünleri, dünya çapında tanınmış ve güvenilir üreticilerden temin edilen hammaddelerle, T.C. Tarım ve Orman Bakanlığı onaylı modern tesislerde uluslararası standartlarda üretilmektedir.',
    category: 'genel',
  },
  {
    id: 2,
    question: 'Hangi kalite ve güvenlik sertifikalarınız var?',
    answer: 'Tesislerimiz ISO 9001 Kalite Yönetim Sistemi, ISO 22000 Gıda Güvenliği, GMP (Good Manufacturing Practice) ve Helal üretim sertifikalarına sahiptir.',
    category: 'genel',
  },
  {
    id: 3,
    question: 'Satılan ürünler garantili midir? İade/değişim koşulları nelerdir?',
    answer: 'Tüm ürünlerimiz %100 orijinaldir. Açılmamış ve güvenlik bandrolü hasar görmemiş ürünleri teslimat tarihinden itibaren 14 gün içinde koşulsuz iade edebilirsiniz.',
    category: 'genel',
  },
  {
    id: 4,
    question: 'Sattığınız ürünler ilaç mıdır? Tedavi amacıyla kullanılır mı?',
    answer: 'Hayır. Sitemizde satılan ürünler sporcu gıdası ve takviye edici gıdadır; ilaç değildir ve herhangi bir hastalığın teşhis, tedavi veya önlenmesi amacıyla kullanılmaz.',
    category: 'urunler',
  },
  {
    id: 5,
    question: 'Kapağın altındaki folyo tam yapışmamış görünüyor, bu normal mi?',
    answer: 'Kapaklarımızda basınca duyarlı (pressure-sealed) koruyucu folyolar kullanılır. Kapağı çevirerek ilk kez açtığınızda yapışkan tabaka kapakla birlikte hafifçe gevşeyebilir. Ürün emniyet bandı sağlamsa ürün tamamen taze ve güvenlidir.',
    category: 'urunler',
  },
  {
    id: 6,
    question: 'Siparişler ne kadar sürede kargoya verilir?',
    answer: 'Hafta içi saat 16:00\'a kadar verilen siparişler aynı gün kargoya teslim edilir. Resmi tatil ve hafta sonu verilen siparişler takip eden ilk iş günü kargolanır.',
    category: 'kargo',
  },
  {
    id: 7,
    question: 'Kargo ücreti ne kadar ve hangi kargo firmasıyla çalışıyorsunuz?',
    answer: '750 TL ve üzeri tüm siparişlerde kargo tamamen ücretsizdir. Anlaşmalı olduğumuz Yurtiçi Kargo ve Aras Kargo güvencesiyle Türkiye\'nin her yerine teslimat yapmaktayız.',
    category: 'kargo',
  },
  {
    id: 8,
    question: 'Kargo paketini teslim alırken nelere dikkat etmeliyim?',
    answer: 'Paketi teslim alırken ezilme, yırtılma veya ıslanma gibi hasar olup olmadığını kontrol ediniz. Hasar durumunda kargo görevlisine Hasar Tespit Tutanağı tutturmanız rica olunur.',
    category: 'kargo',
  },
];

export async function getFaqItems(category?: string): Promise<ApiFaqItem[]> {
  const endpoint = category ? `/faq?category=${encodeURIComponent(category)}` : '/faq';

  try {
    const data = await serverFetch<ApiFaqItem[]>(endpoint, {
      next: { revalidate: 3600, tags: ['faq'] },
    });
    if (data && data.length > 0) {
      return data;
    }
  } catch (error) {
    console.warn('FAQ verisi API üzerinden alınamadı, yerel liste kullanılacak:', error);
  }

  if (category) {
    return FALLBACK_FAQS.filter((item) => item.category === category);
  }

  return FALLBACK_FAQS;
}
