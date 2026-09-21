import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AuditEvent, SecurityAuditService } from '../common/audit';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVariantDto, UpdateVariantDto } from './dto';
import { ApiProductDetail } from './interfaces/product-response.interface';
import { ProductsMapper } from './products.mapper';

@Injectable()
export class ProductVariantsAdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: SecurityAuditService,
  ) {}

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
