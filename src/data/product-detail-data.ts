import type { ProductDetail } from '@/types/product'
import whey from '@/assets/whey-protein.jpg'
import fitness from '@/assets/fitness-paketi.png'
import gVitamin from '@/assets/gunluk-vitamin-paketi.png'
import preworkout from '@/assets/preworkout.png'
import cream from '@/assets/rice-of-cream.png'
import creatine from '@/assets/creatine.png'

export const productDetailData: ProductDetail[] = [
  {
    id: 1,
    name: 'WHEY PROTEIN',
    image: whey,
    description: 'EN ÇOK TERCİH EDİLEN PROTEİN TAKVİYESİ',
    shortDescription: 'Yüksek kaliteli whey protein tozu, kas gelişimi ve toparlanma için ideal.',
    reviewCount: 10869,
    rating: 5,
    price: 549,
    category: 'Protein',
    brand: 'OJS Nutrition',
    weight: '2.27 kg',
    servingSize: '1 scoop (30g)',
    servingsPerContainer: 76,
    pricePerServing: 34.31,
    
    // Aroma seçenekleri
    flavors: [
      { id: 'biscuit', name: 'Bisküvi', color: '#8B4513', isAvailable: true },
      { id: 'chocolate', name: 'Çikolata', color: '#3C2415', isAvailable: true },
      { id: 'banana', name: 'Muz', color: '#FFD700', isAvailable: true },
      { id: 'caramel', name: 'Salted Caramel', color: '#D2691E', isAvailable: true },
      { id: 'choco-nut', name: 'Choco Nut', color: '#654321', isAvailable: true },
      { id: 'coconut', name: 'Hindistan Cevizi', color: '#F5F5DC', isAvailable: true },
      { id: 'raspberry', name: 'Raspberry Cheesecake', color: '#DC143C', isAvailable: true },
      { id: 'strawberry', name: 'Çilek', color: '#FF69B4', isAvailable: true }
    ],
    selectedFlavor: 'biscuit',
    
    // Boyut seçenekleri
    sizes: [
      { 
        id: '400g', 
        name: '400G', 
        weight: '400g', 
        servings: 16, 
        price: 549, 
        isAvailable: true 
      },
      { 
        id: '1.6kg', 
        name: '1.6KG', 
        weight: '1.6kg', 
        servings: 64, 
        price: 1899, 
        isAvailable: true 
      },
      { 
        id: '1.6kg-x2', 
        name: '1.6KG X 2 ADET', 
        weight: '3.2kg', 
        servings: 128, 
        price: 3599, 
        originalPrice: 3798, 
        discountPercentage: 6, 
        isAvailable: true 
      }
    ],
    selectedSize: '400g',
    
    // Ürün etiketleri
    tags: ['protein', 'whey', 'kas-gelişimi', 'sporcu'],
    isVegetarian: true,
    isGlutenFree: true,
    isNew: false,
    isBestSeller: true,
    isFeatured: true,
    
    // Stok ve tarih
    inStock: true,
    stockQuantity: 150,
    expirationDate: '07.2025',
    
    // Detaylı bilgiler
    features: [
      'Yüksek protein içeriği (24g/servis)',
      'Hızlı emilim',
      'Lezzetli aromalar',
      'Gluten içermez',
      'Vejetaryen dostu'
    ],
    nutritionalInfo: {
      calories: 120,
      protein: 24,
      carbohydrates: 3,
      fat: 1,
      fiber: 0,
      sugar: 1,
      sodium: 140,
      cholesterol: 35,
      vitamins: [
        { name: 'Vitamin D', amount: 2, unit: 'mcg', dailyValue: 10 },
        { name: 'Vitamin B12', amount: 0.8, unit: 'mcg', dailyValue: 33 }
      ],
      minerals: [
        { name: 'Calcium', amount: 200, unit: 'mg', dailyValue: 15 },
        { name: 'Iron', amount: 0.5, unit: 'mg', dailyValue: 3 }
      ]
    },
    usageInstructions: '1 scoop (30g) ürünü 200-250ml su veya süt ile karıştırın. Antrenman sonrası veya günün herhangi bir saatinde tüketebilirsiniz.',
    ingredients: [
      'Whey Protein Concentrate',
      'Whey Protein Isolate',
      'Natural Vanilla Flavor',
      'Stevia',
      'Xanthan Gum'
    ],
    images: [whey]
  },
  {
    id: 2,
    name: 'FITNESS PAKETİ',
    image: fitness,
    description: 'EN POPÜLER ÜRÜNLER BİR ARADA',
    shortDescription: 'Fitness yolculuğunuz için ihtiyacınız olan tüm takviyeler tek pakette.',
    reviewCount: 7650,
    rating: 5,
    price: 799,
    originalPrice: 1126,
    discountPercentage: 29,
    category: 'Paket',
    brand: 'OJS Nutrition',
    weight: '3.5 kg',
    servingSize: 'Çeşitli',
    servingsPerContainer: 1,
    pricePerServing: 799,
    
    flavors: [],
    selectedFlavor: '',
    sizes: [
      { 
        id: 'package', 
        name: 'PAKET', 
        weight: '3.5kg', 
        servings: 1, 
        price: 799, 
        originalPrice: 1126, 
        discountPercentage: 29, 
        isAvailable: true 
      }
    ],
    selectedSize: 'package',
    
    tags: ['paket', 'fitness', 'komple', 'ekonomik'],
    isVegetarian: false,
    isGlutenFree: false,
    isNew: false,
    isBestSeller: true,
    isFeatured: true,
    
    inStock: true,
    stockQuantity: 75,
    expirationDate: '12.2025',
    
    features: [
      'Komple fitness çözümü',
      'Ekonomik paket fiyatı',
      'Tüm ihtiyaçlar tek pakette',
      'Profesyonel sporcu onaylı',
      'Kalite garantili'
    ],
    nutritionalInfo: {
      calories: 0,
      protein: 0,
      carbohydrates: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0,
      cholesterol: 0,
      vitamins: [],
      minerals: []
    },
    usageInstructions: 'Paket içindeki her ürünü kendi kullanım talimatlarına göre tüketin.',
    ingredients: [
      'Whey Protein',
      'Creatine Monohydrate',
      'BCAA',
      'Multivitamin',
      'Omega-3'
    ],
    images: [fitness]
  },
  {
    id: 3,
    name: 'GÜNLÜK VİTAMİN PAKETİ',
    image: gVitamin,
    description: 'EN SIK TÜKETİLEN TAKVİYELER',
    shortDescription: 'Günlük vitamin ihtiyacınızı karşılayan kapsamlı takviye paketi.',
    reviewCount: 5013,
    rating: 5,
    price: 549,
    originalPrice: 717,
    discountPercentage: 23,
    category: 'Vitamin',
    brand: 'OJS Nutrition',
    weight: '500g',
    servingSize: '2 kapsül',
    servingsPerContainer: 60,
    pricePerServing: 9.15,
    
    flavors: [],
    selectedFlavor: '',
    sizes: [
      { 
        id: '500g', 
        name: '500G', 
        weight: '500g', 
        servings: 60, 
        price: 549, 
        originalPrice: 717, 
        discountPercentage: 23, 
        isAvailable: true 
      }
    ],
    selectedSize: '500g',
    
    tags: ['vitamin', 'günlük', 'bağışıklık', 'enerji'],
    isVegetarian: true,
    isGlutenFree: true,
    isNew: false,
    isBestSeller: true,
    isFeatured: false,
    
    inStock: true,
    stockQuantity: 200,
    expirationDate: '12.2025',
    
    features: [
      'Günlük vitamin ihtiyacını karşılar',
      'Bağışıklık sistemini güçlendirir',
      'Enerji seviyesini artırır',
      'Antioksidan özellik',
      'Kolay kullanım'
    ],
    nutritionalInfo: {
      calories: 5,
      protein: 0,
      carbohydrates: 1,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 5,
      cholesterol: 0,
      vitamins: [
        { name: 'Vitamin A', amount: 800, unit: 'mcg', dailyValue: 100 },
        { name: 'Vitamin C', amount: 60, unit: 'mg', dailyValue: 100 },
        { name: 'Vitamin D3', amount: 10, unit: 'mcg', dailyValue: 50 },
        { name: 'Vitamin E', amount: 15, unit: 'mg', dailyValue: 100 }
      ],
      minerals: [
        { name: 'Calcium', amount: 200, unit: 'mg', dailyValue: 20 },
        { name: 'Iron', amount: 14, unit: 'mg', dailyValue: 100 },
        { name: 'Zinc', amount: 15, unit: 'mg', dailyValue: 100 }
      ]
    },
    usageInstructions: 'Günde 2 kapsülü yemeklerle birlikte bol su ile tüketin.',
    ingredients: [
      'Vitamin A',
      'Vitamin C',
      'Vitamin D3',
      'Vitamin E',
      'B Kompleks Vitaminleri',
      'Mineraller'
    ],
    images: [gVitamin]
  },
  {
    id: 4,
    name: 'PRE-WORKOUT SUPREME',
    image: preworkout,
    description: 'ANTRENMAN ÖNCESİ TAKVİYE',
    shortDescription: 'Antrenman öncesi enerji ve performans artırıcı takviye.',
    reviewCount: 6738,
    rating: 5,
    price: 399,
    category: 'Pre-Workout',
    brand: 'OJS Nutrition',
    weight: '300g',
    servingSize: '1 scoop (10g)',
    servingsPerContainer: 30,
    pricePerServing: 13.30,
    
    flavors: [],
    selectedFlavor: '',
    sizes: [
      { 
        id: '300g', 
        name: '300G', 
        weight: '300g', 
        servings: 30, 
        price: 399, 
        isAvailable: true 
      }
    ],
    selectedSize: '300g',
    
    tags: ['pre-workout', 'enerji', 'performans', 'kafein'],
    isVegetarian: false,
    isGlutenFree: true,
    isNew: false,
    isBestSeller: true,
    isFeatured: false,
    
    inStock: true,
    stockQuantity: 120,
    expirationDate: '12.2025',
    
    features: [
      'Antrenman öncesi enerji artışı',
      'Daha uzun süre antrenman yapabilme',
      'Odaklanma ve konsantrasyon artışı',
      'Pompa ve kas dolgunluğu',
      'Yorgunluk hissini azaltma'
    ],
    nutritionalInfo: {
      calories: 25,
      protein: 0,
      carbohydrates: 6,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 200,
      cholesterol: 0,
      vitamins: [
        { name: 'Vitamin B6', amount: 2, unit: 'mg', dailyValue: 118 },
        { name: 'Vitamin B12', amount: 6, unit: 'mcg', dailyValue: 250 }
      ],
      minerals: [
        { name: 'Sodium', amount: 200, unit: 'mg', dailyValue: 9 },
        { name: 'Potassium', amount: 100, unit: 'mg', dailyValue: 3 }
      ]
    },
    usageInstructions: 'Antrenman öncesi 30-45 dakika önce 1 scoop (10g) ürünü 200-250ml su ile karıştırıp tüketin.',
    ingredients: [
      'Caffeine Anhydrous',
      'Beta-Alanine',
      'Creatine Monohydrate',
      'L-Citrulline',
      'L-Arginine',
      'Natural Flavors'
    ],
    images: [preworkout]
  },
  {
    id: 5,
    name: 'CREAM OF RICE',
    image: cream,
    description: 'EN LEZZETLİ PİRİNÇ KREMASI',
    shortDescription: 'Antrenman sonrası karbonhidrat ihtiyacınızı karşılayan lezzetli pirinç kreması.',
    reviewCount: 5216,
    rating: 5,
    price: 239,
    category: 'Karbonhidrat',
    brand: 'OJS Nutrition',
    weight: '1.5 kg',
    servingSize: '1 scoop (50g)',
    servingsPerContainer: 30,
    pricePerServing: 7.97,
    
    flavors: [],
    selectedFlavor: '',
    sizes: [
      { 
        id: '1.5kg', 
        name: '1.5KG', 
        weight: '1.5kg', 
        servings: 30, 
        price: 239, 
        isAvailable: true 
      }
    ],
    selectedSize: '1.5kg',
    
    tags: ['karbonhidrat', 'pirinç', 'toparlanma', 'lezzetli'],
    isVegetarian: true,
    isGlutenFree: true,
    isNew: false,
    isBestSeller: true,
    isFeatured: false,
    
    inStock: true,
    stockQuantity: 180,
    expirationDate: '12.2025',
    
    features: [
      'Hızlı karbonhidrat kaynağı',
      'Antrenman sonrası toparlanma',
      'Lezzetli ve doyurucu',
      'Gluten içermez',
      'Kolay hazırlanır'
    ],
    nutritionalInfo: {
      calories: 180,
      protein: 4,
      carbohydrates: 38,
      fat: 1,
      fiber: 1,
      sugar: 2,
      sodium: 150,
      cholesterol: 0,
      vitamins: [],
      minerals: [
        { name: 'Sodium', amount: 150, unit: 'mg', dailyValue: 7 },
        { name: 'Potassium', amount: 50, unit: 'mg', dailyValue: 1 }
      ]
    },
    usageInstructions: '1 scoop (50g) ürünü 200ml sıcak su veya süt ile karıştırın. Antrenman sonrası tüketin.',
    ingredients: [
      'Rice Flour',
      'Natural Vanilla Flavor',
      'Stevia',
      'Xanthan Gum',
      'Salt'
    ],
    images: [cream]
  },
  {
    id: 6,
    name: 'CREATINE',
    image: creatine,
    description: 'EN POPÜLER SPORCU TAKVİYESİ',
    shortDescription: 'Kas gücü ve performans artırıcı en etkili creatine monohydrate.',
    reviewCount: 8558,
    rating: 5,
    price: 239,
    category: 'Creatine',
    brand: 'OJS Nutrition',
    weight: '500g',
    servingSize: '1 scoop (5g)',
    servingsPerContainer: 100,
    pricePerServing: 2.39,
    
    flavors: [],
    selectedFlavor: '',
    sizes: [
      { 
        id: '500g', 
        name: '500G', 
        weight: '500g', 
        servings: 100, 
        price: 239, 
        isAvailable: true 
      }
    ],
    selectedSize: '500g',
    
    tags: ['creatine', 'güç', 'performans', 'kas'],
    isVegetarian: true,
    isGlutenFree: true,
    isNew: false,
    isBestSeller: true,
    isFeatured: false,
    
    inStock: true,
    stockQuantity: 250,
    expirationDate: '12.2025',
    
    features: [
      'Kas gücü ve performans artışı',
      'Antrenman süresini uzatır',
      'Kas kütlesi artışı',
      'Hızlı enerji sağlar',
      'Bilimsel olarak kanıtlanmış'
    ],
    nutritionalInfo: {
      calories: 20,
      protein: 0,
      carbohydrates: 5,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0,
      cholesterol: 0,
      vitamins: [],
      minerals: []
    },
    usageInstructions: 'Günde 1 scoop (5g) ürünü su veya meyve suyu ile karıştırıp tüketin. Antrenman öncesi veya sonrası alabilirsiniz.',
    ingredients: [
      'Creatine Monohydrate',
      'Natural Flavor',
      'Stevia'
    ],
    images: [creatine]
  }
]

// Ürün ID'sine göre ürün getiren fonksiyon
export const getProductById = (id: number): ProductDetail | undefined => {
  return productDetailData.find(product => product.id === id)
}

// Benzer ürünleri getiren fonksiyon
export const getRelatedProducts = (limit: number = 6): ProductDetail[] => {
  // Tüm ürünleri dahil et (mevcut ürün dahil)
  return productDetailData.slice(0, limit)
}
