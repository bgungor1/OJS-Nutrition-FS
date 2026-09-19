import type { ApiProductVariant } from './variants';

export * from './variants';
export * from './categories';

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

export interface ApiPaginatedProducts {
  count: number;
  next: string | null;
  previous: string | null;
  results: ApiProduct[];
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

export interface CreateProductInput {
  name: string;
  slug: string;
  shortExplanation: string;
  usage: string;
  features: string;
  description: string;
  tags: string[];
  mainCategoryId: string;
  subCategoryId: string;
  isBestSeller?: boolean;
  bestSellerRank?: number;
  nutritionalContent?: ApiNutritionalContent;
}

export interface UpdateProductInput {
  name?: string;
  slug?: string;
  shortExplanation?: string;
  usage?: string;
  features?: string;
  description?: string;
  tags?: string[];
  mainCategoryId?: string;
  subCategoryId?: string;
  isBestSeller?: boolean;
  bestSellerRank?: number;
  nutritionalContent?: ApiNutritionalContent;
}

export interface ProductsQuery {
  limit?: number;
  offset?: number;
  category?: string;
  sort?: 'price_asc' | 'price_desc' | 'newest' | 'rating';
}
