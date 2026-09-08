import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ProductsQueryDto } from './dto/products-query.dto';
import {
  ApiBestSellerProduct,
  ApiPaginatedProducts,
  ApiProductDetail,
} from './interfaces/product-response.interface';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

describe('ProductsController', () => {
  let controller: ProductsController;
  let mockProductsService: {
    list: jest.Mock;
    bestSellers: jest.Mock;
    getBySlug: jest.Mock;
  };

  const mockPaginatedProducts: ApiPaginatedProducts = {
    count: 1,
    next: null,
    previous: null,
    results: [
      {
        id: 'prod-1',
        name: 'WHEY PROTEIN',
        slug: 'whey-protein',
        short_explanation: 'Açıklama',
        price_info: {
          profit: 50,
          total_price: 549,
          discounted_price: 499,
          price_per_servings: 31.18,
          discount_percentage: 9,
        },
        photo_src: 'media/products/whey-protein.jpg',
        comment_count: 150,
        average_star: 4.8,
      },
    ],
  };

  const mockBestSellers: ApiBestSellerProduct[] = [
    {
      name: 'WHEY PROTEIN',
      slug: 'whey-protein',
      short_explanation: 'Açıklama',
      price_info: {
        profit: 50,
        total_price: 549,
        discounted_price: 499,
        price_per_servings: 31.18,
        discount_percentage: 9,
      },
      photo_src: 'media/products/whey-protein.jpg',
      comment_count: 150,
      average_star: 4.8,
    },
  ];

  const mockProductDetail: ApiProductDetail = {
    id: 'prod-1',
    name: 'WHEY PROTEIN',
    slug: 'whey-protein',
    short_explanation: 'Açıklama',
    explanation: {
      usage: '1 ölçek',
      features: 'Özellikler',
      description: 'Detay',
      nutritional_content: {
        ingredients: [],
        nutrition_facts: { ingredients: [], portion_sizes: [] },
        amino_acid_facts: { ingredients: [], portion_sizes: [] },
      },
    },
    main_category_id: 'cat-1',
    sub_category_id: 'sub-1',
    tags: ['WHEY'],
    variants: [],
    comment_count: 150,
    average_star: 4.8,
  };

  beforeEach(async () => {
    mockProductsService = {
      list: jest.fn(),
      bestSellers: jest.fn(),
      getBySlug: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
  });

  describe('list', () => {
    it('servisi doğru sorgu parametreleriyle çağırmalı ve sonucu dönmeli', async () => {
      const query: ProductsQueryDto = {
        limit: 10,
        offset: 0,
        category: 'protein',
        sort: 'price_asc',
      };
      mockProductsService.list.mockResolvedValue(mockPaginatedProducts);

      const result = await controller.list(query);

      expect(mockProductsService.list).toHaveBeenCalledTimes(1);
      expect(mockProductsService.list).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockPaginatedProducts);
    });
  });

  describe('bestSellers', () => {
    it('servisi çağırmalı ve çok satan ürünler listesini dönmeli', async () => {
      mockProductsService.bestSellers.mockResolvedValue(mockBestSellers);

      const result = await controller.bestSellers();

      expect(mockProductsService.bestSellers).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockBestSellers);
    });
  });

  describe('getBySlug', () => {
    it('slug ile ürün detayını başarıyla getirmeli', async () => {
      mockProductsService.getBySlug.mockResolvedValue(mockProductDetail);

      const result = await controller.getBySlug('whey-protein');

      expect(mockProductsService.getBySlug).toHaveBeenCalledTimes(1);
      expect(mockProductsService.getBySlug).toHaveBeenCalledWith(
        'whey-protein',
      );
      expect(result).toEqual(mockProductDetail);
    });

    it('ürün bulunamadığında NotFoundException fırlatmalı', async () => {
      mockProductsService.getBySlug.mockRejectedValue(
        new NotFoundException('Ürün bulunamadı'),
      );

      await expect(controller.getBySlug('olmayan-urun')).rejects.toThrow(
        NotFoundException,
      );
      expect(mockProductsService.getBySlug).toHaveBeenCalledWith(
        'olmayan-urun',
      );
    });
  });
});
