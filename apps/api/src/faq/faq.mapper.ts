import { FaqItem } from '@prisma/client';
import { ApiFaqItem } from './interfaces';

export class FaqMapper {
  static toApiFaqItem(faq: FaqItem): ApiFaqItem {
    return {
      id: faq.id,
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      sort_order: faq.sortOrder,
    };
  }

  static toApiFaqList(faqs: FaqItem[]): ApiFaqItem[] {
    return faqs.map((faq) => this.toApiFaqItem(faq));
  }
}
