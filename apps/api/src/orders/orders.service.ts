import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentsService } from '../payments/payments.service';
import {
  DEFAULT_CURRENCY,
  DEFAULT_SHIPPING_FEE,
  FREE_SHIPPING_THRESHOLD,
} from './order.constants';
import { ShipmentFeeResponse } from './interfaces/order-response.interface';
import { PaymentSettingsResponse } from '../payments/interfaces/payment-process.interface';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentsService: PaymentsService,
  ) {}

  getPaymentSettings(): PaymentSettingsResponse {
    return this.paymentsService.getPaymentSettings();
  }

  calculateSubtotal(
    cartItems: Array<{
      pieces: number;
      productVariant: {
        totalPrice: unknown;
        discountedPrice: unknown;
      };
    }>,
  ): number {
    const rawSubtotal = cartItems.reduce((acc, item) => {
      const price =
        item.productVariant.discountedPrice !== null &&
        item.productVariant.discountedPrice !== undefined
          ? Number(item.productVariant.discountedPrice)
          : Number(item.productVariant.totalPrice);
      return acc + price * item.pieces;
    }, 0);

    return Number(rawSubtotal.toFixed(2));
  }

  calculateShippingFeeFromSubtotal(subtotal: number): number {
    if (subtotal >= FREE_SHIPPING_THRESHOLD) {
      return 0;
    }
    return DEFAULT_SHIPPING_FEE;
  }

  async calculateShipmentFee(
    userId: string,
    addressId: string,
  ): Promise<ShipmentFeeResponse> {
    const address = await this.prisma.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!address) {
      throw new NotFoundException('Teslimat adresi bulunamadı.');
    }

    const cartItems = await this.prisma.cartItem.findMany({
      where: { userId },
      include: { productVariant: true },
    });

    const subtotal = this.calculateSubtotal(cartItems);
    const fee = this.calculateShippingFeeFromSubtotal(subtotal);
    const isFree = fee === 0;

    return {
      fee,
      currency: DEFAULT_CURRENCY,
      free_shipping_threshold: FREE_SHIPPING_THRESHOLD,
      is_free: isFree,
    };
  }
}
