import type { ApiPriceInfo } from './common';

export interface ApiBestSellerProduct {
  id?: string;
  name: string;
  short_explanation: string;
  slug: string;
  price_info: ApiPriceInfo;
  photo_src: string;
  comment_count: number;
  average_star: number;
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

export interface ApiProductVariant {
  id: string;
  size: {
    gram: number;
    pieces: number;
    total_services: number;
  };
  aroma: string;
  price: ApiPriceInfo;
  photo_src: string;
  is_available: boolean;
}

export interface NutritionalContent {
  ingredients: Array<{
    aroma: string;
    value: string;
  }>;
  nutrition_facts: {
    ingredients: Array<{
      name: string;
      amounts: string[];
    }>;
    portion_sizes: string[];
  };
  amino_acid_facts?: {
    ingredients: Array<{
      name: string;
      amounts: string[];
    }>;
    portion_sizes: string[];
  };
}

export interface ApiProductDetail {
  id: string;
  name: string;
  slug: string;
  short_explanation: string;
  explanation: {
    usage: string;
    features: string;
    description: string;
    nutritional_content: NutritionalContent;
  };
  main_category_id: string;
  sub_category_id: string;
  tags: string[];
  variants: ApiProductVariant[];
  comment_count: number;
  average_star: number;
}

export interface ApiReview {
  id: string;
  product_id: string;
  reviewer_name: string;
  rating: number;
  is_verified: boolean;
  title: string;
  text: string;
  images: string[];
  helpful_count: number;
  created_at: string;
}
