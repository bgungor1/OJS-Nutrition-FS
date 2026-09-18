import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { AuditEvent, SecurityAuditService } from '../common/audit';
import { PrismaService } from '../prisma/prisma.service';
import { ProductsAdminService } from './products-admin.service';
import { createMockProduct, createMockVariant } from './test/products.fixture';

describe('ProductsAdminService', () => {
  let service: ProductsAdminService;
  let mockPrisma: {
    product: {
      findUnique: jest.Mock;
      findUniqueOrThrow: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
    productVariant: {
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
      deleteMany: jest.Mock;
      findUnique: jest.Mock;
    };
    orderItem: {
      count: jest.Mock;
    };
    $transaction: jest.Mock;
  };
  let mockAudit: { info: jest.Mock; warn: jest.Mock };

  const adminId = 'admin-uuid';
  const ip = '127.0.0.1';

  beforeEach(async () => {
    mockPrisma = {
      product: {
        findUnique: jest.fn(),
        findUniqueOrThrow: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      productVariant: {
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn(),
        findUnique: jest.fn(),
      },
      orderItem: {
        count: jest.fn(),
      },
      $transaction: jest.fn((ops: unknown[]) => Promise.all(ops)),
    };

    mockAudit = {
      info: jest.fn(),
      warn: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsAdminService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: SecurityAuditService, useValue: mockAudit },
      ],
    }).compile();

    service = module.get<ProductsAdminService>(ProductsAdminService);
  });

  describe('createProduct', () => {
    const dto = {
      name: 'Creatine Monohydrate',
      slug: 'creatine-monohydrate',
      shortExplanation: 'Pure creatine',
      usage: 'Take 5g daily',
      features: '100% pure',
      description: 'Micronized creatine',
      nutritionalContent: {
        ingredients: [],
        nutrition_facts: { ingredients: [], portion_sizes: [] },
        amino_acid_facts: { ingredients: [], portion_sizes: [] },
      },
      tags: ['CREATINE'],
      mainCategoryId: 'cat-1',
      subCategoryId: 'sub-1',
    };

    it('should create product and log audit event when slug is unique', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null);
      const mockCreated = createMockProduct({ ...dto, variants: [] });
      mockPrisma.product.create.mockResolvedValue(mockCreated);

      const result = await service.createProduct(dto as never, adminId, ip);

      expect(mockPrisma.product.findUnique).toHaveBeenCalledWith({
        where: { slug: dto.slug },
      });
      expect(result.name).toBe(dto.name);
      expect(mockAudit.info).toHaveBeenCalledWith(
        AuditEvent.ADMIN_PRODUCT_CREATED,
        expect.any(Object),
      );
    });

    it('should throw ConflictException when slug already exists', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({ id: 'existing-id' });

      await expect(
        service.createProduct(dto as never, adminId, ip),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('updateProduct', () => {
    it('should update product and log audit event', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(
        createMockProduct({ id: 'prod-1', slug: 'whey' }),
      );
      mockPrisma.product.update.mockResolvedValue(
        createMockProduct({ id: 'prod-1', name: 'Updated Whey' }),
      );

      const result = await service.updateProduct(
        'prod-1',
        { name: 'Updated Whey' },
        adminId,
        ip,
      );

      expect(result.name).toBe('Updated Whey');
      expect(mockAudit.info).toHaveBeenCalledWith(
        AuditEvent.ADMIN_PRODUCT_UPDATED,
        expect.any(Object),
      );
    });

    it('should throw NotFoundException when product does not exist', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null);
      await expect(
        service.updateProduct('bad-id', {}, adminId, ip),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when updating to an existing slug', async () => {
      mockPrisma.product.findUnique
        .mockResolvedValueOnce(
          createMockProduct({ id: 'prod-1', slug: 'old-slug' }),
        )
        .mockResolvedValueOnce({ id: 'another-prod', slug: 'taken-slug' });

      await expect(
        service.updateProduct('prod-1', { slug: 'taken-slug' }, adminId, ip),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('deleteProduct', () => {
    it('should delete variants and product in a transaction when no orders reference it', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(
        createMockProduct({ id: 'prod-1' }),
      );
      mockPrisma.orderItem.count.mockResolvedValue(0);

      await service.deleteProduct('prod-1', adminId, ip);

      expect(mockPrisma.$transaction).toHaveBeenCalled();
      expect(mockAudit.warn).toHaveBeenCalledWith(
        AuditEvent.ADMIN_PRODUCT_DELETED,
        expect.any(Object),
      );
    });

    it('should throw NotFoundException when product does not exist', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null);
      await expect(
        service.deleteProduct('bad-id', adminId, ip),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when product appears in orders', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(
        createMockProduct({ id: 'prod-1' }),
      );
      mockPrisma.orderItem.count.mockResolvedValue(3);

      await expect(
        service.deleteProduct('prod-1', adminId, ip),
      ).rejects.toThrow(BadRequestException);
    });
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
    it('should update variant and log audit event', async () => {
      const existing = createMockVariant({
        id: 'var-1',
        productId: 'prod-1',
        totalPrice: new Prisma.Decimal(500),
        discountedPrice: null,
      });
      mockPrisma.productVariant.findUnique.mockResolvedValue(existing);
      mockPrisma.productVariant.update.mockResolvedValue({
        ...existing,
        isAvailable: false,
      });
      mockPrisma.product.findUniqueOrThrow.mockResolvedValue(
        createMockProduct(),
      );

      const result = await service.updateVariant(
        'prod-1',
        'var-1',
        { isAvailable: false },
        adminId,
        ip,
      );

      expect(mockPrisma.productVariant.update).toHaveBeenCalled();
      expect(result).toBeDefined();
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

    it('should throw BadRequestException when discountedPrice >= totalPrice', async () => {
      const existing = createMockVariant({
        id: 'var-1',
        productId: 'prod-1',
        totalPrice: new Prisma.Decimal(500),
        discountedPrice: null,
      });
      mockPrisma.productVariant.findUnique.mockResolvedValue(existing);

      await expect(
        service.updateVariant(
          'prod-1',
          'var-1',
          { discountedPrice: 600 },
          adminId,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteVariant', () => {
    it('should delete variant when no orders reference it', async () => {
      mockPrisma.productVariant.findUnique.mockResolvedValue(
        createMockVariant({ id: 'var-1', productId: 'prod-1' }),
      );
      mockPrisma.orderItem.count.mockResolvedValue(0);
      mockPrisma.productVariant.delete.mockResolvedValue({});

      await service.deleteVariant('prod-1', 'var-1', adminId, ip);

      expect(mockPrisma.productVariant.delete).toHaveBeenCalledWith({
        where: { id: 'var-1' },
      });
      expect(mockAudit.warn).toHaveBeenCalledWith(
        AuditEvent.ADMIN_VARIANT_DELETED,
        expect.any(Object),
      );
    });

    it('should throw BadRequestException when variant appears in orders', async () => {
      mockPrisma.productVariant.findUnique.mockResolvedValue(
        createMockVariant({ id: 'var-1', productId: 'prod-1' }),
      );
      mockPrisma.orderItem.count.mockResolvedValue(2);

      await expect(
        service.deleteVariant('prod-1', 'var-1', adminId, ip),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
