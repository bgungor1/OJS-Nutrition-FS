import type { QuickTopic } from './chat-types';

export const QUICK_TOPICS: QuickTopic[] = [
  {
    id: 'shipping',
    label: '🚚 Kargo Ne Zaman Ulaşır?',
    response:
      'Hafta içi saat 16:00\'a kadar verilen tüm siparişler aynı gün kargoya teslim edilir. Teslimat süresi bulunduğunuz şehre bağlı olarak 1-3 iş günüdür.',
  },
  {
    id: 'order_status',
    label: '📦 Siparişimi Nasıl Takip Ederim?',
    response:
      'Sipariş durumunuzu ve kargo takip kodunuzu web sitemizdeki Hesabım > Siparişlerim sayfasından 7/24 anlık olarak görüntüleyebilirsiniz.',
  },
  {
    id: 'returns',
    label: '🔄 İade ve Değişim Koşulları',
    response:
      'Ambalajı açılmamış ve güvenlik bandı yırtılmamış ürünleri teslim aldığınız tarihten itibaren 14 gün içinde anlaşmalı kargo ile ücretsiz iade edebilirsiniz.',
  },
  {
    id: 'product_advice',
    label: '💪 Hangi Ürünü Seçmeliyim?',
    response:
      'Hedefinize göre (kas kütlesi, kilo verme, güç artışı) en uygun takviyeyi belirlemek için ürün detayındaki kullanım tavsiyelerini inceleyebilir veya uzmanımıza soru sorabilirsiniz.',
  },
];

export function findAutoResponse(query: string): string {
  const normalized = query.toLowerCase().trim();

  if (
    normalized.includes('kargo') ||
    normalized.includes('teslimat') ||
    normalized.includes('gönderi')
  ) {
    return 'Hafta içi 16:00\'a kadar verilen siparişler aynı gün kargolanır ve genellikle 1-3 iş gününde kapınıza ulaşır.';
  }

  if (
    normalized.includes('sipariş') ||
    normalized.includes('nerede') ||
    normalized.includes('takip')
  ) {
    return 'Siparişinizin durumunu "Hesabım > Siparişlerim" sayfasından takip edebilirsiniz.';
  }

  if (
    normalized.includes('iade') ||
    normalized.includes('değişim') ||
    normalized.includes('iptal')
  ) {
    return '14 gün içerisinde orijinal ambalajı bozulmamış ürünleri ücretsiz iade edebilirsiniz.';
  }

  if (
    normalized.includes('protein') ||
    normalized.includes('kreatin') ||
    normalized.includes('bcaa') ||
    normalized.includes('nasıl kullanılır')
  ) {
    return 'Sporcu besinlerimizin kullanım detayları ürün paketlerinde ve ürün detay sayfalarında ayrıntılı olarak yer almaktadır.';
  }

  return 'Mesajınız alındı! Müşteri temsilcimiz en kısa sürede size dönüş yapacaktır. Acil durumlarda 0850 123 45 67 veya destek@ojsnutrition.com üzerinden ulaşabilirsiniz.';
}
