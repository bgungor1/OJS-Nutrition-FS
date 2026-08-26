// Ürün detay sayfası için tip tanımları

export interface ProductDetail {
  id: number
  name: string
  image: string
  description: string
  shortDescription: string
  reviewCount: number
  rating: number
  price: number
  originalPrice?: number
  discountPercentage?: number
  
  // Ürün özellikleri
  category: string
  brand: string
  weight: string
  servingSize: string
  servingsPerContainer: number
  pricePerServing: number
  
  // Ürün seçenekleri
  flavors: FlavorOption[]
  sizes: SizeOption[]
  selectedFlavor: string
  selectedSize: string
  
  // Ürün etiketleri
  tags: string[]
  isVegetarian: boolean
  isGlutenFree: boolean
  isNew: boolean
  isBestSeller: boolean
  isFeatured: boolean
  
  // Stok ve tarih bilgileri
  inStock: boolean
  stockQuantity: number
  expirationDate: string
  
  // Detaylı bilgiler
  features: string[]
  nutritionalInfo: NutritionalInfo
  usageInstructions: string
  ingredients: string[]
  
  // Görseller
  images: string[]
}

export interface FlavorOption {
  id: string
  name: string
  color: string
  isAvailable: boolean
}

export interface SizeOption {
  id: string
  name: string
  weight: string
  servings: number
  price: number
  originalPrice?: number
  discountPercentage?: number
  isAvailable: boolean
}

export interface NutritionalInfo {
  calories: number
  protein: number
  carbohydrates: number
  fat: number
  fiber: number
  sugar: number
  sodium: number
  cholesterol: number
  vitamins: VitaminInfo[]
  minerals: MineralInfo[]
}

export interface VitaminInfo {
  name: string
  amount: number
  unit: string
  dailyValue: number
}

export interface MineralInfo {
  name: string
  amount: number
  unit: string
  dailyValue: number
}

export interface ProductReview {
  id: number
  reviewerName: string
  rating: number
  reviewDate: string
  reviewTitle: string
  reviewText: string
  isVerified: boolean
  helpfulCount: number
  images?: string[]
}

export interface RelatedProduct {
  id: number
  name: string
  image: string
  price: number
  originalPrice?: number
  rating: number
  reviewCount: number
  discountPercentage?: number
}
