import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuditEvent, SecurityAuditService } from '../common/audit';
import { PrismaService } from '../prisma/prisma.service';
import { ProductsAdminService } from './products-admin.service';
import { createMockProduct } from './test/products.fixture';

describe('ProductsAdminService', () => {
  let service: ProductsAdminService;
  let mockPrisma: {
    product: {
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
    productVariant: {
      deleteMany: jest.Mock;
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
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      productVariant: {
        deleteMany: jest.fn(),
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
});
