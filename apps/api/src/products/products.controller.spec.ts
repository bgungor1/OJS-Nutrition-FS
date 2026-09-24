import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

describe('ProductsController', () => {
  let controller: ProductsController;
  let mockService: {
    list: jest.Mock;
    bestSellers: jest.Mock;
    getBySlug: jest.Mock;
  };

  const mockProduct = {
    id: 'prod-1',
    name: 'WHEY PROTEIN',
    slug: 'whey-protein',
  };

  beforeEach(async () => {
    mockService = {
      list: jest.fn(),
      bestSellers: jest.fn(),
      getBySlug: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [{ provide: ProductsService, useValue: mockService }],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
  });

  describe('list', () => {
    it('should call service with query params and return paginated list', async () => {
      const paginatedResult = {
        count: 1,
        next: null,
        previous: null,
        results: [mockProduct],
      };
      mockService.list.mockResolvedValue(paginatedResult);

      const query = {
        limit: 10,
        offset: 0,
        category: 'protein',
        sort: 'price_asc' as const,
        search: 'isolate',
      };
      const result = await controller.list(query);

      expect(mockService.list).toHaveBeenCalledWith(query);
      expect(result).toEqual(paginatedResult);
    });
  });

  describe('bestSellers', () => {
    it('should call service and return best-sellers list', async () => {
      mockService.bestSellers.mockResolvedValue([mockProduct]);

      const result = await controller.bestSellers();

      expect(mockService.bestSellers).toHaveBeenCalledTimes(1);
      expect(result).toEqual([mockProduct]);
    });
  });

  describe('getBySlug', () => {
    it('should return product detail for an existing slug', async () => {
      mockService.getBySlug.mockResolvedValue(mockProduct);

      const result = await controller.getBySlug('whey-protein');

      expect(mockService.getBySlug).toHaveBeenCalledWith('whey-protein');
      expect(result).toEqual(mockProduct);
    });

    it('should propagate NotFoundException when product is not found', async () => {
      mockService.getBySlug.mockRejectedValue(new NotFoundException());

      await expect(controller.getBySlug('unknown')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
