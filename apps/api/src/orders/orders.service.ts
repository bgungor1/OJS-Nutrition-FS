import {
  Injectable,
  Logger,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { AuditEvent, SecurityAuditService } from '../common/audit';
import { PrismaService } from '../prisma';
import { PaymentsService, PaymentSettingsResponse } from '../payments';
import { PAGINATION } from '../common';
import { DEFAULT_CURRENCY, FREE_SHIPPING_THRESHOLD } from './order.constants';
import {
  OrderDetailResponse,
  PaginatedOrdersResponse,
  ShipmentFeeResponse,
} from './interfaces';
import {
  CompleteShoppingDto,
  OrderQueryDto,
  UpdateOrderStatusDto,
} from './dto';
import {
  OrderPricingHelper,
  OrderCheckoutHelper,
  OrderLifecycleHelper,
} from './helpers';
import { OrdersMapper } from './orders.mapper';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentsService: PaymentsService,
    @Optional() private readonly auditService?: SecurityAuditService,
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

  async findUserOrders(
    userId: string,
    query?: OrderQueryDto,
  ): Promise<PaginatedOrdersResponse> {
    const limit = query?.limit ?? PAGINATION.DEFAULT_LIMIT;
    const offset = query?.offset ?? PAGINATION.DEFAULT_OFFSET;
    const statusFilter = query?.status ? { status: query.status } : {};

    const where = { userId, ...statusFilter };

    const [orders, count] = await Promise.all([
      this.prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
        include: {
          items: true,
          payment: true,
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return OrdersMapper.toPaginatedOrdersResponse(orders, count);
  }

  async findUserOrderById(
    userId: string,
    orderId: string,
  ): Promise<OrderDetailResponse> {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, userId },
      include: {
        items: true,
        payment: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Sipariş bulunamadı.');
    }

    return OrdersMapper.toOrderDetailResponse(order);
  }

  async completeShopping(
    userId: string,
    dto: CompleteShoppingDto,
    ipAddress?: string,
  ): Promise<OrderDetailResponse> {
    const context = await OrderCheckoutHelper.prepareCheckoutContext(
      this.prisma,
      userId,
      dto,
    );

    const order = await OrderCheckoutHelper.executeCheckoutTransaction(
      this.prisma,
      this.paymentsService,
      context,
      dto,
      userId,
      ipAddress,
    );

    this.logger.log(
      `[ORDER_CREATED] OrderNo: ${order.orderNo} | User: ${userId} | Total: ${context.totalPrice} TRY | Items: ${context.cartItems.length}`,
    );

    this.auditService?.info(AuditEvent.ORDER_CREATED, {
      ip: ipAddress,
      userId,
      resourceId: order.orderNo,
      details: {
        totalPrice: Number(context.totalPrice),
        itemsCount: context.cartItems.length,
      },
    });

    return OrdersMapper.toOrderDetailResponse(order);
  }

  async updateOrderStatus(
    orderId: string,
    dto: UpdateOrderStatusDto,
  ): Promise<OrderDetailResponse> {
    const { order, updatedOrder, isRestock } =
      await OrderLifecycleHelper.executeStatusUpdate(this.prisma, orderId, dto);

    this.logger.warn(
      `[ORDER_STATUS_UPDATED] OrderNo: ${order.orderNo} | Status: ${order.status} -> ${dto.status}${isRestock ? ` | Restocked: ${order.items.length} items` : ''}`,
    );

    if (isRestock) {
      this.auditService?.warn(AuditEvent.ORDER_CANCELLED_RESTOCKED, {
        resourceId: order.orderNo,
        details: {
          orderId,
          previousStatus: order.status,
          newStatus: dto.status,
          restockedItems: order.items.length,
        },
      });
    } else {
      this.auditService?.info(AuditEvent.ORDER_STATUS_CHANGED, {
        resourceId: order.orderNo,
        details: {
          orderId,
          previousStatus: order.status,
          newStatus: dto.status,
        },
      });
    }

    return OrdersMapper.toOrderDetailResponse(updatedOrder);
  }
}
