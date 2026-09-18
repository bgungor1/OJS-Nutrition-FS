import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '@prisma/client';
import { AuthenticatedUser } from '../common/types/authenticated-user';
import { ProductsAdminController } from './products-admin.controller';
import { ProductsAdminService } from './products-admin.service';

describe('ProductsAdminController', () => {
  let controller: ProductsAdminController;
  let mockAdminService: {
    createProduct: jest.Mock;
    updateProduct: jest.Mock;
    deleteProduct: jest.Mock;
    createVariant: jest.Mock;
    updateVariant: jest.Mock;
    deleteVariant: jest.Mock;
  };

  const adminUser: AuthenticatedUser = {
    id: 'admin-uuid',
    email: 'admin@test.com',
    role: Role.admin,
  };
  const ip = '127.0.0.1';
  const mockProduct = { id: 'prod-1', name: 'WHEY', slug: 'whey' };

  beforeEach(async () => {
    mockAdminService = {
      createProduct: jest.fn(),
      updateProduct: jest.fn(),
      deleteProduct: jest.fn(),
      createVariant: jest.fn(),
      updateVariant: jest.fn(),
      deleteVariant: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsAdminController],
      providers: [
        { provide: ProductsAdminService, useValue: mockAdminService },
      ],
    }).compile();

    controller = module.get<ProductsAdminController>(ProductsAdminController);
  });

  describe('createProduct', () => {
    const dto = {
      name: 'Whey',
      slug: 'whey',
      shortExplanation: 'Short',
      usage: '1 scoop',
      features: 'High',
      description: 'Desc',
      nutritionalContent: {
        ingredients: [],
        nutrition_facts: { ingredients: [], portion_sizes: [] },
        amino_acid_facts: { ingredients: [], portion_sizes: [] },
      },
      tags: ['PROTEIN'],
      mainCategoryId: 'cat-1',
      subCategoryId: 'sub-1',
    };

    it('should delegate to service and return created product', async () => {
      mockAdminService.createProduct.mockResolvedValue(mockProduct);
      const result = await controller.createProduct(dto, adminUser, ip);

      expect(mockAdminService.createProduct).toHaveBeenCalledWith(
        dto,
        adminUser.id,
        ip,
      );
      expect(result).toEqual(mockProduct);
    });

    it('should propagate ConflictException when slug already exists', async () => {
      mockAdminService.createProduct.mockRejectedValue(new ConflictException());
      await expect(
        controller.createProduct(dto, adminUser, ip),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('updateProduct', () => {
    it('should delegate to service and return updated product', async () => {
      mockAdminService.updateProduct.mockResolvedValue(mockProduct);
      const result = await controller.updateProduct(
        'prod-1',
        { name: 'New' },
        adminUser,
        ip,
      );

      expect(mockAdminService.updateProduct).toHaveBeenCalledWith(
        'prod-1',
        { name: 'New' },
        adminUser.id,
        ip,
      );
      expect(result).toEqual(mockProduct);
    });

    it('should propagate NotFoundException when product does not exist', async () => {
      mockAdminService.updateProduct.mockRejectedValue(new NotFoundException());
      await expect(
        controller.updateProduct('prod-1', { name: 'New' }, adminUser, ip),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteProduct', () => {
    it('should delegate to service and return void on success', async () => {
      mockAdminService.deleteProduct.mockResolvedValue(undefined);
      const result = await controller.deleteProduct('prod-1', adminUser, ip);

      expect(mockAdminService.deleteProduct).toHaveBeenCalledWith(
        'prod-1',
        adminUser.id,
        ip,
      );
      expect(result).toBeUndefined();
    });

    it('should propagate BadRequestException when product is in orders', async () => {
      mockAdminService.deleteProduct.mockRejectedValue(
        new BadRequestException(),
      );
      await expect(
        controller.deleteProduct('prod-1', adminUser, ip),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('createVariant', () => {
    const dto = {
      aroma: 'Vanilla',
      gram: 500,
      pieces: 1,
      totalServings: 20,
      totalPrice: 599,
      pricePerServing: 29.95,
      photoSrc: 'media/products/vanilla.jpg',
    };

    it('should delegate to service and return updated product', async () => {
      mockAdminService.createVariant.mockResolvedValue(mockProduct);
      const result = await controller.createVariant(
        'prod-1',
        dto,
        adminUser,
        ip,
      );

      expect(mockAdminService.createVariant).toHaveBeenCalledWith(
        'prod-1',
        dto,
        adminUser.id,
        ip,
      );
      expect(result).toEqual(mockProduct);
    });

    it('should propagate BadRequestException on invalid pricing', async () => {
      mockAdminService.createVariant.mockRejectedValue(
        new BadRequestException(),
      );
      await expect(
        controller.createVariant('prod-1', dto, adminUser, ip),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateVariant', () => {
    it('should delegate to service and return updated product', async () => {
      mockAdminService.updateVariant.mockResolvedValue(mockProduct);
      const result = await controller.updateVariant(
        'prod-1',
        'var-1',
        { isAvailable: false },
        adminUser,
        ip,
      );

      expect(mockAdminService.updateVariant).toHaveBeenCalledWith(
        'prod-1',
        'var-1',
        { isAvailable: false },
        adminUser.id,
        ip,
      );
      expect(result).toEqual(mockProduct);
    });

    it('should propagate NotFoundException when variant is not found', async () => {
      mockAdminService.updateVariant.mockRejectedValue(new NotFoundException());
      await expect(
        controller.updateVariant('prod-1', 'bad-var', {}, adminUser, ip),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteVariant', () => {
    it('should delegate to service and return void on success', async () => {
      mockAdminService.deleteVariant.mockResolvedValue(undefined);
      const result = await controller.deleteVariant(
        'prod-1',
        'var-1',
        adminUser,
        ip,
      );

      expect(mockAdminService.deleteVariant).toHaveBeenCalledWith(
        'prod-1',
        'var-1',
        adminUser.id,
        ip,
      );
      expect(result).toBeUndefined();
    });

    it('should propagate BadRequestException when variant is in orders', async () => {
      mockAdminService.deleteVariant.mockRejectedValue(
        new BadRequestException(),
      );
      await expect(
        controller.deleteVariant('prod-1', 'var-1', adminUser, ip),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
