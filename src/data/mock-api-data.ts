import type {
  ApiProduct,
  ApiProductsResponse,
  ApiProductDetail,
  ApiProductDetailResponse,
  ApiBestSellerProduct,
  ApiBestSellerResponse
} from '@/types/api'

// Ana görsel importları
import wheyProteinImg from '@/assets/whey-protein.jpg'
import fitnessPaketiImg from '@/assets/fitness-paketi.png'
import gunlukVitaminImg from '@/assets/gunluk-vitamin-paketi.png'
import preworkoutImg from '@/assets/preworkout.png'
import creamOfRiceImg from '@/assets/rice-of-cream.png'
import creatineImg from '@/assets/creatine.png'

// Protein listesi görsel importları
import wheyIsolateImg from '@/assets/protein-list/whey-isolate.jpg'
import peaProteinImg from '@/assets/protein-list/pea-protein.jpg'
import micellarCaseinImg from '@/assets/protein-list/miclar-casein.jpg'
import eggWhiteImg from '@/assets/protein-list/egg-with.jpg'
import milkProteinImg from '@/assets/protein-list/milk-protein.png'
import soyaProteinImg from '@/assets/protein-list/soya-protein.png'
import proteinBar2liImg from '@/assets/protein-list/protein-bar-2-li.png'
import massGainerImg from '@/assets/protein-list/mass-gainer.png'
import proteinBarImg from '@/assets/protein-list/protein-bar.png'
import collagenCoffeeImg from '@/assets/protein-list/collagen-coffe.png'

// 1. Mock Best Seller Ürünleri
export const mockBestSellersData: ApiBestSellerProduct[] = [
  {
    name: 'WHEY PROTEIN',
    short_explanation: 'EN ÇOK TERCİH EDİLEN PROTEİN TAKVİYESİ',
    slug: 'whey-protein',
    price_info: {
      profit: null,
      total_price: 549,
      discounted_price: null,
      price_per_servings: 34.31,
      discount_percentage: null
    },
    photo_src: wheyProteinImg,
    comment_count: 10869,
    average_star: 5
  },
  {
    name: 'FITNESS PAKETİ',
    short_explanation: 'EN POPÜLER ÜRÜNLER BİR ARADA',
    slug: 'fitness-paketi',
    price_info: {
      profit: 327,
      total_price: 1126,
      discounted_price: 799,
      price_per_servings: 799,
      discount_percentage: 29
    },
    photo_src: fitnessPaketiImg,
    comment_count: 7650,
    average_star: 5
  },
  {
    name: 'GÜNLÜK VİTAMİN PAKETİ',
    short_explanation: 'EN SIK TÜKETİLEN TAKVİYELER',
    slug: 'gunluk-vitamin-paketi',
    price_info: {
      profit: 198,
      total_price: 747,
      discounted_price: 549,
      price_per_servings: 9.15,
      discount_percentage: 26
    },
    photo_src: gunlukVitaminImg,
    comment_count: 5013,
    average_star: 5
  },
  {
    name: 'PRE-WORKOUT SUPREME',
    short_explanation: 'ANTRENMAN ÖNCESİ TAKVİYE',
    slug: 'pre-workout-supreme',
    price_info: {
      profit: null,
      total_price: 399,
      discounted_price: null,
      price_per_servings: 13.3,
      discount_percentage: null
    },
    photo_src: preworkoutImg,
    comment_count: 6738,
    average_star: 5
  },
  {
    name: 'CREAM OF RICE',
    short_explanation: 'EN LEZZETLİ PİRİNÇ KREMASI',
    slug: 'cream-of-rice',
    price_info: {
      profit: null,
      total_price: 239,
      discounted_price: null,
      price_per_servings: 7.97,
      discount_percentage: null
    },
    photo_src: creamOfRiceImg,
    comment_count: 5216,
    average_star: 5
  },
  {
    name: 'CREATINE',
    short_explanation: 'EN POPÜLER SPORCU TAKVİYESİ',
    slug: 'creatine',
    price_info: {
      profit: null,
      total_price: 239,
      discounted_price: null,
      price_per_servings: 2.39,
      discount_percentage: null
    },
    photo_src: creatineImg,
    comment_count: 8558,
    average_star: 5
  }
]

// 2. Mock Ürünler Listesi (Tüm Katalog & Sayfalama için)
export const mockProductsList: ApiProduct[] = [
  {
    id: '1',
    name: 'WHEY PROTEIN',
    short_explanation: 'EN ÇOK TERCİH EDİLEN PROTEİN TAKVİYESİ',
    slug: 'whey-protein',
    price_info: {
      profit: null,
      total_price: 549,
      discounted_price: null,
      price_per_servings: 34.31,
      discount_percentage: null
    },
    photo_src: wheyProteinImg,
    comment_count: 10880,
    average_star: 5
  },
  {
    id: '2',
    name: 'WHEY ISOLATE',
    short_explanation: 'EN YÜKSEK SAF PROTEİN ORANI',
    slug: 'whey-isolate',
    price_info: {
      profit: null,
      total_price: 749,
      discounted_price: null,
      price_per_servings: 46.81,
      discount_percentage: null
    },
    photo_src: wheyIsolateImg,
    comment_count: 8450,
    average_star: 5
  },
  {
    id: '3',
    name: 'FITNESS PAKETİ',
    short_explanation: 'EN POPÜLER ÜRÜNLER BİR ARADA',
    slug: 'fitness-paketi',
    price_info: {
      profit: 327,
      total_price: 1126,
      discounted_price: 799,
      price_per_servings: 799,
      discount_percentage: 29
    },
    photo_src: fitnessPaketiImg,
    comment_count: 7650,
    average_star: 5
  },
  {
    id: '4',
    name: 'PEA PROTEIN (BEZELYE PROTEİNİ)',
    short_explanation: '%100 BİTKİSEL PROTEİN',
    slug: 'pea-protein',
    price_info: {
      profit: null,
      total_price: 399,
      discounted_price: null,
      price_per_servings: 24.93,
      discount_percentage: null
    },
    photo_src: peaProteinImg,
    comment_count: 3240,
    average_star: 5
  },
  {
    id: '5',
    name: 'MICELLAR CASEIN',
    short_explanation: 'YAVAŞ SİNDİRİLEN GECE PROTEİNİ',
    slug: 'micellar-casein',
    price_info: {
      profit: null,
      total_price: 599,
      discounted_price: null,
      price_per_servings: 37.43,
      discount_percentage: null
    },
    photo_src: micellarCaseinImg,
    comment_count: 4150,
    average_star: 5
  },
  {
    id: '6',
    name: 'EGG WHITE POWDER',
    short_explanation: 'YÜKSEK BİYOYARARLANIMLI YUMURTA AKI',
    slug: 'egg-white-powder',
    price_info: {
      profit: null,
      total_price: 479,
      discounted_price: null,
      price_per_servings: 29.93,
      discount_percentage: null
    },
    photo_src: eggWhiteImg,
    comment_count: 2890,
    average_star: 5
  },
  {
    id: '7',
    name: 'MILK PROTEIN (SÜT PROTEİNİ)',
    short_explanation: '%80 KAZEİN, %20 WHEY PROTEİN',
    slug: 'milk-protein',
    price_info: {
      profit: null,
      total_price: 529,
      discounted_price: null,
      price_per_servings: 33.06,
      discount_percentage: null
    },
    photo_src: milkProteinImg,
    comment_count: 1980,
    average_star: 5
  },
  {
    id: '8',
    name: 'SOYA PROTEIN',
    short_explanation: 'ZENGİN AMİNO ASİT PROFİLLİ BİTKİSEL PROTEİN',
    slug: 'soya-protein',
    price_info: {
      profit: null,
      total_price: 369,
      discounted_price: null,
      price_per_servings: 23.06,
      discount_percentage: null
    },
    photo_src: soyaProteinImg,
    comment_count: 1750,
    average_star: 4.8
  },
  {
    id: '9',
    name: "PROTEİN BAR 2'Lİ",
    short_explanation: 'PRATİK VE YÜKSEK PROTEİNLİ ATIŞTIRMALIK',
    slug: 'protein-bar-2li',
    price_info: {
      profit: 20,
      total_price: 119,
      discounted_price: 99,
      price_per_servings: 49.5,
      discount_percentage: 17
    },
    photo_src: proteinBar2liImg,
    comment_count: 4890,
    average_star: 5
  },
  {
    id: '10',
    name: 'MASS GAINER',
    short_explanation: 'YÜKSEK KALORİ VE KARBONHİDRAT TOZU',
    slug: 'mass-gainer',
    price_info: {
      profit: null,
      total_price: 649,
      discounted_price: null,
      price_per_servings: 40.56,
      discount_percentage: null
    },
    photo_src: massGainerImg,
    comment_count: 6320,
    average_star: 5
  },
  {
    id: '11',
    name: 'GÜNLÜK VİTAMİN PAKETİ',
    short_explanation: 'EN SIK TÜKETİLEN TAKVİYELER',
    slug: 'gunluk-vitamin-paketi',
    price_info: {
      profit: 198,
      total_price: 747,
      discounted_price: 549,
      price_per_servings: 9.15,
      discount_percentage: 26
    },
    photo_src: gunlukVitaminImg,
    comment_count: 5013,
    average_star: 5
  },
  {
    id: '12',
    name: 'PRE-WORKOUT SUPREME',
    short_explanation: 'ANTRENMAN ÖNCESİ TAKVİYE',
    slug: 'pre-workout-supreme',
    price_info: {
      profit: null,
      total_price: 399,
      discounted_price: null,
      price_per_servings: 13.3,
      discount_percentage: null
    },
    photo_src: preworkoutImg,
    comment_count: 6738,
    average_star: 5
  },
  {
    id: '13',
    name: 'CREAM OF RICE',
    short_explanation: 'EN LEZZETLİ PİRİNÇ KREMASI',
    slug: 'cream-of-rice',
    price_info: {
      profit: null,
      total_price: 239,
      discounted_price: null,
      price_per_servings: 7.97,
      discount_percentage: null
    },
    photo_src: creamOfRiceImg,
    comment_count: 5216,
    average_star: 5
  },
  {
    id: '14',
    name: 'CREATINE',
    short_explanation: 'EN POPÜLER SPORCU TAKVİYESİ',
    slug: 'creatine',
    price_info: {
      profit: null,
      total_price: 239,
      discounted_price: null,
      price_per_servings: 2.39,
      discount_percentage: null
    },
    photo_src: creatineImg,
    comment_count: 8558,
    average_star: 5
  },
  {
    id: '15',
    name: 'COLLAGEN COFFEE',
    short_explanation: 'TİP 1 VE TİP 3 KOLAJEN İÇEREN KAHVE',
    slug: 'collagen-coffee',
    price_info: {
      profit: null,
      total_price: 349,
      discounted_price: null,
      price_per_servings: 11.63,
      discount_percentage: null
    },
    photo_src: collagenCoffeeImg,
    comment_count: 2450,
    average_star: 5
  },
  {
    id: '16',
    name: 'PROTEİN BAR',
    short_explanation: 'TEKLİ PROTEİN BAR ATIŞTIRMALIK',
    slug: 'protein-bar',
    price_info: {
      profit: null,
      total_price: 59,
      discounted_price: null,
      price_per_servings: 59,
      discount_percentage: null
    },
    photo_src: proteinBarImg,
    comment_count: 3120,
    average_star: 4.9
  }
]

// 3. Mock Ürün Detayları (Slug'a veya ID'ye göre zengin detay)
export const mockProductDetailsMap: Record<string, ApiProductDetail> = {
  'whey-protein': {
    id: '1',
    name: 'WHEY PROTEIN',
    slug: 'whey-protein',
    short_explanation: 'Yüksek kaliteli whey protein tozu, kas gelişimi ve toparlanma için ideal.',
    explanation: {
      usage: '1 ölçek (30g) ürünü 200-250 ml soğuk su veya süt ile karıştırınız. Antrenmandan hemen sonra veya gün içinde protein ihtiyacınıza göre 1-2 servis tüketebilirsiniz.',
      features: 'Yüksek protein içeriği (24g/servis)\nKolay karışan mikro filtre formül\nZengin BCAA ve Glutamin öncüleri\nGluten içermez & Vejetaryen dostu\nDüşük şeker ve düşük yağ oranı',
      description: 'OJS Nutrition Whey Protein, en yüksek kalite standartlarında üretilmiş konsantre ve izole peynir altı suyu proteinidir. Kas kütlesinin artışına ve korunmasına katkıda bulunur. Üstün çözünürlüğü ve eşsiz aroma seçenekleriyle antrenman hedeflerinize ulaşmanızı kolaylaştırır.',
      nutritional_content: {
        ingredients: [
          { aroma: 'Bisküvi', value: 'Peynir Altı Suyu Proteini Konsantresi (Süt), Doğala Özdeş Bisküvi Aroması, Kıvam Artırıcı (Ksantan Gam), Tatlandırıcı (Sukraloz).' },
          { aroma: 'Çikolata', value: 'Peynir Altı Suyu Proteini Konsantresi (Süt), Yağı Azaltılmış Kakao Tozu, Doğal Çikolata Aroması, Tatlandırıcı (Sukraloz).' },
          { aroma: 'Muz', value: 'Peynir Altı Suyu Proteini Konsantresi (Süt), Doğal Muz Aroması, Renklendirici (Beta Karoten), Tatlandırıcı (Sukraloz).' },
          { aroma: 'Salted Caramel', value: 'Peynir Altı Suyu Proteini Konsantresi (Süt), Karamel Aroması, Deniz Tuzu, Tatlandırıcı (Sukraloz).' },
          { aroma: 'Çilek', value: 'Peynir Altı Suyu Proteini Konsantresi (Süt), Doğal Çilek Aroması, Pancar Kökü Kırmızısı, Tatlandırıcı (Sukraloz).' }
        ],
        nutrition_facts: {
          ingredients: [
            { name: 'Enerji', amounts: ['120 kcal', '502 kJ'] },
            { name: 'Yağ', amounts: ['1.5 g', '0.9 g Doymuş Yağ'] },
            { name: 'Karbonhidrat', amounts: ['2.5 g', '1.2 g Şekerler'] },
            { name: 'Protein', amounts: ['24.0 g', '80%'] },
            { name: 'Tuz', amounts: ['0.15 g', '0.06 g Sodyum'] }
          ],
          portion_sizes: ['30 g (1 Ölçek)', '100 g']
        },
        amino_acid_facts: {
          ingredients: [
            { name: 'L-Leucine (BCAA)', amounts: ['2.6 g'] },
            { name: 'L-Isoleucine (BCAA)', amounts: ['1.4 g'] },
            { name: 'L-Valine (BCAA)', amounts: ['1.3 g'] },
            { name: 'L-Glutamine', amounts: ['4.2 g'] },
            { name: 'L-Arginine', amounts: ['0.6 g'] }
          ],
          portion_sizes: ['30 g Servis Başına']
        }
      }
    },
    main_category_id: 'protein',
    sub_category_id: 'whey',
    tags: ['PROTEİN', 'WHEY', 'KAS GELİŞİMİ', 'GLUTENSİZ', 'VEJETARYEN'],
    variants: [
      {
        id: '1-biscuit-400g',
        size: { gram: 400, pieces: 1, total_services: 16 },
        aroma: 'Bisküvi',
        price: { profit: null, total_price: 549, discounted_price: null, price_per_servings: 34.31, discount_percentage: null },
        photo_src: wheyProteinImg,
        is_available: true
      },
      {
        id: '1-biscuit-1600g',
        size: { gram: 1600, pieces: 1, total_services: 64 },
        aroma: 'Bisküvi',
        price: { profit: 297, total_price: 2196, discounted_price: 1899, price_per_servings: 29.67, discount_percentage: 14 },
        photo_src: wheyProteinImg,
        is_available: true
      },
      {
        id: '1-chocolate-400g',
        size: { gram: 400, pieces: 1, total_services: 16 },
        aroma: 'Çikolata',
        price: { profit: null, total_price: 549, discounted_price: null, price_per_servings: 34.31, discount_percentage: null },
        photo_src: wheyProteinImg,
        is_available: true
      },
      {
        id: '1-chocolate-1600g',
        size: { gram: 1600, pieces: 1, total_services: 64 },
        aroma: 'Çikolata',
        price: { profit: 297, total_price: 2196, discounted_price: 1899, price_per_servings: 29.67, discount_percentage: 14 },
        photo_src: wheyProteinImg,
        is_available: true
      },
      {
        id: '1-banana-400g',
        size: { gram: 400, pieces: 1, total_services: 16 },
        aroma: 'Muz',
        price: { profit: null, total_price: 549, discounted_price: null, price_per_servings: 34.31, discount_percentage: null },
        photo_src: wheyProteinImg,
        is_available: true
      },
      {
        id: '1-strawberry-400g',
        size: { gram: 400, pieces: 1, total_services: 16 },
        aroma: 'Çilek',
        price: { profit: null, total_price: 549, discounted_price: null, price_per_servings: 34.31, discount_percentage: null },
        photo_src: wheyProteinImg,
        is_available: true
      },
      {
        id: '1-caramel-400g',
        size: { gram: 400, pieces: 1, total_services: 16 },
        aroma: 'Salted Caramel',
        price: { profit: null, total_price: 549, discounted_price: null, price_per_servings: 34.31, discount_percentage: null },
        photo_src: wheyProteinImg,
        is_available: true
      }
    ],
    comment_count: 10880,
    average_star: 5
  },
  'whey-isolate': {
    id: '2',
    name: 'WHEY ISOLATE',
    slug: 'whey-isolate',
    short_explanation: 'En yüksek saflıkta izole whey protein tozu. Sıfır yağ, sıfır şeker.',
    explanation: {
      usage: '1 ölçek (25g) ürünü 200 ml soğuk su ile karıştırarak antrenman sonrasında tüketiniz.',
      features: '%90+ saf protein oranı\nSıfıra yakın laktoz ve yağ\nUltra hızlı sindirim ve biyoyararlanım\nGluten içermez',
      description: 'Cross-flow mikro filtrasyon teknolojisi ile üretilmiş en saf formdaki izole peynir altı suyu proteini. Definasyon ve saf kas kazanımı dönemleri için idealdir.',
      nutritional_content: {
        ingredients: [
          { aroma: 'Çikolata', value: 'İzole Peynir Altı Suyu Proteini (Süt), Doğal Kakao, Sukraloz.' },
          { aroma: 'Vanilya', value: 'İzole Peynir Altı Suyu Proteini (Süt), Doğal Vanilya Aroması, Sukraloz.' }
        ],
        nutrition_facts: {
          ingredients: [
            { name: 'Enerji', amounts: ['105 kcal'] },
            { name: 'Protein', amounts: ['23.5 g'] },
            { name: 'Yağ', amounts: ['0.2 g'] },
            { name: 'Karbonhidrat', amounts: ['0.4 g'] }
          ],
          portion_sizes: ['25 g (1 Ölçek)']
        },
        amino_acid_facts: {
          ingredients: [
            { name: 'BCAA', amounts: ['6.1 g'] },
            { name: 'Glutamin', amounts: ['4.6 g'] }
          ],
          portion_sizes: ['25 g']
        }
      }
    },
    main_category_id: 'protein',
    sub_category_id: 'isolate',
    tags: ['PROTEİN', 'İZOLAT', 'SAF KAS', 'GLUTENSİZ'],
    variants: [
      {
        id: '2-choc-500g',
        size: { gram: 500, pieces: 1, total_services: 20 },
        aroma: 'Çikolata',
        price: { profit: null, total_price: 749, discounted_price: null, price_per_servings: 37.45, discount_percentage: null },
        photo_src: wheyIsolateImg,
        is_available: true
      },
      {
        id: '2-vanilla-500g',
        size: { gram: 500, pieces: 1, total_services: 20 },
        aroma: 'Vanilya',
        price: { profit: null, total_price: 749, discounted_price: null, price_per_servings: 37.45, discount_percentage: null },
        photo_src: wheyIsolateImg,
        is_available: true
      }
    ],
    comment_count: 8450,
    average_star: 5
  },
  'fitness-paketi': {
    id: '3',
    name: 'FITNESS PAKETİ',
    slug: 'fitness-paketi',
    short_explanation: 'Fitness hedefleriniz için gerekli tüm temel takviyeler avantajlı fiyatla tek pakette.',
    explanation: {
      usage: 'Paket içeriğindeki her bir ürünü kendi servis talimatlarına uygun şekilde gün içine yayarak tüketiniz.',
      features: 'Komple sporcu destek paketi\n%29 avantajlı paket fiyatı\nWhey Protein + Creatine + Shaker bir arada\nProfesyonel sporcu onaylı kalite',
      description: 'Fitness yolculuğunuza güçlü ve eksiksiz bir başlangıç yapmanız için en popüler ürünlerimizi bir araya getirdik. Güç, toparlanma ve kas kütlesi için mükemmel kombinasyon.',
      nutritional_content: {
        ingredients: [
          { aroma: 'Standart', value: 'Whey Protein (Bisküvi aromalı) 1.6kg, Creatine Monohydrate 300g, BCAA 4:1:1 300g, OJS Karıştırıcı Shaker.' }
        ],
        nutrition_facts: {
          ingredients: [
            { name: 'Protein', amounts: ['24 g / servis'] },
            { name: 'Kreatin', amounts: ['5 g / servis'] },
            { name: 'BCAA', amounts: ['5 g / servis'] }
          ],
          portion_sizes: ['Kombinasyon']
        },
        amino_acid_facts: {
          ingredients: [
            { name: 'BCAA Kompleks', amounts: ['8.5 g'] }
          ],
          portion_sizes: ['Kombine Servis']
        }
      }
    },
    main_category_id: 'paket',
    sub_category_id: 'fitness',
    tags: ['PAKET', 'FITNESS', 'EKONOMİK', 'KOMBİNASYON'],
    variants: [
      {
        id: '3-full-pack',
        size: { gram: 2200, pieces: 3, total_services: 90 },
        aroma: 'Bisküvi + Karışık',
        price: { profit: 327, total_price: 1126, discounted_price: 799, price_per_servings: 799, discount_percentage: 29 },
        photo_src: fitnessPaketiImg,
        is_available: true
      }
    ],
    comment_count: 7650,
    average_star: 5
  },
  'gunluk-vitamin-paketi': {
    id: '11',
    name: 'GÜNLÜK VİTAMİN PAKETİ',
    slug: 'gunluk-vitamin-paketi',
    short_explanation: 'Günlük multivitamin, mineral ve antioksidan desteği.',
    explanation: {
      usage: 'Günde 2 kapsülü sabah veya öğle yemeğinden sonra bol su ile alınız.',
      features: '24 temel vitamin ve mineral\nBağışıklık sistemini destekler\nEnerji oluşum metabolizmasına katkıda bulunur\nKolay yutulabilir kapsül formu',
      description: 'Yoğun antrenman ve tempolu yaşam standartlarında vücudunuzun ihtiyaç duyduğu tüm mikro besin öğelerini eksiksiz karşılar.',
      nutritional_content: {
        ingredients: [
          { aroma: 'Kapsül', value: 'Vitamin A, C, D3, E, B-Kompleks Vitaminleri, Çinko Pikolinat, Magnezyum Sitrat, Selenyum.' }
        ],
        nutrition_facts: {
          ingredients: [
            { name: 'C Vitamini', amounts: ['250 mg', '%312 BRD'] },
            { name: 'D3 Vitamini', amounts: ['1000 IU', '%500 BRD'] },
            { name: 'Çinko', amounts: ['15 mg', '%150 BRD'] },
            { name: 'Magnezyum', amounts: ['100 mg', '%27 BRD'] }
          ],
          portion_sizes: ['2 Kapsül']
        },
        amino_acid_facts: {
          ingredients: [],
          portion_sizes: []
        }
      }
    },
    main_category_id: 'vitamin',
    sub_category_id: 'multivitamin',
    tags: ['VİTAMİN', 'BAĞIŞIKLIK', 'SAĞLIK', 'GÜNLÜK'],
    variants: [
      {
        id: '11-60cap',
        size: { gram: 120, pieces: 60, total_services: 30 },
        aroma: 'Kapsül',
        price: { profit: 198, total_price: 747, discounted_price: 549, price_per_servings: 18.3, discount_percentage: 26 },
        photo_src: gunlukVitaminImg,
        is_available: true
      }
    ],
    comment_count: 5013,
    average_star: 5
  },
  'pre-workout-supreme': {
    id: '12',
    name: 'PRE-WORKOUT SUPREME',
    slug: 'pre-workout-supreme',
    short_explanation: 'Antrenman öncesi patlayıcı güç, odaklanma ve yüksek kas pompası sağlayan formül.',
    explanation: {
      usage: 'Antrenmandan 20-30 dakika önce 1 ölçek (10g) ürünü 250ml soğuk su ile karıştırarak tüketiniz.',
      features: '300mg Kafein & 3.2g Beta-Alanin\n6g L-Citrulline Malat ile maksimum pompa\nYüksek odaklanma ve zihinsel uyanıklık\nŞeker içermez',
      description: 'En zorlu antrenmanlarda sınırlarınızı zorlamanız için tasarlanmış yüksek etkili antrenman öncesi performans artırıcı.',
      nutritional_content: {
        ingredients: [
          { aroma: 'Ekşi Elma', value: 'L-Citrulline Malat, Beta Alanin, Kafein Anhidroz, Taurin, Malik Asit, Sukraloz, Doğal Aroma.' },
          { aroma: 'Karpuz', value: 'L-Citrulline Malat, Beta Alanin, Kafein Anhidroz, Taurin, Malik Asit, Sukraloz, Karpuz Aroması.' }
        ],
        nutrition_facts: {
          ingredients: [
            { name: 'L-Citrulline', amounts: ['6000 mg'] },
            { name: 'Beta Alanine', amounts: ['3200 mg'] },
            { name: 'Kafein', amounts: ['300 mg'] },
            { name: 'Taurin', amounts: ['1000 mg'] }
          ],
          portion_sizes: ['10 g (1 Ölçek)']
        },
        amino_acid_facts: {
          ingredients: [],
          portion_sizes: []
        }
      }
    },
    main_category_id: 'pre-workout',
    sub_category_id: 'enerji',
    tags: ['PRE-WORKOUT', 'ENERJİ', 'GÜÇ', 'KAFEİN'],
    variants: [
      {
        id: '12-apple-300g',
        size: { gram: 300, pieces: 1, total_services: 30 },
        aroma: 'Ekşi Elma',
        price: { profit: null, total_price: 399, discounted_price: null, price_per_servings: 13.3, discount_percentage: null },
        photo_src: preworkoutImg,
        is_available: true
      },
      {
        id: '12-watermelon-300g',
        size: { gram: 300, pieces: 1, total_services: 30 },
        aroma: 'Karpuz',
        price: { profit: null, total_price: 399, discounted_price: null, price_per_servings: 13.3, discount_percentage: null },
        photo_src: preworkoutImg,
        is_available: true
      }
    ],
    comment_count: 6738,
    average_star: 5
  },
  'cream-of-rice': {
    id: '13',
    name: 'CREAM OF RICE',
    slug: 'cream-of-rice',
    short_explanation: 'Hızlı sindirilen, mükemmel lezzette kompleks karbonhidrat kaynağı pirinç kreması.',
    explanation: {
      usage: '1 ölçek (50g) ürünü 150-200ml sıcak su veya süt ile kıvam alana kadar karıştırarak tüketiniz.',
      features: 'Mükemmel sindirim, şişkinlik yapmaz\nGlutensiz ve vegan dostu\nAntrenman öncesi ve sonrası harika enerji\nEnfes aroma seçenekleri',
      description: 'Vücut geliştiriciler ve sporcular için temiz, hızlı emilen ve lezzetli karbonhidrat takviyesi.',
      nutritional_content: {
        ingredients: [
          { aroma: 'Bisküvi', value: 'Öğütülmüş Pirinç Unu, Doğal Bisküvi Aroması, Sukraloz, Tuz.' },
          { aroma: 'Çikolata', value: 'Öğütülmüş Pirinç Unu, Kakao Tozu, Sukraloz, Çikolata Aroması.' }
        ],
        nutrition_facts: {
          ingredients: [
            { name: 'Enerji', amounts: ['180 kcal'] },
            { name: 'Karbonhidrat', amounts: ['40 g'] },
            { name: 'Protein', amounts: ['4.1 g'] },
            { name: 'Yağ', amounts: ['0.6 g'] }
          ],
          portion_sizes: ['50 g Servis']
        },
        amino_acid_facts: {
          ingredients: [],
          portion_sizes: []
        }
      }
    },
    main_category_id: 'karbonhidrat',
    sub_category_id: 'pirinc',
    tags: ['KARBONHİDRAT', 'PİRİNÇ KREMASI', 'GLUTENSİZ', 'ENERJİ'],
    variants: [
      {
        id: '13-biscuit-1500g',
        size: { gram: 1500, pieces: 1, total_services: 30 },
        aroma: 'Bisküvi',
        price: { profit: null, total_price: 239, discounted_price: null, price_per_servings: 7.97, discount_percentage: null },
        photo_src: creamOfRiceImg,
        is_available: true
      },
      {
        id: '13-choc-1500g',
        size: { gram: 1500, pieces: 1, total_services: 30 },
        aroma: 'Çikolata',
        price: { profit: null, total_price: 239, discounted_price: null, price_per_servings: 7.97, discount_percentage: null },
        photo_src: creamOfRiceImg,
        is_available: true
      }
    ],
    comment_count: 5216,
    average_star: 5
  },
  'creatine': {
    id: '14',
    name: 'CREATINE MONOHYDRATE',
    slug: 'creatine',
    short_explanation: '%100 Saf 200 Mesh mikronize kreatin monohidrat tozu.',
    explanation: {
      usage: 'Günde 1 ölçek (5g) ürünü 200ml su veya meyve suyu ile karıştırarak antrenmandan önce veya sonra tüketiniz.',
      features: '%100 Saf Mikronize 200 Mesh\nKas gücünü ve patlayıcı gücü artırır\nATP üretimini hızlandırır\nKatkısız ve aromasız formül',
      description: 'Sporcu takviyeleri arasında etkinliği en çok kanıtlanmış kreatin monohidrat. Kas dayanıklılığınızı ve hücresel su tutumunu artırarak maksimum performans sağlar.',
      nutritional_content: {
        ingredients: [
          { aroma: 'Aromasız', value: '%100 Mikronize Kreatin Monohidrat (200 Mesh).' }
        ],
        nutrition_facts: {
          ingredients: [
            { name: 'Kreatin Monohidrat', amounts: ['5000 mg'] }
          ],
          portion_sizes: ['5 g (1 Ölçek)']
        },
        amino_acid_facts: {
          ingredients: [],
          portion_sizes: []
        }
      }
    },
    main_category_id: 'kreatin',
    sub_category_id: 'monohidrat',
    tags: ['KREATİN', 'GÜÇ', 'PERFORMANS', 'SAF'],
    variants: [
      {
        id: '14-unflavored-300g',
        size: { gram: 300, pieces: 1, total_services: 60 },
        aroma: 'Aromasız',
        price: { profit: null, total_price: 239, discounted_price: null, price_per_servings: 3.98, discount_percentage: null },
        photo_src: creatineImg,
        is_available: true
      }
    ],
    comment_count: 8558,
    average_star: 5
  }
}

// 4. Yardımcı Mock API Yanıt Fonksiyonları
export const getMockProductsResponse = (params: { page?: number; limit?: number } = {}): ApiProductsResponse => {
  const page = params.page || 1
  const limit = params.limit || 12
  const offset = (page - 1) * limit
  const results = mockProductsList.slice(offset, offset + limit)

  return {
    status: 'success',
    data: {
      count: mockProductsList.length,
      next: offset + limit < mockProductsList.length ? `?page=${page + 1}&limit=${limit}` : null,
      previous: page > 1 ? `?page=${page - 1}&limit=${limit}` : null,
      results
    }
  }
}

export const getMockProductDetailResponse = (slugOrId: string): ApiProductDetailResponse => {
  // 1. Slug tam eşleşme
  let detail = mockProductDetailsMap[slugOrId]

  // 2. ID ile eşleşme
  if (!detail) {
    detail = Object.values(mockProductDetailsMap).find(p => p.id === slugOrId || p.slug === slugOrId)!
  }

  // 3. Genel listeden bul ve dönüştür
  if (!detail) {
    const foundProduct = mockProductsList.find(p => p.slug === slugOrId || p.id === slugOrId)
    if (foundProduct) {
      detail = {
        id: foundProduct.id,
        name: foundProduct.name,
        slug: foundProduct.slug,
        short_explanation: foundProduct.short_explanation,
        explanation: {
          usage: '1 ölçek ürünü 200-250 ml su ile karıştırarak tüketiniz.',
          features: 'Yüksek kaliteli içerik\nÜstün saflık ve lezzet\nSporcu beslenmesine uygun formül',
          description: `${foundProduct.name}, günlük beslenme ve antrenman hedeflerinizi desteklemek üzere en yüksek kalite standartlarında formüle edilmiştir.`,
          nutritional_content: {
            ingredients: [{ aroma: 'Standart', value: 'Yüksek kaliteli ham maddeler, doğal aromalar.' }],
            nutrition_facts: {
              ingredients: [
                { name: 'Protein', amounts: ['20 g'] },
                { name: 'Enerji', amounts: ['115 kcal'] }
              ],
              portion_sizes: ['1 Servis']
            },
            amino_acid_facts: {
              ingredients: [],
              portion_sizes: []
            }
          }
        },
        main_category_id: 'supplement',
        sub_category_id: 'general',
        tags: ['TAKVİYE', 'SPORCU GIDASI'],
        variants: [
          {
            id: `${foundProduct.id}-var-1`,
            size: { gram: 400, pieces: 1, total_services: 16 },
            aroma: 'Standart',
            price: {
              profit: foundProduct.price_info.profit,
              total_price: foundProduct.price_info.total_price,
              discounted_price: foundProduct.price_info.discounted_price,
              price_per_servings: foundProduct.price_info.price_per_servings || 25,
              discount_percentage: foundProduct.price_info.discount_percentage
            },
            photo_src: foundProduct.photo_src,
            is_available: true
          }
        ],
        comment_count: foundProduct.comment_count,
        average_star: foundProduct.average_star
      }
    }
  }

  // 4. Son çare varsayılan whey-protein detayını ver
  if (!detail) {
    detail = mockProductDetailsMap['whey-protein']
  }

  return {
    status: 'success',
    data: detail
  }
}

export const getMockBestSellersResponse = (): ApiBestSellerResponse => {
  return {
    status: 'success',
    data: mockBestSellersData
  }
}
