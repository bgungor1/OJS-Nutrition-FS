import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CartMapper } from './cart.mapper';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { RemoveFromCartDto } from './dto/remove-from-cart.dto';
import { CartItemResponse } from './interfaces/cart-item-response.interface';
import { CartSession } from './interfaces/cart-session.interface';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  private buildSessionWhereClause(
    session: CartSession,
  ): Prisma.CartItemWhereInput {
    if (session.userId) {
      return { userId: session.userId };
    }
    if (session.guestSessionId) {
      return { guestSessionId: session.guestSessionId };
    }
    throw new BadRequestException('Geçerli bir sepet oturumu bulunamadı.');
  }

  async getCart(session: CartSession): Promise<CartItemResponse[]> {
    if (!session.userId && !session.guestSessionId) {
      return [];
    }

    const where = this.buildSessionWhereClause(session);

    const items = await this.prisma.cartItem.findMany({
      where,
      include: {
        product: true,
        productVariant: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    return CartMapper.toCartResponseList(items);
  }

  async addToCart(
    session: CartSession,
    dto: AddToCartDto,
  ): Promise<CartItemResponse[]> {
    const whereSession = this.buildSessionWhereClause(session);

    const variant = await this.prisma.productVariant.findUnique({
      where: { id: dto.product_variant_id },
      include: { product: true },
    });

    if (!variant || variant.productId !== dto.product_id) {
      throw new NotFoundException('Ürün veya varyant bulunamadı.');
    }

    if (!variant.isAvailable || variant.stockQuantity <= 0) {
      throw new BadRequestException('Bu ürün şu anda stokta bulunmamaktadır.');
    }

    const existingItem = await this.prisma.cartItem.findFirst({
      where: {
        ...whereSession,
        productVariantId: dto.product_variant_id,
      },
    });

    if (existingItem) {
      const newPieces = existingItem.pieces + dto.pieces;
      if (newPieces > variant.stockQuantity) {
        throw new BadRequestException(
          `Yetersiz stok. Bu üründen en fazla ${variant.stockQuantity} adet ekleyebilirsiniz. (Sepetinizde zaten ${existingItem.pieces} adet var)`,
        );
      }

      await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { pieces: newPieces },
      });
    } else {
      if (dto.pieces > variant.stockQuantity) {
        throw new BadRequestException(
          `Yetersiz stok. Bu üründen en fazla ${variant.stockQuantity} adet ekleyebilirsiniz.`,
        );
      }

      await this.prisma.cartItem.create({
        data: {
          userId: session.userId ?? null,
          guestSessionId: session.userId
            ? null
            : (session.guestSessionId ?? null),
          productId: dto.product_id,
          productVariantId: dto.product_variant_id,
          pieces: dto.pieces,
        },
      });
    }

    return this.getCart(session);
  }

  async removeFromCart(
    session: CartSession,
    dto: RemoveFromCartDto,
  ): Promise<CartItemResponse[]> {
    const whereSession = this.buildSessionWhereClause(session);

    const existingItem = await this.prisma.cartItem.findFirst({
      where: {
        ...whereSession,
        productId: dto.product_id,
        productVariantId: dto.product_variant_id,
      },
    });

    if (!existingItem) {
      throw new NotFoundException('Sepette böyle bir ürün bulunamadı.');
    }

    if (existingItem.pieces <= dto.pieces) {
      await this.prisma.cartItem.delete({
        where: { id: existingItem.id },
      });
    } else {
      await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          pieces: { decrement: dto.pieces },
        },
      });
    }

    return this.getCart(session);
  }

  async clearCart(session: CartSession): Promise<CartItemResponse[]> {
    if (!session.userId && !session.guestSessionId) {
      return [];
    }

    const whereSession = this.buildSessionWhereClause(session);

    await this.prisma.cartItem.deleteMany({
      where: whereSession,
    });

    return [];
  }

  async mergeGuestCart(
    userId: string,
    guestSessionId?: string,
  ): Promise<CartItemResponse[]> {
    if (!guestSessionId || guestSessionId.trim().length === 0) {
      return this.getCart({ userId });
    }

    const trimmedGuestSessionId = guestSessionId.trim();

    await this.prisma.$transaction(async (tx) => {
      const guestItems = await tx.cartItem.findMany({
        where: { guestSessionId: trimmedGuestSessionId },
      });

      if (guestItems.length === 0) {
        return;
      }

      const userItems = await tx.cartItem.findMany({
        where: { userId },
      });

      const userItemMap = new Map<string, (typeof userItems)[number]>();
      for (const item of userItems) {
        userItemMap.set(item.productVariantId, item);
      }

      for (const guestItem of guestItems) {
        const existingUserItem = userItemMap.get(guestItem.productVariantId);

        if (existingUserItem) {
          await tx.cartItem.update({
            where: { id: existingUserItem.id },
            data: {
              pieces: { increment: guestItem.pieces },
            },
          });
          await tx.cartItem.delete({
            where: { id: guestItem.id },
          });
        } else {
          await tx.cartItem.update({
            where: { id: guestItem.id },
            data: {
              userId,
              guestSessionId: null,
            },
          });
        }
      }
    });

    return this.getCart({ userId });
  }
}
