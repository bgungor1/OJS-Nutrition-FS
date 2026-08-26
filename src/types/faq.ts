// FAQ ile ilgili TypeScript tip tanımları

export interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: 'genel' | 'urunler' | 'kargo';
}

export interface FAQProps {
  items: FAQItem[];
  title?: string;
  subtitle?: string;
}

export interface FAQCategory {
  key: 'genel' | 'urunler' | 'kargo';
  label: string;
  color?: string;
}
