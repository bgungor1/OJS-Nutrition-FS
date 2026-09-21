import { ConflictException, NotFoundException } from '@nestjs/common';
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

    it('should propagate NotFoundException when product not found', async () => {
      mockAdminService.updateProduct.mockRejectedValue(new NotFoundException());
      await expect(
        controller.updateProduct('bad-id', {}, adminUser, ip),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteProduct', () => {
    it('should delegate to service', async () => {
      mockAdminService.deleteProduct.mockResolvedValue(undefined);
      await controller.deleteProduct('prod-1', adminUser, ip);

      expect(mockAdminService.deleteProduct).toHaveBeenCalledWith(
        'prod-1',
        adminUser.id,
        ip,
      );
    });
  });
});
