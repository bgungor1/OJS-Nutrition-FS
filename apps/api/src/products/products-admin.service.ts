import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AuditEvent, SecurityAuditService } from '../common/audit';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateProductDto,
  CreateVariantDto,
  UpdateProductDto,
  UpdateVariantDto,
} from './dto';
import { ApiProductDetail } from './interfaces/product-response.interface';
import { ProductsMapper } from './products.mapper';

@Injectable()
export class ProductsAdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: SecurityAuditService,
  ) {}

  async createProduct(
    dto: CreateProductDto,
    adminUserId: string,
    ip?: string,
  ): Promise<ApiProductDetail> {
    const existing = await this.prisma.product.findUnique({
      where: { slug: dto.slug },
    });
    if (existing) {
      throw new ConflictException(
        `A product with slug "${dto.slug}" already exists.`,
      );
    }

    const product = await this.prisma.product.create({
      data: {
        ...dto,
        nutritionalContent:
          dto.nutritionalContent as unknown as Prisma.InputJsonValue,
        isBestSeller: dto.isBestSeller ?? false,
        bestSellerRank: dto.bestSellerRank ?? null,
      } as Prisma.ProductUncheckedCreateInput,
      include: { variants: { orderBy: { createdAt: 'asc' } } },
    });

    this.auditService.info(AuditEvent.ADMIN_PRODUCT_CREATED, {
      ip,
      userId: adminUserId,
      resourceId: product.id,
      details: { slug: product.slug, name: product.name },
    });

    return ProductsMapper.toProductDetail(product);
  }

  async updateProduct(
    productId: string,
    dto: UpdateProductDto,
    adminUserId: string,
    ip?: string,
  ): Promise<ApiProductDetail> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      throw new NotFoundException(`Product with id "${productId}" not found.`);
    }

    if (dto.slug && dto.slug !== product.slug) {
      const conflict = await this.prisma.product.findUnique({
        where: { slug: dto.slug },
      });
      if (conflict) {
        throw new ConflictException(
          `A product with slug "${dto.slug}" already exists.`,
        );
      }
    }

    const updated = await this.prisma.product.update({
      where: { id: productId },
      data: {
        ...dto,
        ...(dto.nutritionalContent !== undefined && {
          nutritionalContent:
            dto.nutritionalContent as unknown as Prisma.InputJsonValue,
        }),
      } as Prisma.ProductUncheckedUpdateInput,
      include: { variants: { orderBy: { createdAt: 'asc' } } },
    });

    this.auditService.info(AuditEvent.ADMIN_PRODUCT_UPDATED, {
      ip,
      userId: adminUserId,
      resourceId: productId,
      details: {
        slug: dto.slug ?? product.slug,
        updatedFields: Object.keys(dto),
      },
    });

    return ProductsMapper.toProductDetail(updated);
  }

  async deleteProduct(
    productId: string,
    adminUserId: string,
    ip?: string,
  ): Promise<void> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      throw new NotFoundException(`Product with id "${productId}" not found.`);
    }

    const referencedInOrder = await this.prisma.orderItem.count({
      where: { productId },
    });
    if (referencedInOrder > 0) {
      throw new BadRequestException(
        `Product "${product.name}" appears in ${referencedInOrder} order item(s) and cannot be deleted.`,
      );
    }

    await this.prisma.$transaction([
      this.prisma.productVariant.deleteMany({ where: { productId } }),
      this.prisma.product.delete({ where: { id: productId } }),
    ]);

    this.auditService.warn(AuditEvent.ADMIN_PRODUCT_DELETED, {
      ip,
      userId: adminUserId,
      resourceId: productId,
      details: { slug: product.slug, name: product.name },
    });
  }

  async createVariant(
    productId: string,
    dto: CreateVariantDto,
    adminUserId: string,
    ip?: string,
  ): Promise<ApiProductDetail> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      throw new NotFoundException(`Product with id "${productId}" not found.`);
    }

    if (
      dto.discountedPrice !== undefined &&
      dto.discountedPrice >= dto.totalPrice
    ) {
      throw new BadRequestException(
        'discountedPrice must be strictly less than totalPrice.',
      );
    }

    const variant = await this.prisma.productVariant.create({
      data: {
        ...dto,
        productId,
        totalPrice: new Prisma.Decimal(dto.totalPrice),
        discountedPrice:
          dto.discountedPrice !== undefined
            ? new Prisma.Decimal(dto.discountedPrice)
            : null,
        pricePerServing: new Prisma.Decimal(dto.pricePerServing),
        isAvailable: dto.isAvailable ?? true,
        stockQuantity: dto.stockQuantity ?? 0,
      } as Prisma.ProductVariantUncheckedCreateInput,
    });

    this.auditService.info(AuditEvent.ADMIN_VARIANT_CREATED, {
      ip,
      userId: adminUserId,
      resourceId: variant.id,
      details: { productId, aroma: variant.aroma },
    });

    return ProductsMapper.toProductDetail(
      await this.getProductWithVariants(productId),
    );
  }

  async updateVariant(
    productId: string,
    variantId: string,
    dto: UpdateVariantDto,
    adminUserId: string,
    ip?: string,
  ): Promise<ApiProductDetail> {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: variantId },
    });
    if (!variant || variant.productId !== productId) {
      throw new NotFoundException(
        `Variant "${variantId}" not found on product "${productId}".`,
      );
    }

    const effectiveTotal =
      dto.totalPrice !== undefined
        ? dto.totalPrice
        : Number(variant.totalPrice);
    const effectiveDiscount =
      dto.discountedPrice !== undefined
        ? dto.discountedPrice
        : variant.discountedPrice !== null
          ? Number(variant.discountedPrice)
          : undefined;

    if (
      effectiveDiscount !== undefined &&
      effectiveDiscount >= effectiveTotal
    ) {
      throw new BadRequestException(
        'discountedPrice must be strictly less than totalPrice.',
      );
    }

    await this.prisma.productVariant.update({
      where: { id: variantId },
      data: {
        ...dto,
        ...(dto.totalPrice !== undefined && {
          totalPrice: new Prisma.Decimal(dto.totalPrice),
        }),
        ...(dto.discountedPrice !== undefined && {
          discountedPrice: new Prisma.Decimal(dto.discountedPrice),
        }),
        ...(dto.pricePerServing !== undefined && {
          pricePerServing: new Prisma.Decimal(dto.pricePerServing),
        }),
      } as Prisma.ProductVariantUncheckedUpdateInput,
    });

    this.auditService.info(AuditEvent.ADMIN_VARIANT_UPDATED, {
      ip,
      userId: adminUserId,
      resourceId: variantId,
      details: { productId, updatedFields: Object.keys(dto) },
    });

    return ProductsMapper.toProductDetail(
      await this.getProductWithVariants(productId),
    );
  }

  async deleteVariant(
    productId: string,
    variantId: string,
    adminUserId: string,
    ip?: string,
  ): Promise<void> {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: variantId },
    });
    if (!variant || variant.productId !== productId) {
      throw new NotFoundException(
        `Variant "${variantId}" not found on product "${productId}".`,
      );
    }

    const referencedInOrder = await this.prisma.orderItem.count({
      where: { productVariantId: variantId },
    });
    if (referencedInOrder > 0) {
      throw new BadRequestException(
        `Variant "${variantId}" appears in ${referencedInOrder} order item(s) and cannot be deleted.`,
      );
    }

    await this.prisma.productVariant.delete({ where: { id: variantId } });

    this.auditService.warn(AuditEvent.ADMIN_VARIANT_DELETED, {
      ip,
      userId: adminUserId,
      resourceId: variantId,
      details: { productId, aroma: variant.aroma },
    });
  }

  private getProductWithVariants(id: string) {
    return this.prisma.product.findUniqueOrThrow({
      where: { id },
      include: { variants: { orderBy: { createdAt: 'asc' } } },
    });
  }
}
