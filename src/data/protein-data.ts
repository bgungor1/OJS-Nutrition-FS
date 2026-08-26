import type { ProductDetail } from '@/types/product'
import wheyProtein from '@/assets/protein-list/whey-protein.jpg'
import wheyIsolate from '@/assets/protein-list/whey-isolate.jpg'
import fitnessPaketi from '@/assets/protein-list/fitness-paketi.jpg'
import peaProtein from '@/assets/protein-list/pea-protein.jpg'
import micellarCasein from '@/assets/protein-list/miclar-casein.jpg'
import eggWhite from '@/assets/protein-list/egg-with.jpg'
import milkProtein from '@/assets/protein-list/milk-protein.png'
import soyaProtein from '@/assets/protein-list/soya-protein.png'
import proteinBar2li from '@/assets/protein-list/protein-bar-2-li.png'
import massGainer from '@/assets/protein-list/mass-gainer.png'
import proteinBar from '@/assets/protein-list/protein-bar.png'
import collagenCoffee from '@/assets/protein-list/collagen-coffe.png'

export const proteinData: ProductDetail[] = [
  {
    id: 1,
    name: 'WHEY PROTEIN',
    image: wheyProtein,
    description: 'EN ÇOK TERCİH EDİLEN PROTEİN TAKVİYESİ',
    shortDescription: 'Yüksek kaliteli whey protein tozu, kas gelişimi ve toparlanma için ideal.',
    reviewCount: 10880,
    rating: 5,
    price: 549,
    category: 'Protein',
    brand: 'OJS Nutrition',
    weight: '2.27 kg',
    servingSize: '1 scoop (30g)',
    servingsPerContainer: 76,
    pricePerServing: 7.22,
    
    flavors: [
      { id: 'biscuit', name: 'Bisküvi', color: '#8B4513', isAvailable: true },
      { id: 'chocolate', name: 'Çikolata', color: '#3C2415', isAvailable: true },
      { id: 'banana', name: 'Muz', color: '#FFD700', isAvailable: true },
      { id: 'caramel', name: 'Salted Caramel', color: '#D2691E', isAvailable: true },
      { id: 'choco-nut', name: 'Choco Nut', color: '#654321', isAvailable: true },
      { id: 'strawberry', name: 'Çilek', color: '#FF69B4', isAvailable: true }
    ],
    selectedFlavor: 'biscuit',
    
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
      }
    ],
    selectedSize: '400g',
    
    tags: ['protein', 'whey', 'kas-gelişimi', 'sporcu'],
    isVegetarian: true,
    isGlutenFree: true,
    isNew: false,
    isBestSeller: true,
    isFeatured: true,
    
    inStock: true,
    stockQuantity: 150,
    expirationDate: '07.2025',
    
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
    images: [wheyProtein]
  },
  {
    id: 2,
    name: 'WHEY ISOLATE',
    image: wheyIsolate,
    description: '590 PROTEINLIEN SAF WHEY',
    shortDescription: 'Saf whey protein isolate, maksimum protein içeriği ile.',
    reviewCount: 887,
    rating: 4.5,
    price: 749,
    category: 'Protein',
    brand: 'OJS Nutrition',
    weight: '1.8 kg',
    servingSize: '1 scoop (30g)',
    servingsPerContainer: 60,
    pricePerServing: 12.48,
    
    flavors: [
      { id: 'vanilla', name: 'Vanilya', color: '#F5F5DC', isAvailable: true },
      { id: 'chocolate', name: 'Çikolata', color: '#3C2415', isAvailable: true },
      { id: 'strawberry', name: 'Çilek', color: '#FF69B4', isAvailable: true }
    ],
    selectedFlavor: 'vanilla',
    
    sizes: [
      { 
        id: '1.8kg', 
        name: '1.8KG', 
        weight: '1.8kg', 
        servings: 60, 
        price: 749, 
        isAvailable: true 
      }
    ],
    selectedSize: '1.8kg',
    
    tags: ['protein', 'whey', 'isolate', 'saf'],
    isVegetarian: true,
    isGlutenFree: true,
    isNew: false,
    isBestSeller: false,
    isFeatured: false,
    
    inStock: true,
    stockQuantity: 80,
    expirationDate: '08.2025',
    
    features: [
      'Saf whey protein isolate',
      'Yüksek protein içeriği (30g/servis)',
      'Düşük karbonhidrat ve yağ',
      'Hızlı emilim',
      'Laktoz içermez'
    ],
    nutritionalInfo: {
      calories: 110,
      protein: 30,
      carbohydrates: 1,
      fat: 0.5,
      fiber: 0,
      sugar: 0,
      sodium: 120,
      cholesterol: 0,
      vitamins: [],
      minerals: [
        { name: 'Calcium', amount: 150, unit: 'mg', dailyValue: 12 },
        { name: 'Sodium', amount: 120, unit: 'mg', dailyValue: 5 }
      ]
    },
    usageInstructions: '1 scoop (30g) ürünü 200-250ml su ile karıştırın. Antrenman sonrası tüketin.',
    ingredients: [
      'Whey Protein Isolate',
      'Natural Flavor',
      'Stevia',
      'Xanthan Gum'
    ],
    images: [wheyIsolate]
  },
  {
    id: 3,
    name: 'FITNESS PAKETİ',
    image: fitnessPaketi,
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
    images: [fitnessPaketi]
  },
  {
    id: 4,
    name: 'PEA PROTEIN',
    image: peaProtein,
    description: 'EN POPÜLER VEGAN PROTEIN KAYNAĞI',
    shortDescription: 'Bitkisel protein kaynağı, vegan dostu ve yüksek kaliteli.',
    reviewCount: 1778,
    rating: 4,
    price: 349,
    category: 'Protein',
    brand: 'OJS Nutrition',
    weight: '1 kg',
    servingSize: '1 scoop (25g)',
    servingsPerContainer: 40,
    pricePerServing: 8.73,
    
    flavors: [
      { id: 'vanilla', name: 'Vanilya', color: '#F5F5DC', isAvailable: true },
      { id: 'chocolate', name: 'Çikolata', color: '#3C2415', isAvailable: true },
      { id: 'unflavored', name: 'Aromasız', color: '#8B7355', isAvailable: true }
    ],
    selectedFlavor: 'vanilla',
    
    sizes: [
      { 
        id: '1kg', 
        name: '1KG', 
        weight: '1kg', 
        servings: 40, 
        price: 349, 
        isAvailable: true 
      }
    ],
    selectedSize: '1kg',
    
    tags: ['protein', 'vegan', 'bitkisel', 'pea'],
    isVegetarian: true,
    isGlutenFree: true,
    isNew: false,
    isBestSeller: false,
    isFeatured: false,
    
    inStock: true,
    stockQuantity: 120,
    expirationDate: '10.2025',
    
    features: [
      'Tamamen bitkisel protein',
      'Vegan ve vejetaryen dostu',
      'Yüksek protein içeriği (20g/servis)',
      'Kolay sindirilebilir',
      'Gluten içermez'
    ],
    nutritionalInfo: {
      calories: 100,
      protein: 20,
      carbohydrates: 2,
      fat: 1,
      fiber: 1,
      sugar: 0,
      sodium: 50,
      cholesterol: 0,
      vitamins: [],
      minerals: [
        { name: 'Iron', amount: 2, unit: 'mg', dailyValue: 11 },
        { name: 'Calcium', amount: 100, unit: 'mg', dailyValue: 8 }
      ]
    },
    usageInstructions: '1 scoop (25g) ürünü 200-250ml su veya bitkisel süt ile karıştırın.',
    ingredients: [
      'Pea Protein Isolate',
      'Natural Flavor',
      'Stevia',
      'Xanthan Gum'
    ],
    images: [peaProtein]
  },
  {
    id: 5,
    name: 'MICELLAR CASEIN',
    image: micellarCasein,
    description: 'YAVAŞ SİNDİRİLEN PROTEIN KAYNAĞI',
    shortDescription: 'Gece boyunca kas gelişimini destekleyen yavaş sindirilen protein.',
    reviewCount: 166,
    rating: 4,
    price: 599,
    category: 'Protein',
    brand: 'OJS Nutrition',
    weight: '1.5 kg',
    servingSize: '1 scoop (30g)',
    servingsPerContainer: 50,
    pricePerServing: 11.98,
    
    flavors: [
      { id: 'vanilla', name: 'Vanilya', color: '#F5F5DC', isAvailable: true },
      { id: 'chocolate', name: 'Çikolata', color: '#3C2415', isAvailable: true }
    ],
    selectedFlavor: 'vanilla',
    
    sizes: [
      { 
        id: '1.5kg', 
        name: '1.5KG', 
        weight: '1.5kg', 
        servings: 50, 
        price: 599, 
        isAvailable: true 
      }
    ],
    selectedSize: '1.5kg',
    
    tags: ['protein', 'casein', 'gece', 'yavaş-sindirim'],
    isVegetarian: true,
    isGlutenFree: true,
    isNew: false,
    isBestSeller: false,
    isFeatured: false,
    
    inStock: true,
    stockQuantity: 90,
    expirationDate: '09.2025',
    
    features: [
      'Yavaş sindirilen protein',
      'Gece boyunca amino asit sağlar',
      'Kas yıkımını önler',
      'Tokluk hissi verir',
      'Yüksek kaliteli casein'
    ],
    nutritionalInfo: {
      calories: 120,
      protein: 25,
      carbohydrates: 2,
      fat: 1,
      fiber: 0,
      sugar: 1,
      sodium: 100,
      cholesterol: 30,
      vitamins: [],
      minerals: [
        { name: 'Calcium', amount: 300, unit: 'mg', dailyValue: 23 },
        { name: 'Sodium', amount: 100, unit: 'mg', dailyValue: 4 }
      ]
    },
    usageInstructions: '1 scoop (30g) ürünü 200-250ml su veya süt ile karıştırın. Yatmadan önce tüketin.',
    ingredients: [
      'Micellar Casein',
      'Natural Flavor',
      'Stevia',
      'Xanthan Gum'
    ],
    images: [micellarCasein]
  },
  {
    id: 6,
    name: 'EGG WHITE POWDER',
    image: eggWhite,
    description: 'PROTEININ ALTIN STANDARTI',
    shortDescription: 'Yumurta beyazı protein tozu, en yüksek biyolojik değere sahip.',
    reviewCount: 339,
    rating: 4.5,
    price: 899,
    category: 'Protein',
    brand: 'OJS Nutrition',
    weight: '1.2 kg',
    servingSize: '1 scoop (25g)',
    servingsPerContainer: 48,
    pricePerServing: 18.75,
    
    flavors: [
      { id: 'unflavored', name: 'Aromasız', color: '#8B7355', isAvailable: true },
      { id: 'vanilla', name: 'Vanilya', color: '#F5F5DC', isAvailable: true }
    ],
    selectedFlavor: 'unflavored',
    
    sizes: [
      { 
        id: '1.2kg', 
        name: '1.2KG', 
        weight: '1.2kg', 
        servings: 48, 
        price: 899, 
        isAvailable: true 
      }
    ],
    selectedSize: '1.2kg',
    
    tags: ['protein', 'yumurta', 'altın-standart', 'yüksek-kalite'],
    isVegetarian: true,
    isGlutenFree: true,
    isNew: false,
    isBestSeller: false,
    isFeatured: false,
    
    inStock: true,
    stockQuantity: 60,
    expirationDate: '11.2025',
    
    features: [
      'En yüksek biyolojik değer',
      'Tam amino asit profili',
      'Hızlı emilim',
      'Laktoz içermez',
      'Doğal protein kaynağı'
    ],
    nutritionalInfo: {
      calories: 100,
      protein: 22,
      carbohydrates: 1,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 80,
      cholesterol: 0,
      vitamins: [],
      minerals: [
        { name: 'Sodium', amount: 80, unit: 'mg', dailyValue: 3 },
        { name: 'Potassium', amount: 50, unit: 'mg', dailyValue: 1 }
      ]
    },
    usageInstructions: '1 scoop (25g) ürünü 200-250ml su ile karıştırın. Herhangi bir zamanda tüketebilirsiniz.',
    ingredients: [
      'Egg White Protein',
      'Natural Flavor (if flavored)',
      'Stevia (if flavored)'
    ],
    images: [eggWhite]
  },
  {
    id: 7,
    name: 'MILK PROTEIN',
    image: milkProtein,
    description: '180 KAZEIN, 120 WHEY PROTEIN',
    shortDescription: 'Kazein ve whey protein karışımı, hem hızlı hem yavaş sindirim.',
    reviewCount: 205,
    rating: 4,
    price: 699,
    category: 'Protein',
    brand: 'OJS Nutrition',
    weight: '2 kg',
    servingSize: '1 scoop (30g)',
    servingsPerContainer: 67,
    pricePerServing: 10.43,
    
    flavors: [
      { id: 'vanilla', name: 'Vanilya', color: '#F5F5DC', isAvailable: true },
      { id: 'chocolate', name: 'Çikolata', color: '#3C2415', isAvailable: true },
      { id: 'strawberry', name: 'Çilek', color: '#FF69B4', isAvailable: true }
    ],
    selectedFlavor: 'vanilla',
    
    sizes: [
      { 
        id: '2kg', 
        name: '2KG', 
        weight: '2kg', 
        servings: 67, 
        price: 699, 
        isAvailable: true 
      }
    ],
    selectedSize: '2kg',
    
    tags: ['protein', 'milk', 'kazein', 'whey', 'karışım'],
    isVegetarian: true,
    isGlutenFree: true,
    isNew: false,
    isBestSeller: false,
    isFeatured: false,
    
    inStock: true,
    stockQuantity: 100,
    expirationDate: '10.2025',
    
    features: [
      'Kazein ve whey karışımı',
      'Hem hızlı hem yavaş emilim',
      'Uzun süreli protein desteği',
      'Doğal süt proteinleri',
      'Yüksek kaliteli'
    ],
    nutritionalInfo: {
      calories: 110,
      protein: 23,
      carbohydrates: 2,
      fat: 1,
      fiber: 0,
      sugar: 1,
      sodium: 120,
      cholesterol: 25,
      vitamins: [],
      minerals: [
        { name: 'Calcium', amount: 250, unit: 'mg', dailyValue: 19 },
        { name: 'Sodium', amount: 120, unit: 'mg', dailyValue: 5 }
      ]
    },
    usageInstructions: '1 scoop (30g) ürünü 200-250ml su veya süt ile karıştırın.',
    ingredients: [
      'Milk Protein Concentrate',
      'Whey Protein Concentrate',
      'Natural Flavor',
      'Stevia',
      'Xanthan Gum'
    ],
    images: [milkProtein]
  },
  {
    id: 8,
    name: 'SOYA PROTEIN',
    image: soyaProtein,
    description: 'VEGAN PROTEIN KAYNAĞI',
    shortDescription: 'Soya protein tozu, bitkisel protein kaynağı.',
    reviewCount: 214,
    rating: 4,
    price: 449,
    category: 'Protein',
    brand: 'OJS Nutrition',
    weight: '1.5 kg',
    servingSize: '1 scoop (25g)',
    servingsPerContainer: 60,
    pricePerServing: 7.48,
    
    flavors: [
      { id: 'vanilla', name: 'Vanilya', color: '#F5F5DC', isAvailable: true },
      { id: 'chocolate', name: 'Çikolata', color: '#3C2415', isAvailable: true },
      { id: 'unflavored', name: 'Aromasız', color: '#8B7355', isAvailable: true }
    ],
    selectedFlavor: 'vanilla',
    
    sizes: [
      { 
        id: '1.5kg', 
        name: '1.5KG', 
        weight: '1.5kg', 
        servings: 60, 
        price: 449, 
        isAvailable: true 
      }
    ],
    selectedSize: '1.5kg',
    
    tags: ['protein', 'soya', 'vegan', 'bitkisel'],
    isVegetarian: true,
    isGlutenFree: true,
    isNew: false,
    isBestSeller: false,
    isFeatured: false,
    
    inStock: true,
    stockQuantity: 85,
    expirationDate: '12.2025',
    
    features: [
      'Bitkisel protein kaynağı',
      'Vegan ve vejetaryen dostu',
      'Yüksek protein içeriği (22g/servis)',
      'Ekonomik fiyat',
      'Kolay sindirilebilir'
    ],
    nutritionalInfo: {
      calories: 95,
      protein: 22,
      carbohydrates: 1,
      fat: 1,
      fiber: 2,
      sugar: 0,
      sodium: 40,
      cholesterol: 0,
      vitamins: [],
      minerals: [
        { name: 'Iron', amount: 3, unit: 'mg', dailyValue: 17 },
        { name: 'Calcium', amount: 80, unit: 'mg', dailyValue: 6 }
      ]
    },
    usageInstructions: '1 scoop (25g) ürünü 200-250ml su veya bitkisel süt ile karıştırın.',
    ingredients: [
      'Soy Protein Isolate',
      'Natural Flavor',
      'Stevia',
      'Xanthan Gum'
    ],
    images: [soyaProtein]
  },
  {
    id: 9,
    name: 'PROTEIN BAR 2\'Lİ PAKET',
    image: proteinBar2li,
    description: '30 PROTEIN, ŞEKER İLAVESİZ',
    shortDescription: 'Pratik protein bar, şeker ilavesiz ve yüksek protein içeriği.',
    reviewCount: 166,
    rating: 4,
    price: 59,
    originalPrice: 90,
    discountPercentage: 34,
    category: 'Protein Bar',
    brand: 'OJS Nutrition',
    weight: '100g',
    servingSize: '1 bar (50g)',
    servingsPerContainer: 2,
    pricePerServing: 29.5,
    
    flavors: [
      { id: 'chocolate', name: 'Çikolata', color: '#3C2415', isAvailable: true },
      { id: 'vanilla', name: 'Vanilya', color: '#F5F5DC', isAvailable: true }
    ],
    selectedFlavor: 'chocolate',
    
    sizes: [
      { 
        id: '2pack', 
        name: '2\'Lİ PAKET', 
        weight: '100g', 
        servings: 2, 
        price: 59, 
        originalPrice: 90, 
        discountPercentage: 34, 
        isAvailable: true 
      }
    ],
    selectedSize: '2pack',
    
    tags: ['protein-bar', 'pratik', 'şekersiz', 'yüksek-protein'],
    isVegetarian: true,
    isGlutenFree: true,
    isNew: false,
    isBestSeller: false,
    isFeatured: false,
    
    inStock: true,
    stockQuantity: 200,
    expirationDate: '08.2025',
    
    features: [
      'Yüksek protein içeriği (15g/bar)',
      'Şeker ilavesiz',
      'Pratik kullanım',
      'Lezzetli',
      'Antrenman sonrası ideal'
    ],
    nutritionalInfo: {
      calories: 200,
      protein: 15,
      carbohydrates: 12,
      fat: 8,
      fiber: 3,
      sugar: 2,
      sodium: 150,
      cholesterol: 0,
      vitamins: [],
      minerals: [
        { name: 'Sodium', amount: 150, unit: 'mg', dailyValue: 7 },
        { name: 'Potassium', amount: 100, unit: 'mg', dailyValue: 2 }
      ]
    },
    usageInstructions: 'Antrenman sonrası veya ara öğün olarak tüketin.',
    ingredients: [
      'Whey Protein',
      'Almonds',
      'Natural Flavor',
      'Stevia',
      'Cocoa Powder'
    ],
    images: [proteinBar2li]
  },
  {
    id: 10,
    name: 'MASS GAINER LANSMAN',
    image: massGainer,
    description: 'YÜKSEK KALORİLİ PRATİK ÜRÜN',
    shortDescription: 'Kilo almak isteyenler için yüksek kalorili mass gainer.',
    reviewCount: 339,
    rating: 4,
    price: 699,
    originalPrice: 900,
    discountPercentage: 30,
    category: 'Mass Gainer',
    brand: 'OJS Nutrition',
    weight: '3 kg',
    servingSize: '1 scoop (100g)',
    servingsPerContainer: 30,
    pricePerServing: 23.3,
    
    flavors: [
      { id: 'vanilla', name: 'Vanilya', color: '#F5F5DC', isAvailable: true },
      { id: 'chocolate', name: 'Çikolata', color: '#3C2415', isAvailable: true },
      { id: 'strawberry', name: 'Çilek', color: '#FF69B4', isAvailable: true }
    ],
    selectedFlavor: 'vanilla',
    
    sizes: [
      { 
        id: '3kg', 
        name: '3KG', 
        weight: '3kg', 
        servings: 30, 
        price: 699, 
        originalPrice: 900, 
        discountPercentage: 30, 
        isAvailable: true 
      }
    ],
    selectedSize: '3kg',
    
    tags: ['mass-gainer', 'kilo-alma', 'yüksek-kalori', 'karbonhidrat'],
    isVegetarian: true,
    isGlutenFree: true,
    isNew: false,
    isBestSeller: false,
    isFeatured: false,
    
    inStock: true,
    stockQuantity: 70,
    expirationDate: '09.2025',
    
    features: [
      'Yüksek kalori içeriği (400kcal/servis)',
      'Protein ve karbonhidrat karışımı',
      'Kilo alımı için ideal',
      'Lezzetli aromalar',
      'Kolay hazırlanır'
    ],
    nutritionalInfo: {
      calories: 400,
      protein: 25,
      carbohydrates: 60,
      fat: 8,
      fiber: 2,
      sugar: 15,
      sodium: 200,
      cholesterol: 0,
      vitamins: [
        { name: 'Vitamin C', amount: 30, unit: 'mg', dailyValue: 33 },
        { name: 'Vitamin B6', amount: 2, unit: 'mg', dailyValue: 118 }
      ],
      minerals: [
        { name: 'Sodium', amount: 200, unit: 'mg', dailyValue: 9 },
        { name: 'Potassium', amount: 300, unit: 'mg', dailyValue: 6 }
      ]
    },
    usageInstructions: '1 scoop (100g) ürünü 300-400ml su veya süt ile karıştırın. Antrenman sonrası tüketin.',
    ingredients: [
      'Whey Protein',
      'Maltodextrin',
      'Oats',
      'Natural Flavor',
      'Stevia'
    ],
    images: [massGainer]
  },
  {
    id: 11,
    name: 'PROTEIN BAR',
    image: proteinBar,
    description: '1:30 PROTEIN, ŞEKER İLAVESİZ',
    shortDescription: 'Tekli protein bar, pratik ve besleyici.',
    reviewCount: 508,
    rating: 4,
    price: 249,
    originalPrice: 349,
    discountPercentage: 29,
    category: 'Protein Bar',
    brand: 'OJS Nutrition',
    weight: '50g',
    servingSize: '1 bar (50g)',
    servingsPerContainer: 1,
    pricePerServing: 249,
    
    flavors: [
      { id: 'chocolate', name: 'Çikolata', color: '#3C2415', isAvailable: true },
      { id: 'vanilla', name: 'Vanilya', color: '#F5F5DC', isAvailable: true },
      { id: 'peanut', name: 'Fıstık', color: '#8B4513', isAvailable: true }
    ],
    selectedFlavor: 'chocolate',
    
    sizes: [
      { 
        id: '50g', 
        name: '50G', 
        weight: '50g', 
        servings: 1, 
        price: 249, 
        originalPrice: 349, 
        discountPercentage: 29, 
        isAvailable: true 
      }
    ],
    selectedSize: '50g',
    
    tags: ['protein-bar', 'pratik', 'şekersiz', 'tekli'],
    isVegetarian: true,
    isGlutenFree: true,
    isNew: false,
    isBestSeller: false,
    isFeatured: false,
    
    inStock: true,
    stockQuantity: 300,
    expirationDate: '07.2025',
    
    features: [
      'Yüksek protein içeriği (15g/bar)',
      'Şeker ilavesiz',
      'Pratik kullanım',
      'Lezzetli',
      'Tekli paket'
    ],
    nutritionalInfo: {
      calories: 180,
      protein: 15,
      carbohydrates: 10,
      fat: 6,
      fiber: 2,
      sugar: 1,
      sodium: 120,
      cholesterol: 0,
      vitamins: [],
      minerals: [
        { name: 'Sodium', amount: 120, unit: 'mg', dailyValue: 5 },
        { name: 'Potassium', amount: 80, unit: 'mg', dailyValue: 2 }
      ]
    },
    usageInstructions: 'Antrenman sonrası veya ara öğün olarak tüketin.',
    ingredients: [
      'Whey Protein',
      'Almonds',
      'Natural Flavor',
      'Stevia',
      'Cocoa Powder'
    ],
    images: [proteinBar]
  },
  {
    id: 12,
    name: 'COLLAGEN COFFEE',
    image: collagenCoffee,
    description: 'KAHVE İLE KOLAJEN BİRLEŞİMİ',
    shortDescription: 'Kahve sevenler için kolajen destekli protein karışımı.',
    reviewCount: 377,
    rating: 4,
    price: 349,
    category: 'Protein',
    brand: 'OJS Nutrition',
    weight: '500g',
    servingSize: '1 scoop (20g)',
    servingsPerContainer: 25,
    pricePerServing: 13.96,
    
    flavors: [
      { id: 'coffee', name: 'Kahve', color: '#8B4513', isAvailable: true },
      { id: 'mocha', name: 'Mocha', color: '#3C2415', isAvailable: true }
    ],
    selectedFlavor: 'coffee',
    
    sizes: [
      { 
        id: '500g', 
        name: '500G', 
        weight: '500g', 
        servings: 25, 
        price: 349, 
        isAvailable: true 
      }
    ],
    selectedSize: '500g',
    
    tags: ['protein', 'kolajen', 'kahve', 'cilt-sağlığı'],
    isVegetarian: true,
    isGlutenFree: true,
    isNew: false,
    isBestSeller: false,
    isFeatured: false,
    
    inStock: true,
    stockQuantity: 110,
    expirationDate: '11.2025',
    
    features: [
      'Kolajen ve protein karışımı',
      'Kahve aroması',
      'Cilt sağlığına destek',
      'Enerji verici',
      'Pratik kullanım'
    ],
    nutritionalInfo: {
      calories: 80,
      protein: 12,
      carbohydrates: 5,
      fat: 1,
      fiber: 0,
      sugar: 2,
      sodium: 50,
      cholesterol: 0,
      vitamins: [],
      minerals: [
        { name: 'Sodium', amount: 50, unit: 'mg', dailyValue: 2 },
        { name: 'Potassium', amount: 100, unit: 'mg', dailyValue: 2 }
      ]
    },
    usageInstructions: '1 scoop (20g) ürünü 200ml sıcak su ile karıştırın. Sabah kahvesi olarak tüketin.',
    ingredients: [
      'Collagen Peptides',
      'Whey Protein',
      'Coffee Extract',
      'Natural Flavor',
      'Stevia'
    ],
    images: [collagenCoffee]
  }
]

// Protein ürünlerini getiren fonksiyon
export const getProteinProducts = (): ProductDetail[] => {
  return proteinData
}

// Protein ürün ID'sine göre getiren fonksiyon
export const getProteinProductById = (id: number): ProductDetail | undefined => {
  return proteinData.find(product => product.id === id)
}

// Benzer protein ürünlerini getiren fonksiyon
export const getRelatedProteinProducts = (currentProductId: number, limit: number = 6): ProductDetail[] => {
  const otherProducts = proteinData.filter(product => product.id !== currentProductId)
  return otherProducts.slice(0, limit)
}
