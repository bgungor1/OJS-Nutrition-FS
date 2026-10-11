import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { FaqItem } from '@prisma/client';
import { PrismaService } from '../prisma';
import { CreateFaqDto, UpdateFaqDto } from './dto';
import { FaqService } from './faq.service';

describe('FaqService', () => {
  let service: FaqService;
  let prisma: {
    faqItem: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  const mockFaq: FaqItem = {
    id: 'faq-1',
    question: 'OJS Nutrition ürünlerinin menşei neresi?',
    answer:
      'OJS Nutrition ürünleri, uluslararası standartlarda GMP onaylı tesislerde üretilmektedir.',
    category: 'genel',
    sortOrder: 0,
  };

  beforeEach(async () => {
    prisma = {
      faqItem: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FaqService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<FaqService>(FaqService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all FAQ items ordered by sortOrder and id when no category filter is provided', async () => {
      prisma.faqItem.findMany.mockResolvedValue([mockFaq]);

      const result = await service.findAll();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('faq-1');
      expect(prisma.faqItem.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
      });
    });

    it('should add category to where condition when category filter is provided', async () => {
      prisma.faqItem.findMany.mockResolvedValue([mockFaq]);

      const result = await service.findAll({ category: 'genel' });

      expect(result).toHaveLength(1);
      expect(prisma.faqItem.findMany).toHaveBeenCalledWith({
        where: { category: 'genel' },
        orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
      });
    });
  });

  describe('findById', () => {
    it('should return the found FAQ item formatted as ApiFaqItem', async () => {
      prisma.faqItem.findUnique.mockResolvedValue(mockFaq);

      const result = await service.findById('faq-1');

      expect(result.id).toBe('faq-1');
      expect(result.question).toBe('OJS Nutrition ürünlerinin menşei neresi?');
    });

    it('should throw NotFoundException when FAQ item is not found', async () => {
      prisma.faqItem.findUnique.mockResolvedValue(null);

      await expect(service.findById('olmayan-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should successfully create and return a new FAQ item', async () => {
      const dto: CreateFaqDto = {
        question: 'Kargo ne kadar sürer?',
        answer: 'Siparişler 1-2 iş günü içinde kargolanır.',
        category: 'kargo',
        sortOrder: 1,
      };

      prisma.faqItem.create.mockResolvedValue({
        ...mockFaq,
        id: 'faq-2',
        question: dto.question,
        answer: dto.answer,
        category: dto.category,
        sortOrder: 1,
      });

      const result = await service.create(dto);

      expect(result.id).toBe('faq-2');
      expect(result.category).toBe('kargo');
      expect(prisma.faqItem.create).toHaveBeenCalledWith({
        data: {
          question: dto.question,
          answer: dto.answer,
          category: dto.category,
          sortOrder: 1,
        },
      });
    });
  });

  describe('update', () => {
    it('should update and return the existing FAQ item', async () => {
      prisma.faqItem.findUnique.mockResolvedValue({ id: 'faq-1' });
      prisma.faqItem.update.mockResolvedValue({
        ...mockFaq,
        question: 'Güncel Soru Başlığı?',
      });

      const dto: UpdateFaqDto = { question: 'Güncel Soru Başlığı?' };
      const result = await service.update('faq-1', dto);

      expect(result.question).toBe('Güncel Soru Başlığı?');
      expect(prisma.faqItem.update).toHaveBeenCalledWith({
        where: { id: 'faq-1' },
        data: { question: 'Güncel Soru Başlığı?' },
      });
    });

    it('should throw NotFoundException when FAQ item to update does not exist', async () => {
      prisma.faqItem.findUnique.mockResolvedValue(null);

      await expect(
        service.update('olmayan-id', { question: 'Yeni' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete existing FAQ item and return its id', async () => {
      prisma.faqItem.findUnique.mockResolvedValue({ id: 'faq-1' });
      prisma.faqItem.delete.mockResolvedValue(mockFaq);

      const result = await service.delete('faq-1');

      expect(result).toEqual({ id: 'faq-1' });
      expect(prisma.faqItem.delete).toHaveBeenCalledWith({
        where: { id: 'faq-1' },
      });
    });

    it('should throw NotFoundException when FAQ item to delete does not exist', async () => {
      prisma.faqItem.findUnique.mockResolvedValue(null);

      await expect(service.delete('olmayan-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('caching and invalidation', () => {
    let cachedService: FaqService;
    let mockCache: {
      get: jest.Mock;
      set: jest.Mock;
      del: jest.Mock;
    };

    beforeEach(async () => {
      mockCache = {
        get: jest.fn(),
        set: jest.fn(),
        del: jest.fn().mockResolvedValue(true),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          FaqService,
          { provide: PrismaService, useValue: prisma },
          { provide: 'CACHE_MANAGER', useValue: mockCache },
        ],
      }).compile();

      cachedService = module.get<FaqService>(FaqService);
    });

    it('should return cached items on findAll without querying database', async () => {
      const cachedList = [
        {
          id: 'faq-cached',
          question: 'Cached?',
          answer: 'Yes',
          category: 'genel',
          sort_order: 0,
        },
      ];
      mockCache.get.mockResolvedValue(cachedList);

      const result = await cachedService.findAll();

      expect(result).toEqual(cachedList);
      expect(mockCache.get).toHaveBeenCalledWith('faq:list:all');
      expect(prisma.faqItem.findMany).not.toHaveBeenCalled();
    });

    it('should query database and set cache on findAll cache miss', async () => {
      mockCache.get.mockResolvedValue(undefined);
      prisma.faqItem.findMany.mockResolvedValue([mockFaq]);

      const result = await cachedService.findAll();

      expect(result).toHaveLength(1);
      expect(mockCache.get).toHaveBeenCalledWith('faq:list:all');
      expect(prisma.faqItem.findMany).toHaveBeenCalled();
      expect(mockCache.set).toHaveBeenCalledWith(
        'faq:list:all',
        expect.any(Array),
        30 * 60 * 1000,
      );
    });

    it('should return cached item on findById without querying database', async () => {
      const cachedItem = {
        id: 'faq-1',
        question: 'Cached?',
        answer: 'Yes',
        category: 'genel',
        sort_order: 0,
      };
      mockCache.get.mockResolvedValue(cachedItem);

      const result = await cachedService.findById('faq-1');

      expect(result).toEqual(cachedItem);
      expect(mockCache.get).toHaveBeenCalledWith('faq:item:faq-1');
      expect(prisma.faqItem.findUnique).not.toHaveBeenCalled();
    });

    it('should invalidate cache when a new FAQ item is created', async () => {
      prisma.faqItem.create.mockResolvedValue(mockFaq);

      await cachedService.create({
        question: 'Yeni Soru',
        answer: 'Yeni Cevap',
        category: 'genel',
      });

      expect(mockCache.del).toHaveBeenCalledWith('faq:list:all');
      expect(mockCache.del).toHaveBeenCalledWith('faq:list:genel');
    });

    it('should invalidate cache and specific item when an FAQ is updated', async () => {
      prisma.faqItem.findUnique.mockResolvedValue({ id: 'faq-1' });
      prisma.faqItem.update.mockResolvedValue(mockFaq);

      await cachedService.update('faq-1', { question: 'Guncel Soru' });

      expect(mockCache.del).toHaveBeenCalledWith('faq:list:all');
      expect(mockCache.del).toHaveBeenCalledWith('faq:item:faq-1');
    });

    it('should invalidate cache and specific item when an FAQ is deleted', async () => {
      prisma.faqItem.findUnique.mockResolvedValue({ id: 'faq-1' });
      prisma.faqItem.delete.mockResolvedValue(mockFaq);

      await cachedService.delete('faq-1');

      expect(mockCache.del).toHaveBeenCalledWith('faq:list:all');
      expect(mockCache.del).toHaveBeenCalledWith('faq:item:faq-1');
    });
  });
});
