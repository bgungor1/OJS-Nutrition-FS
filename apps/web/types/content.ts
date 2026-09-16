export interface ApiFaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  sort_order: number;
}

export interface ContactPayload {
  name: string;
  email: string;
  message: string;
}

export interface ContactResponse {
  id: string;
  message: string;
}

