import type { FAQItem, FAQCategory } from "@/types/faq";

// FAQ kategorileri
export const faqCategories: FAQCategory[] = [
  { key: 'genel', label: 'Genel' },
  { key: 'urunler', label: 'Ürünler' },
  { key: 'kargo', label: 'Kargo' }
];

// Görseldeki soruları temel alan dummy data
export const faqData: FAQItem[] = [
  // GENEL kategorisi
  {
    id: 1,
    question: "OJS Nutrition ürünlerinin menşei neresi?",
    answer: "OJS Nutrition ürünleri, dünya çapında tanınmış ve güvenilir üreticilerden temin edilmektedir. Tüm ürünlerimiz kalite sertifikalarına sahiptir ve uluslararası standartlarda üretilmiştir.",
    category: "genel"
  },
  {
    id: 2,
    question: "Hangi sertifikalarınız var?",
    answer: "ISO 9001 Kalite Yönetim Sistemi, GMP (Good Manufacturing Practice), FDA onayı, HACCP sertifikası ve diğer uluslararası kalite belgelerimiz mevcuttur. Tüm sertifikalarımızı web sitemizden inceleyebilirsiniz.",
    category: "genel"
  },
  {
    id: 3,
    question: "Satılan ürünler garantili midir? Değişim var mı?",
    answer: "Evet, tüm ürünlerimiz %100 orijinallik garantisi ile satılmaktadır. Hasarlı veya hatalı ürünler için 14 gün içinde değişim yapılır. Mühürsüz ürünler için iade/değişim kabul edilmez.",
    category: "genel"
  },
  {
    id: 4,
    question: "Sipariş verirken sorun yaşıyorum, ne yapmam gerekir?",
    answer: "Sipariş verme sırasında teknik bir sorun yaşıyorsanız, müşteri hizmetlerimizi arayabilir veya WhatsApp destek hattımızdan yardım alabilirsiniz. Alternatif olarak farklı bir tarayıcı deneyebilirsiniz.",
    category: "genel"
  },
  {
    id: 5,
    question: "OJS Nutrition ürünleri nerede satılıyor?",
    answer: "Ürünlerimizi resmi web sitemizden, yetkili bayilerimizden ve seçili eczanelerden satın alabilirsiniz. Sahte ürünlerden korunmak için sadece yetkili satış noktalarını tercih edin.",
    category: "genel"
  },
  {
    id: 6,
    question: "Yüksek proteinli ürünleri kimler kullanabilir?",
    answer: "18 yaş üstü sağlıklı bireyler, sporcular ve aktif yaşam süren kişiler kullanabilir. Hamilelik, emzirme dönemi veya kronik hastalığı olanlar doktor tavsiyesi almalıdır.",
    category: "genel"
  },

  // ÜRÜNLER kategorisi
  {
    id: 7,
    question: "Taksit seçeneği neden yok?",
    answer: "Kredi kartı ile yapılan ödemelerde 2, 3, 6, 9 ve 12 aya varan taksit seçenekleri mevcuttur. Taksit seçenekleri ödeme sayfasında kartınızın limitine göre görüntülenir.",
    category: "urunler"
  },
  {
    id: 8,
    question: "Siparişimi nasıl iptal edebilirim?",
    answer: "Henüz kargoya verilmemiş siparişleri müşteri panelinden iptal edebilirsiniz. Kargoya verilmiş siparişler için kargo iade sürecini başlatmanız gerekir.",
    category: "urunler"
  },
  {
    id: 9,
    question: "Kapağın altındaki folyo açılmış veya tam yapışmamış gibi duruyor?",
    answer: "Bu durum nakliye sırasında oluşabilir ancak ürün kalitesini etkilemez. Folyo tamamen açık ise ürünü kullanmayın ve müşteri hizmetleri ile iletişime geçin.",
    category: "urunler"
  },
  {
    id: 10,
    question: "Sattığınız ürünler ilaç mıdır?",
    answer: "Hayır, satışını yaptığımız ürünler gıda takviyesidir. İlaç değildir ve hastalık tedavisinde kullanılmaz. Beslenme programınızı destekleyici niteliktedir.",
    category: "urunler"
  },
  {
    id: 11,
    question: "Siparişimi teslim alırken nelere dikkat etmeliyim?",
    answer: "Kargo paketinin hasarsız olduğunu, ürün ambalajlarının sağlam ve mühürlü olduğunu kontrol edin. Herhangi bir hasar varsa kargo görevlisinin yanında tutanak tutun.",
    category: "urunler"
  },

  // KARGO kategorisi
  {
    id: 12,
    question: "Kapıda ödeme hizmetiniz var mı?",
    answer: "Evet, kapıda ödeme seçeneğimiz mevcuttur. Ancak bu seçenek sadece belirli şehirler için geçerlidir ve 5 TL ek ücret alınır.",
    category: "kargo"
  },
  {
    id: 13,
    question: "Sipariş takibimi nasıl yapabilirim?",
    answer: "Siparişiniz kargoya verildikten sonra size SMS ve e-posta ile takip numarası gönderilir. Bu numara ile kargo firmasının web sitesinden takip yapabilirsiniz.",
    category: "kargo"
  },
  {
    id: 14,
    question: "İptal ve iade ettğim ürünlerin tutarı hesabıma ne zaman aktarılır?",
    answer: "İade onaylandıktan sonra kredi kartına iadeler 2-5 iş günü, banka hesabına iadeler 3-7 iş günü içinde gerçekleşir. Kapıda ödeme ile alınan siparişlerde hesap bilgilerinizi paylaşmanız gerekir.",
    category: "kargo"
  }
];

// Kategori bazlı veri filtreleme yardımcı fonksiyonu
export const getFAQByCategory = (category: 'genel' | 'urunler' | 'kargo'): FAQItem[] => {
  return faqData.filter(item => item.category === category);
};

// Tüm FAQ verilerini döndüren fonksiyon
export const getAllFAQ = (): FAQItem[] => {
  return faqData;
};
