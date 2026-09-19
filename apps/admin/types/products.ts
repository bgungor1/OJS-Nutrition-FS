export interface ProductVariant {
  id: string;
  productId: string;
  size: string | null;
  aroma: string | null;
  price: number;
  discountedPrice: number | null;
  stockQuantity: number;
  photoSrc: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
}

export interface ProductListItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string | null;
  rating: number;
  reviewCount: number;
  isBestSeller: boolean;
  createdAt: string;
  updatedAt?: string;
  category?: ProductCategory | null;
  variants: ProductVariant[];
}

export interface ProductDetail extends ProductListItem {
  features?: string[] | null;
  usageInstructions?: string | null;
  nutritionFacts?: Record<string, unknown> | null;
}

export interface CreateProductDto {
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  categoryId: string;
  subCategoryId?: string;
  isBestSeller?: boolean;
}

export interface UpdateProductDto {
  name?: string;
  slug?: string;
  description?: string;
  shortDescription?: string;
  categoryId?: string;
  subCategoryId?: string;
  isBestSeller?: boolean;
}

export interface CreateVariantDto {
  size?: string;
  aroma?: string;
  price: number;
  discountedPrice?: number;
  stockQuantity: number;
  photoSrc?: string;
  isDefault?: boolean;
}

export interface UpdateVariantDto {
  size?: string;
  aroma?: string;
  price?: number;
  discountedPrice?: number;
  stockQuantity?: number;
  photoSrc?: string;
  isDefault?: boolean;
}

export interface MediaUploadResponse {
  filename: string;
  path: string;
  url: string;
  mimetype: string;
  size: number;
}
