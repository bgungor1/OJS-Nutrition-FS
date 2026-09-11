export interface ApiSubCategory {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
}

export interface ApiCategory {
  id: string;
  name: string;
  slug: string;
  subCategories?: ApiSubCategory[];
}
