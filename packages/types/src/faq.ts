export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  sort_order?: number;
  sortOrder?: number;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface FaqQuery {
  category?: string;
}

export interface CreateFaqDto {
  question: string;
  answer: string;
  category: string;
  sortOrder?: number;
}

export interface UpdateFaqDto {
  question?: string;
  answer?: string;
  category?: string;
  sortOrder?: number;
}
