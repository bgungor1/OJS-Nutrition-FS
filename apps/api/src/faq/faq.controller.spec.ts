import { Test, TestingModule } from '@nestjs/testing';
import { CreateFaqDto, FaqQueryDto, UpdateFaqDto } from './dto';
import { FaqController } from './faq.controller';
import { FaqService } from './faq.service';
import { ApiFaqItem } from './interfaces';

describe('FaqController', () => {
  let controller: FaqController;
  let service: {
    findAll: jest.Mock;
    findById: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };

  const mockApiFaq: ApiFaqItem = {
    id: 'faq-1',
    question: 'OJS Nutrition ürünlerinin menşei neresi?',
    answer:
      'OJS Nutrition ürünleri, uluslararası standartlarda GMP onaylı tesislerde üretilmektedir.',
    category: 'genel',
    sort_order: 0,
  };

  beforeEach(async () => {
    service = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FaqController],
      providers: [
        {
          provide: FaqService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<FaqController>(FaqController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should call service.findAll with query dto', async () => {
      service.findAll.mockResolvedValue([mockApiFaq]);

      const query: FaqQueryDto = { category: 'genel' };
      const result = await controller.findAll(query);

      expect(service.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual([mockApiFaq]);
    });
  });

  describe('findById', () => {
    it('should call service.findById with id parameter', async () => {
      service.findById.mockResolvedValue(mockApiFaq);

      const result = await controller.findById('faq-1');

      expect(service.findById).toHaveBeenCalledWith('faq-1');
      expect(result).toEqual(mockApiFaq);
    });
  });

  describe('create', () => {
    it('should call service.create with dto parameter', async () => {
      service.create.mockResolvedValue(mockApiFaq);

      const dto: CreateFaqDto = {
        question: 'OJS Nutrition ürünlerinin menşei neresi?',
        answer:
          'OJS Nutrition ürünleri, uluslararası standartlarda GMP onaylı tesislerde üretilmektedir.',
        category: 'genel',
        sortOrder: 0,
      };

      const result = await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockApiFaq);
    });
  });

  describe('update', () => {
    it('should call service.update with id and dto parameters', async () => {
      service.update.mockResolvedValue({
        ...mockApiFaq,
        question: 'Güncellendi',
      });

      const dto: UpdateFaqDto = { question: 'Güncellendi' };
      const result = await controller.update('faq-1', dto);

      expect(service.update).toHaveBeenCalledWith('faq-1', dto);
      expect(result.question).toBe('Güncellendi');
    });
  });

  describe('delete', () => {
    it('should call service.delete with id parameter', async () => {
      service.delete.mockResolvedValue({ id: 'faq-1' });

      const result = await controller.delete('faq-1');

      expect(service.delete).toHaveBeenCalledWith('faq-1');
      expect(result).toEqual({ id: 'faq-1' });
    });
  });
});
