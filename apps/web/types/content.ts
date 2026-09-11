export interface ApiFaqItem {
  id: string | number;
  question: string;
  answer: string;
  category: 'genel' | 'urunler' | 'kargo' | string;
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
