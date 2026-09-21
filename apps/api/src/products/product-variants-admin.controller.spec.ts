import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '@prisma/client';
import { AuthenticatedUser } from '../common/types/authenticated-user';
import { ProductVariantsAdminController } from './product-variants-admin.controller';
import { ProductVariantsAdminService } from './product-variants-admin.service';

describe('ProductVariantsAdminController', () => {
  let controller: ProductVariantsAdminController;
  let mockVariantsService: {
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
    mockVariantsService = {
      createVariant: jest.fn(),
      updateVariant: jest.fn(),
      deleteVariant: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductVariantsAdminController],
      providers: [
        {
          provide: ProductVariantsAdminService,
          useValue: mockVariantsService,
        },
      ],
    }).compile();

    controller = module.get<ProductVariantsAdminController>(
      ProductVariantsAdminController,
    );
  });

  describe('createVariant', () => {
    const dto = {
      aroma: 'Chocolate',
      gram: 400,
      pieces: 1,
      totalServings: 16,
      totalPrice: 499,
      discountedPrice: 449,
      pricePerServing: 28.06,
      photoSrc: 'media/products/choc.jpg',
    };

    it('should delegate to service and return product with variant', async () => {
      mockVariantsService.createVariant.mockResolvedValue(mockProduct);
      const result = await controller.createVariant(
        'prod-1',
        dto,
        adminUser,
        ip,
      );

      expect(mockVariantsService.createVariant).toHaveBeenCalledWith(
        'prod-1',
        dto,
        adminUser.id,
        ip,
      );
      expect(result).toEqual(mockProduct);
    });

    it('should propagate BadRequestException on pricing mismatch', async () => {
      mockVariantsService.createVariant.mockRejectedValue(
        new BadRequestException(
          'discountedPrice must be strictly less than totalPrice.',
        ),
      );

      await expect(
        controller.createVariant('prod-1', dto, adminUser, ip),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateVariant', () => {
    it('should delegate to service and return updated product', async () => {
      mockVariantsService.updateVariant.mockResolvedValue(mockProduct);
      const result = await controller.updateVariant(
        'prod-1',
        'var-1',
        { aroma: 'Vanilla' },
        adminUser,
        ip,
      );

      expect(mockVariantsService.updateVariant).toHaveBeenCalledWith(
        'prod-1',
        'var-1',
        { aroma: 'Vanilla' },
        adminUser.id,
        ip,
      );
      expect(result).toEqual(mockProduct);
    });

    it('should propagate NotFoundException when variant is not found', async () => {
      mockVariantsService.updateVariant.mockRejectedValue(
        new NotFoundException(),
      );

      await expect(
        controller.updateVariant('prod-1', 'bad-var', {}, adminUser, ip),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteVariant', () => {
    it('should delegate to service', async () => {
      mockVariantsService.deleteVariant.mockResolvedValue(undefined);
      await controller.deleteVariant('prod-1', 'var-1', adminUser, ip);

      expect(mockVariantsService.deleteVariant).toHaveBeenCalledWith(
        'prod-1',
        'var-1',
        adminUser.id,
        ip,
      );
    });

    it('should propagate BadRequestException when variant appears in orders', async () => {
      mockVariantsService.deleteVariant.mockRejectedValue(
        new BadRequestException(),
      );

      await expect(
        controller.deleteVariant('prod-1', 'var-1', adminUser, ip),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
