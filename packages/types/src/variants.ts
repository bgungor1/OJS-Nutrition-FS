export interface ApiProductVariantSize {
  gram: number;
  pieces: number;
  total_services: number;
}

export interface ApiProductVariantPrice {
  profit: number | null;
  total_price: number;
  discounted_price: number | null;
  price_per_servings: number;
  discount_percentage: number | null;
}

export interface ApiProductVariant {
  id: string;
  size: ApiProductVariantSize;
  aroma: string;
  price: ApiProductVariantPrice;
  photo_src: string;
  is_available: boolean;
}

export interface CreateVariantInput {
  aroma: string;
  gram: number;
  pieces: number;
  totalServings: number;
  totalPrice: number;
  discountedPrice?: number;
  pricePerServing: number;
  photoSrc: string;
  isAvailable?: boolean;
  stockQuantity?: number;
}

export interface UpdateVariantInput {
  aroma?: string;
  gram?: number;
  pieces?: number;
  totalServings?: number;
  totalPrice?: number;
  discountedPrice?: number;
  pricePerServing?: number;
  photoSrc?: string;
  isAvailable?: boolean;
  stockQuantity?: number;
}
