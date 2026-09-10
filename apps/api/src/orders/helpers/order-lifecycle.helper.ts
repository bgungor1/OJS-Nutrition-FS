import { BadRequestException, NotFoundException } from '@nestjs/common';
import {
  Order,
  OrderItem,
  OrderStatus,
  PaymentTransaction,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  RESTOCKABLE_STATUSES,
  VALID_STATUS_TRANSITIONS,
} from '../order.constants';
import { UpdateOrderStatusDto } from '../dto/update-order-status.dto';

export type OrderWithRelations = Order & {
  items: OrderItem[];
  payment: PaymentTransaction | null;
};

export class OrderLifecycleHelper {
  static validateTransition(
    currentStatus: OrderStatus,
    targetStatus: OrderStatus,
  ): void {
    if (
      currentStatus === OrderStatus.cancelled ||
      currentStatus === OrderStatus.returned
    ) {
      throw new BadRequestException(
        'İptal edilmiş veya iade edilmiş bir siparişin durumu değiştirilemez.',
      );
    }

    const allowed = VALID_STATUS_TRANSITIONS[currentStatus] ?? [];
    if (!allowed.includes(targetStatus)) {
      throw new BadRequestException(
        `${currentStatus} durumundaki bir sipariş ${targetStatus} durumuna geçirilemez.`,
      );
    }
  }

  static async restockOrderItems(
    tx: Prisma.TransactionClient,
    items: Array<{ productVariantId: string; pieces: number }>,
  ): Promise<void> {
    for (const item of items) {
      await tx.productVariant.update({
        where: { id: item.productVariantId },
        data: {
          stockQuantity: { increment: item.pieces },
        },
      });
    }
  }

  static async executeStatusUpdate(
    prisma: PrismaService,
    orderId: string,
    dto: UpdateOrderStatusDto,
  ): Promise<{
    order: OrderWithRelations;
    updatedOrder: OrderWithRelations;
    isRestock: boolean;
  }> {
    const order = (await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, payment: true },
    })) as OrderWithRelations | null;

    if (!order) {
      throw new NotFoundException('Sipariş bulunamadı.');
    }

    OrderLifecycleHelper.validateTransition(order.status, dto.status);

    const isRestock = RESTOCKABLE_STATUSES.includes(dto.status);

    const updatedOrder = (await prisma.$transaction(
      async (tx) => {
        if (isRestock) {
          await OrderLifecycleHelper.restockOrderItems(tx, order.items);
        }

        return tx.order.update({
          where: { id: orderId },
          data: { status: dto.status },
          include: { items: true, payment: true },
        });
      },
      { timeout: 15000, maxWait: 5000 },
    )) as OrderWithRelations;

    return { order, updatedOrder, isRestock };
  }
}
