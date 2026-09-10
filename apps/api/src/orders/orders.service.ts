import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentsService } from '../payments/payments.service';
import { DEFAULT_CURRENCY, FREE_SHIPPING_THRESHOLD } from './order.constants';
import {
  OrderDetailResponse,
  ShipmentFeeResponse,
} from './interfaces/order-response.interface';
import { PaymentSettingsResponse } from '../payments/interfaces/payment-process.interface';
import { CompleteShoppingDto } from './dto/complete-shopping.dto';
import { OrderNoGeneratorHelper } from './helpers/order-no-generator.helper';
import { OrderPricingHelper } from './helpers/order-pricing.helper';
import { OrderCheckoutHelper } from './helpers/order-checkout.helper';
import { OrdersMapper } from './orders.mapper';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentsService: PaymentsService,
  ) {}

  getPaymentSettings(): PaymentSettingsResponse {
    return this.paymentsService.getPaymentSettings();
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

    const subtotal = OrderPricingHelper.calculateSubtotal(cartItems);
    const fee = OrderPricingHelper.calculateShippingFee(subtotal);

    return {
      fee,
      currency: DEFAULT_CURRENCY,
      free_shipping_threshold: FREE_SHIPPING_THRESHOLD,
      is_free: fee === 0,
    };
  }

  async completeShopping(
    userId: string,
    dto: CompleteShoppingDto,
    ipAddress?: string,
  ): Promise<OrderDetailResponse> {
    const address = await this.prisma.address.findFirst({
      where: { id: dto.address_id, userId },
      include: { country: true, region: true, subregion: true },
    });
    if (!address) {
      throw new NotFoundException('Belirtilen teslimat adresi bulunamadı.');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı.');
    }

    const cartItems = await this.prisma.cartItem.findMany({
      where: { userId },
      include: { product: true, productVariant: true },
      orderBy: { createdAt: 'asc' },
    });
    if (cartItems.length === 0) {
      throw new BadRequestException('Sepetinizde ürün bulunmamaktadır.');
    }

    const { shippingFee, totalPrice } =
      OrderPricingHelper.calculateOrderTotals(cartItems);
    const orderNo = OrderNoGeneratorHelper.generate();
    const addressSnapshot = OrderCheckoutHelper.buildAddressSnapshot(address);

    const order = await this.prisma.$transaction(
      async (tx) => {
        await OrderCheckoutHelper.decrementStockAtomic(tx, cartItems);

        const chargeRequest = OrderCheckoutHelper.buildChargeRequest({
          dto,
          user,
          address,
          cartItems,
          totalPrice,
          orderNo,
          ipAddress,
        });
        const chargeResult = await this.paymentsService.charge(chargeRequest);

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

    this.logger.log(
      `[ORDER_CREATED] OrderNo: ${order.orderNo} | User: ${userId} | Total: ${totalPrice} TRY | Items: ${cartItems.length}`,
    );

    return OrdersMapper.toOrderDetailResponse(order);
  }
}
