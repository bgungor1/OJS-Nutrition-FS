// API Response interface'leri
export interface ApiBestSellerResponse {
  status: "success" | "error"
  data: ApiBestSellerProduct[]
}

export interface ApiBestSellerProduct {
  name: string
  short_explanation: string
  slug: string
  price_info: {
    profit: number | null
    total_price: number
    discounted_price: number | null
    price_per_servings: number | null
    discount_percentage: number | null
  }
  photo_src: string
  comment_count: number
  average_star: number
}

// Products API için yeni tipler
export interface ApiProductsResponse {
  status: "success" | "error"
  data: {
    count: number
    next: string | null
    previous: string | null
    results: ApiProduct[]
  }
}

export interface ApiProduct {
  id: string
  name: string
  short_explanation: string
  slug: string
  price_info: {
    profit: number | null
    total_price: number
    discounted_price: number | null
    price_per_servings: number | null
    discount_percentage: number | null
  }
  photo_src: string
  comment_count: number
  average_star: number
}

// Ürün detay API için yeni tipler
export interface ApiProductDetailResponse {
  status: "success" | "error"
  data: ApiProductDetail
}

export interface ApiProductDetail {
  id: string
  name: string
  slug: string
  short_explanation: string
  explanation: {
    usage: string
    features: string
    description: string
    nutritional_content: {
      ingredients: Array<{
        aroma: string
        value: string
      }>
      nutrition_facts: {
        ingredients: Array<{
          name: string
          amounts: string[]
        }>
        portion_sizes: string[]
      }
      amino_acid_facts: {
        ingredients: Array<{
          name: string
          amounts: string[]
        }>
        portion_sizes: string[]
      }
    }
  }
  main_category_id: string
  sub_category_id: string
  tags: string[]
  variants: ApiProductVariant[]
  comment_count: number
  average_star: number
}

export interface ApiProductVariant {
  id: string
  size: {
    gram: number
    pieces: number
    total_services: number
  }
  aroma: string
  price: {
    profit: number | null
    total_price: number
    discounted_price: number | null
    price_per_servings: number
    discount_percentage: number | null
  }
  photo_src: string
  is_available: boolean
}

// WooCommerce Products API için tipler
export interface WooCommerceProductImage {
  id: number;
  src: string;
  name?: string;
  alt?: string;
}

export interface WooCommerceProductAttribute {
  id: number;
  name: string;
  position: number;
  visible: boolean;
  variation: boolean;
  options: string[];
}

export interface WooCommerceProductMetaData {
  id: number;
  key: string;
  value: unknown; // Meta verinin değeri herhangi bir tipte olabilir, ancak unknown daha güvenli
}

export interface WooCommerceProductDownload {
  id: string;
  name: string;
  file: string;
}

export interface WooCommerceProduct {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  date_created: string;
  date_modified: string;
  type: string;
  status: string;
  featured: boolean;
  catalog_visibility: string;
  description: string;
  short_description: string;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
  date_on_sale_from: string | null;
  date_on_sale_to: string | null;
  price_html: string;
  on_sale: boolean;
  purchasable: boolean;
  total_sales: number;
  virtual: boolean;
  downloadable: boolean;
  downloads: WooCommerceProductDownload[];
  download_limit: number;
  download_expiry: number;
  external_url: string;
  button_text: string;
  tax_status: string;
  tax_class: string;
  manage_stock: boolean;
  stock_quantity: number | null;
  stock_status: string;
  backorders: string;
  backorders_allowed: boolean;
  backordered: boolean;
  low_stock_amount: number | null;
  sold_individually: boolean;
  weight: string;
  dimensions: {
    length: string;
    width: string;
    height: string;
  };
  shipping_required: boolean;
  shipping_taxable: boolean;
  shipping_class: string;
  shipping_class_id: number;
  reviews_allowed: boolean;
  average_rating: string;
  rating_count: number;
  upsell_ids: number[];
  cross_sell_ids: number[];
  parent_id: number;
  purchase_note: string;
  categories: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  tags: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  images: WooCommerceProductImage[];
  attributes: WooCommerceProductAttribute[];
  default_attributes: WooCommerceProductAttribute[];
  variations: number[];
  grouped_products: number[];
  menu_order: number;
  meta_data: WooCommerceProductMetaData[];
}