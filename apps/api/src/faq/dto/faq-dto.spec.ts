import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateFaqDto } from './create-faq.dto';
import { FaqQueryDto } from './faq-query.dto';
import { UpdateFaqDto } from './update-faq.dto';

describe('FAQ DTO Validation', () => {
  describe('CreateFaqDto', () => {
    it('should pass validation with valid input', async () => {
      const input = {
        question: 'Kargo süresi ne kadardır?',
        answer:
          'Hafta içi saat 16:00ya kadar verilen siparişler aynı gün kargolanır.',
        category: 'kargo',
        sortOrder: 1,
      };

      const dto = plainToInstance(CreateFaqDto, input);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should fail validation when question or answer is empty', async () => {
      const input = {
        question: '',
        answer: '',
        category: 'kargo',
      };

      const dto = plainToInstance(CreateFaqDto, input);
      const errors = await validate(dto);

      const properties = errors.map((e) => e.property);
      expect(properties).toContain('question');
      expect(properties).toContain('answer');
    });

    it('should fail validation when category is invalid', async () => {
      const input = {
        question: 'Geçerli bir soru başlığı?',
        answer: 'Geçerli bir yanıt metnidir en az 10 karakter.',
        category: 'gecersiz_kategori',
      };

      const dto = plainToInstance(CreateFaqDto, input);
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('category');
    });
  });

  describe('UpdateFaqDto', () => {
    it('should accept partial update fields', async () => {
      const input = {
        question: 'Yeni güncel soru başlığı?',
      };

      const dto = plainToInstance(UpdateFaqDto, input);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });
  });

  describe('FaqQueryDto', () => {
    it('should accept a valid category filter', async () => {
      const input = { category: 'genel' };

      const dto = plainToInstance(FaqQueryDto, input);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should fail validation when category filter is invalid', async () => {
      const input = { category: 'yanlis' };

      const dto = plainToInstance(FaqQueryDto, input);
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('category');
    });
  });
});
