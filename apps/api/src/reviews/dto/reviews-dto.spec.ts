import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateReviewDto } from './create-review.dto';
import { ReviewQueryDto } from './review-query.dto';

describe('Reviews DTO Validation', () => {
  describe('CreateReviewDto', () => {
    it('should pass validation with valid input', async () => {
      const input = {
        rating: 5,
        title: 'Mükemmel ürün',
        text: 'Tadı ve etkisi gerçekten başarılı.',
        images: ['https://example.com/img.jpg'],
      };

      const dto = plainToInstance(CreateReviewDto, input);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should fail validation when rating is outside 1-5 range', async () => {
      const input = {
        rating: 6,
        title: 'Harika',
        text: 'Çok iyi bir ürün.',
      };

      const dto = plainToInstance(CreateReviewDto, input);
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('rating');
    });

    it('should fail validation when title and text are empty', async () => {
      const input = {
        rating: 4,
        title: '',
        text: '',
      };

      const dto = plainToInstance(CreateReviewDto, input);
      const errors = await validate(dto);

      const properties = errors.map((e) => e.property);
      expect(properties).toContain('title');
      expect(properties).toContain('text');
    });

    it('should fail validation when images count exceeds 5', async () => {
      const input = {
        rating: 4,
        title: 'Güzel',
        text: 'Tavsiye edilir.',
        images: [
          'https://example.com/1.jpg',
          'https://example.com/2.jpg',
          'https://example.com/3.jpg',
          'https://example.com/4.jpg',
          'https://example.com/5.jpg',
          'https://example.com/6.jpg',
        ],
      };

      const dto = plainToInstance(CreateReviewDto, input);
      const errors = await validate(dto);

      const properties = errors.map((e) => e.property);
      expect(properties).toContain('images');
    });
  });

  describe('ReviewQueryDto', () => {
    it('should accept valid query parameters', async () => {
      const input = {
        limit: 15,
        offset: 0,
        rating: 5,
        sort: 'highest_rating',
      };

      const dto = plainToInstance(ReviewQueryDto, input);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should fail validation when sort parameter is invalid', async () => {
      const input = {
        sort: 'invalid_sort_param',
      };

      const dto = plainToInstance(ReviewQueryDto, input);
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('sort');
    });
  });
});
