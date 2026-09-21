import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { AuditEvent, SecurityAuditService } from '../common/audit';
import { PrismaService } from '../prisma/prisma.service';
import { ProductVariantsAdminService } from './product-variants-admin.service';
import { createMockProduct, createMockVariant } from './test/products.fixture';

describe('ProductVariantsAdminService', () => {
  let service: ProductVariantsAdminService;
  let mockPrisma: {
    product: {
      findUnique: jest.Mock;
      findUniqueOrThrow: jest.Mock;
    };
    productVariant: {
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
      findUnique: jest.Mock;
    };
    orderItem: {
      count: jest.Mock;
    };
  };
  let mockAudit: { info: jest.Mock; warn: jest.Mock };

  const adminId = 'admin-uuid';
  const ip = '127.0.0.1';

  beforeEach(async () => {
    mockPrisma = {
      product: {
        findUnique: jest.fn(),
        findUniqueOrThrow: jest.fn(),
      },
      productVariant: {
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        findUnique: jest.fn(),
      },
      orderItem: {
        count: jest.fn(),
      },
    };

    mockAudit = {
      info: jest.fn(),
      warn: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductVariantsAdminService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: SecurityAuditService, useValue: mockAudit },
      ],
    }).compile();

    service = module.get<ProductVariantsAdminService>(
      ProductVariantsAdminService,
    );
  });

  describe('createVariant', () => {
    const variantDto = {
      aroma: 'Strawberry',
      gram: 400,
      pieces: 1,
      totalServings: 16,
      totalPrice: 499,
      discountedPrice: 449,
      pricePerServing: 28.06,
      photoSrc: 'media/products/strawberry.jpg',
    };

    it('should create variant when discountedPrice < totalPrice', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(createMockProduct());
      mockPrisma.productVariant.create.mockResolvedValue(
        createMockVariant(variantDto),
      );
      mockPrisma.product.findUniqueOrThrow.mockResolvedValue(
        createMockProduct(),
      );

      const result = await service.createVariant(
        'prod-1',
        variantDto as never,
        adminId,
        ip,
      );

      expect(mockPrisma.productVariant.create).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(mockAudit.info).toHaveBeenCalledWith(
        AuditEvent.ADMIN_VARIANT_CREATED,
        expect.any(Object),
      );
    });

    it('should throw NotFoundException when product does not exist', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null);
      await expect(
        service.createVariant('bad-id', variantDto as never, adminId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when discountedPrice >= totalPrice', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(createMockProduct());
      const invalid = { ...variantDto, discountedPrice: 599, totalPrice: 499 };

      await expect(
        service.createVariant('prod-1', invalid as never, adminId),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateVariant', () => {
    it('should update variant fields and log audit event', async () => {
      mockPrisma.productVariant.findUnique.mockResolvedValue(
        createMockVariant({
          id: 'var-1',
          productId: 'prod-1',
          totalPrice: new Prisma.Decimal(500),
          discountedPrice: null,
        }),
      );
      mockPrisma.productVariant.update.mockResolvedValue(createMockVariant());
      mockPrisma.product.findUniqueOrThrow.mockResolvedValue(
        createMockProduct(),
      );

      await service.updateVariant(
        'prod-1',
        'var-1',
        { aroma: 'Banana' } as never,
        adminId,
        ip,
      );

      expect(mockPrisma.productVariant.update).toHaveBeenCalled();
      expect(mockAudit.info).toHaveBeenCalledWith(
        AuditEvent.ADMIN_VARIANT_UPDATED,
        expect.any(Object),
      );
    });

    it('should throw NotFoundException when variant does not belong to product', async () => {
      mockPrisma.productVariant.findUnique.mockResolvedValue(
        createMockVariant({ id: 'var-1', productId: 'other-prod' }),
      );

      await expect(
        service.updateVariant('prod-1', 'var-1', {}, adminId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when updated discountedPrice >= effective total', async () => {
      mockPrisma.productVariant.findUnique.mockResolvedValue(
        createMockVariant({
          id: 'var-1',
          productId: 'prod-1',
          totalPrice: new Prisma.Decimal(400),
          discountedPrice: null,
        }),
      );

      await expect(
        service.updateVariant(
          'prod-1',
          'var-1',
          { discountedPrice: 500 } as never,
          adminId,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteVariant', () => {
    it('should delete variant when not referenced in orders', async () => {
      mockPrisma.productVariant.findUnique.mockResolvedValue(
        createMockVariant({ id: 'var-1', productId: 'prod-1' }),
      );
      mockPrisma.orderItem.count.mockResolvedValue(0);

      await service.deleteVariant('prod-1', 'var-1', adminId, ip);

      expect(mockPrisma.productVariant.delete).toHaveBeenCalledWith({
        where: { id: 'var-1' },
      });
      expect(mockAudit.warn).toHaveBeenCalledWith(
        AuditEvent.ADMIN_VARIANT_DELETED,
        expect.any(Object),
      );
    });

    it('should throw NotFoundException when variant does not exist on product', async () => {
      mockPrisma.productVariant.findUnique.mockResolvedValue(null);
      await expect(
        service.deleteVariant('prod-1', 'var-1', adminId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when variant is referenced in orders', async () => {
      mockPrisma.productVariant.findUnique.mockResolvedValue(
        createMockVariant({ id: 'var-1', productId: 'prod-1' }),
      );
      mockPrisma.orderItem.count.mockResolvedValue(2);

      await expect(
        service.deleteVariant('prod-1', 'var-1', adminId),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
