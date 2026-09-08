import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoryTree } from './interfaces/product-response.interface';
import { ProductsService } from './products.service';

describe('CategoriesController', () => {
  let controller: CategoriesController;
  let mockProductsService: {
    categories: jest.Mock;
  };

  const mockCategoriesTree: CategoryTree[] = [
    {
      id: 'cat-1',
      name: 'PROTEİN',
      slug: 'protein',
      subCategories: [
        {
          id: 'sub-1',
          name: 'WHEY PROTEİN',
          slug: 'whey-protein',
          categoryId: 'cat-1',
        },
        {
          id: 'sub-2',
          name: 'İZOLE PROTEİN',
          slug: 'izole-protein',
          categoryId: 'cat-1',
        },
      ],
    },
    {
      id: 'cat-2',
      name: 'VİTAMİNLER',
      slug: 'vitaminler',
      subCategories: [],
    },
  ];

  beforeEach(async () => {
    mockProductsService = {
      categories: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
      ],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
  });

  describe('categories', () => {
    it('servisi çağırmalı ve hiyerarşik kategori ağacını dönmeli', async () => {
      mockProductsService.categories.mockResolvedValue(mockCategoriesTree);

      const result = await controller.categories();

      expect(mockProductsService.categories).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockCategoriesTree);
      expect(result).toHaveLength(2);
      expect(result[0].subCategories).toHaveLength(2);
      expect(result[0].subCategories[0].name).toBe('WHEY PROTEİN');
    });

    it('alt kategorisi olmayan kategoriyi boş liste ile dönmeli', async () => {
      mockProductsService.categories.mockResolvedValue([mockCategoriesTree[1]]);

      const result = await controller.categories();

      expect(result[0].subCategories).toEqual([]);
    });
  });
});
