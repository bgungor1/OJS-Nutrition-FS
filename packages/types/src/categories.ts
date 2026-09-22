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

export interface MediaUploadResponse {
  photo_src: string;
  url: string;
  filename: string;
  size: number;
  mimetype: string;
}
