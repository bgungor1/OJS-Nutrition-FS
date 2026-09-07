/**
 * OJS Nutrition — Katalog ve Ürün Yanıt Arayüzleri
 * Kaynak: BACKEND_PLAN.md §5.3, src/types/api.ts
 */

export interface ApiPriceInfo {
  profit: number | null;
  total_price: number;
  discounted_price: number | null;
  price_per_servings: number | null;
  discount_percentage: number | null;
}

export interface ApiProduct {
  id: string;
  name: string;
  short_explanation: string;
  slug: string;
  price_info: ApiPriceInfo;
  photo_src: string;
  comment_count: number;
  average_star: number;
}

export interface ApiBestSellerProduct {
  name: string;
  short_explanation: string;
  slug: string;
  price_info: ApiPriceInfo;
  photo_src: string;
  comment_count: number;
  average_star: number;
}

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

export interface NutritionalIngredient {
  aroma: string;
  value: string;
}

export interface NutritionFactItem {
  name: string;
  amounts: string[];
}

export interface NutritionFacts {
  ingredients: NutritionFactItem[];
  portion_sizes: string[];
}

export interface AminoAcidFacts {
  ingredients: NutritionFactItem[];
  portion_sizes: string[];
}

export interface ApiNutritionalContent {
  ingredients: NutritionalIngredient[];
  nutrition_facts: NutritionFacts;
  amino_acid_facts: AminoAcidFacts;
}

export interface ApiProductExplanation {
  usage: string;
  features: string;
  description: string;
  nutritional_content: ApiNutritionalContent;
}

export interface ApiProductDetail {
  id: string;
  name: string;
  slug: string;
  short_explanation: string;
  explanation: ApiProductExplanation;
  main_category_id: string;
  sub_category_id: string;
  tags: string[];
  variants: ApiProductVariant[];
  comment_count: number;
  average_star: number;
}

export interface ApiPaginatedProducts {
  count: number;
  next: string | null;
  previous: string | null;
  results: ApiProduct[];
}

export interface SubCategoryItem {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
}

export interface CategoryTree {
  id: string;
  name: string;
  slug: string;
  subCategories: SubCategoryItem[];
}
