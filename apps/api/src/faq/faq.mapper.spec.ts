import { FaqItem } from '@prisma/client';
import { FaqMapper } from './faq.mapper';

describe('FaqMapper', () => {
  const mockFaq: FaqItem = {
    id: 'faq-1',
    question: 'OJS Nutrition ürünlerinin menşei neresi?',
    answer: 'Ürünlerimiz uluslararası standartlarda üretilmektedir.',
    category: 'genel',
    sortOrder: 0,
  };

  describe('toApiFaqItem', () => {
    it('should transform Prisma FaqItem model to ApiFaqItem interface', () => {
      const result = FaqMapper.toApiFaqItem(mockFaq);

      expect(result).toEqual({
        id: 'faq-1',
        question: 'OJS Nutrition ürünlerinin menşei neresi?',
        answer: 'Ürünlerimiz uluslararası standartlarda üretilmektedir.',
        category: 'genel',
        sort_order: 0,
      });
    });
  });

  describe('toApiFaqList', () => {
    it('should transform an array of FaqItem to ApiFaqItem array', () => {
      const result = FaqMapper.toApiFaqList([mockFaq]);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('faq-1');
    });

    it('should return an empty array when given an empty array', () => {
      const result = FaqMapper.toApiFaqList([]);
      expect(result).toEqual([]);
    });
  });
});
