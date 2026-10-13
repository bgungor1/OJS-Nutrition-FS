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

export type ApiSubCategory = SubCategoryItem;

export interface ApiCategory {
  id: string;
  name: string;
  slug: string;
  subCategories?: ApiSubCategory[];
}

export interface MediaUploadResponse {
  photo_src: string;
  url: string;
  filename: string;
  size: number;
  mimetype: string;
}
