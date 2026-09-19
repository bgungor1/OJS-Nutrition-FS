export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category?: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface FaqQuery {
  category?: string;
}

export interface CreateFaqDto {
  question: string;
  answer: string;
  category?: string;
  order?: number;
}

export interface UpdateFaqDto {
  question?: string;
  answer?: string;
  category?: string;
  order?: number;
}
