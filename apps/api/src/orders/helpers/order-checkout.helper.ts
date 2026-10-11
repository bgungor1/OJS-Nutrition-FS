import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { PaymentsService } from '../../payments/payments.service';
import { AddressSnapshot } from '../interfaces/order-response.interface';
import {
  PaymentChargeRequest,
  PaymentChargeResult,
} from '../../payments/interfaces/payment-process.interface';
import { CompleteShoppingDto } from '../dto/complete-shopping.dto';
import { OrderNoGeneratorHelper } from './order-no-generator.helper';
import { OrderPricingHelper } from './order-pricing.helper';
import {
  AddressWithHierarchy,
  CheckoutContext,
  CreatedOrderWithRelations,
  OrderCartItem,
} from './order-checkout.types';
import { OrderCheckoutPayloadBuilder } from './order-checkout-payload.builder';

export {
  AddressWithHierarchy,
  CheckoutContext,
  CreatedOrderWithRelations,
  OrderCartItem,
};

export class OrderCheckoutHelper {
  static buildAddressSnapshot(address: AddressWithHierarchy): AddressSnapshot {
    return OrderCheckoutPayloadBuilder.buildAddressSnapshot(address);
  }

  static buildChargeRequest(params: {
    dto: CompleteShoppingDto;
    user: User;
    address: AddressWithHierarchy;
    cartItems: OrderCartItem[];
    totalPrice: number;
    orderNo: string;
    ipAddress?: string;
  }): PaymentChargeRequest {
    return OrderCheckoutPayloadBuilder.buildChargeRequest(params);
  }

  static sortItemsForLocking(items: OrderCartItem[]): OrderCartItem[] {
    return [...items].sort((a, b) =>
      a.productVariantId.localeCompare(b.productVariantId),
    );
  }

  static async verifyCartIntegrity(
    tx: Prisma.TransactionClient,
    userId: string,
    expectedItems: OrderCartItem[],
  ): Promise<void> {
    if (typeof tx.cartItem?.findMany !== 'function') {
      return;
    }

    const currentCart = await tx.cartItem.findMany({
      where: { userId },
    });

    if (currentCart.length === 0) {
      throw new BadRequestException(
        'Sepetiniz boş veya siparişiniz zaten başka bir işlem tarafından tamamlandı.',
      );
    }

    const currentMap = new Map(
      currentCart.map((item) => [item.productVariantId, item.pieces]),
    );

    for (const expected of expectedItems) {
      const currentPieces = currentMap.get(expected.productVariantId);
      if (currentPieces === undefined || currentPieces !== expected.pieces) {
        throw new ConflictException(
          'Sepet içeriği güncellendi, lütfen sepetinizi kontrol edip tekrar deneyiniz.',
        );
      }
    }
  }

  static async acquireVariantPessimisticLocks(
    tx: Prisma.TransactionClient,
    items: OrderCartItem[],
  ): Promise<void> {
    const sortedItems = OrderCheckoutHelper.sortItemsForLocking(items);
    const variantIds = sortedItems.map((item) => item.productVariantId);

    if (typeof tx.$queryRaw === 'function' && variantIds.length > 0) {
      try {
        const lockedRows = await tx.$queryRaw<
          Array<{ id: string; stockQuantity: number; isAvailable: boolean }>
        >`
          SELECT id, "stockQuantity", "isAvailable"
          FROM "ProductVariant"
          WHERE id IN (${Prisma.join(variantIds)})
          ORDER BY id ASC
          FOR UPDATE
        `;

        if (lockedRows && lockedRows.length > 0) {
          const rowMap = new Map(lockedRows.map((r) => [r.id, r]));

          for (const item of sortedItems) {
            const locked = rowMap.get(item.productVariantId);
            if (!locked || !locked.isAvailable) {
              throw new ConflictException(
                `Ürün satışa kapalı: ${item.product.name} (${item.productVariant.aroma}) şu anda satın alınamaz.`,
              );
            }
            if (locked.stockQuantity < item.pieces) {
              throw new ConflictException(
                `Yetersiz stok: ${item.product.name} (${item.productVariant.aroma}) için talep edilen adet (${item.pieces}) mevcut değil (Kalan: ${locked.stockQuantity}).`,
              );
            }
          }
        }
      } catch (err: unknown) {
        if (err instanceof ConflictException) {
          throw err;
        }
      }
    }
  }

  static async decrementStockAtomic(
    tx: Prisma.TransactionClient,
    items: OrderCartItem[],
  ): Promise<void> {
    const sortedItems = OrderCheckoutHelper.sortItemsForLocking(items);

    for (const item of sortedItems) {
      const res = await tx.productVariant.updateMany({
        where: {
          id: item.productVariantId,
          stockQuantity: { gte: item.pieces },
          isAvailable: true,
        },
        data: { stockQuantity: { decrement: item.pieces } },
      });

      if (res.count === 0) {
        throw new ConflictException(
          `Yetersiz stok: ${item.product.name} (${item.productVariant.aroma}) için talep edilen adet mevcut değil.`,
        );
      }
    }
  }

  static async createOrderWithRelations(
    tx: Prisma.TransactionClient,
    params: {
      orderNo: string;
      userId: string;
      totalPrice: number;
      shippingFee: number;
      addressSnapshot: AddressSnapshot;
      cartItems: OrderCartItem[];
      chargeResult: PaymentChargeResult;
    },
  ): Promise<CreatedOrderWithRelations> {
    const data = OrderCheckoutPayloadBuilder.buildOrderCreateData(params);

    return tx.order.create({
      data,
      include: {
        items: true,
        payment: true,
      },
    });
  }

  static async prepareCheckoutContext(
    prisma: PrismaService,
    userId: string,
    dto: CompleteShoppingDto,
  ): Promise<CheckoutContext> {
    const address = (await prisma.address.findFirst({
      where: { id: dto.address_id, userId },
      include: { country: true, region: true, subregion: true },
    })) as AddressWithHierarchy | null;
    if (!address) {
      throw new NotFoundException('Belirtilen teslimat adresi bulunamadı.');
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı.');
    }

    const cartItems = (await prisma.cartItem.findMany({
      where: { userId },
      include: { product: true, productVariant: true },
      orderBy: { createdAt: 'asc' },
    })) as OrderCartItem[];
    if (cartItems.length === 0) {
      throw new BadRequestException('Sepetinizde ürün bulunmamaktadır.');
    }

    const { shippingFee, totalPrice } =
      OrderPricingHelper.calculateOrderTotals(cartItems);
    const orderNo = OrderNoGeneratorHelper.generate();
    const addressSnapshot =
      OrderCheckoutPayloadBuilder.buildAddressSnapshot(address);

    return {
      user,
      address,
      cartItems,
      addressSnapshot,
      orderNo,
      shippingFee,
      totalPrice,
    };
  }

  static async executeCheckoutTransaction(
    prisma: PrismaService,
    paymentsService: PaymentsService,
    context: CheckoutContext,
    dto: CompleteShoppingDto,
    userId: string,
    ipAddress?: string,
  ): Promise<CreatedOrderWithRelations> {
    const {
      user,
      address,
      cartItems,
      addressSnapshot,
      orderNo,
      shippingFee,
      totalPrice,
    } = context;

    return prisma.$transaction(
      async (tx) => {
        await OrderCheckoutHelper.verifyCartIntegrity(tx, userId, cartItems);
        await OrderCheckoutHelper.acquireVariantPessimisticLocks(tx, cartItems);
        await OrderCheckoutHelper.decrementStockAtomic(tx, cartItems);

        const chargeRequest = OrderCheckoutPayloadBuilder.buildChargeRequest({
          dto,
          user,
          address,
          cartItems,
          totalPrice,
          orderNo,
          ipAddress,
        });
        const chargeResult = await paymentsService.charge(chargeRequest);

        if (!chargeResult.success || chargeResult.rawStatus === 'failed') {
          throw new BadRequestException(
            chargeResult.errorMessage ||
              'Ödeme işlemi bankanız tarafından onaylanmadı.',
          );
        }

        const createdOrder = await OrderCheckoutHelper.createOrderWithRelations(
          tx,
          {
            orderNo,
            userId,
            totalPrice,
            shippingFee,
            addressSnapshot,
            cartItems,
            chargeResult,
          },
        );

        await tx.cartItem.deleteMany({ where: { userId } });
        return createdOrder;
      },
      { timeout: 15000, maxWait: 5000 },
    );
  }
}
