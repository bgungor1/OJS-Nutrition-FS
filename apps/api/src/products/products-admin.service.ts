import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AuditEvent, SecurityAuditService } from '../common/audit';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto } from './dto';
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
        nutritionalContent: (dto.nutritionalContent ?? {
          ingredients: [],
          nutrition_facts: { ingredients: [], portion_sizes: [] },
          amino_acid_facts: { ingredients: [], portion_sizes: [] },
        }) as unknown as Prisma.InputJsonValue,
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
}
