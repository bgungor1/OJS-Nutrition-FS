import { Order, OrderItem, PaymentTransaction, User } from '@prisma/client';
import { ADMIN_PAGINATION } from './admin.constants';
import {
  AdminOrderCustomerDto,
  AdminOrderDetailResponseDto,
  AdminOrderItemDto,
  AdminOrderListItemDto,
  AdminOrderPaymentDto,
  AdminOrdersPaginatedResponseDto,
  AdminOrdersQueryDto,
} from './dto';

export type AdminOrderWithRelations = Order & {
  user: User;
  items?: OrderItem[];
  payment?: PaymentTransaction | null;
};

export class AdminOrdersMapper {
  static toCustomerDto(user: User): AdminOrderCustomerDto {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
    };
  }

  static toPaymentDto(
    payment: PaymentTransaction | null | undefined,
  ): AdminOrderPaymentDto | null {
    if (!payment) return null;

    return {
      provider: payment.provider,
      providerRef: payment.providerRef,
      cardType: payment.cardType,
      last4: payment.last4,
      status: payment.status,
      createdAt: payment.createdAt.toISOString(),
    };
  }

  static toOrderItemDto(item: OrderItem): AdminOrderItemDto {
    return {
      id: item.id,
      productId: item.productId,
      productVariantId: item.productVariantId,
      productName: item.productName,
      variantName: item.variantName,
      pieces: item.pieces,
      unitPrice: Number(item.unitPrice),
      totalPrice: Number(item.totalPrice),
      photo: item.photo,
    };
  }

  static toListItemDto(order: AdminOrderWithRelations): AdminOrderListItemDto {
    const itemCount =
      order.items?.reduce((sum, item) => sum + item.pieces, 0) ?? 0;

    return {
      id: order.id,
      orderNo: order.orderNo,
      status: order.status,
      totalPrice: Number(order.totalPrice),
      shippingFee: Number(order.shippingFee),
      itemCount,
      createdAt: order.createdAt.toISOString(),
      user: this.toCustomerDto(order.user),
      payment: this.toPaymentDto(order.payment),
    };
  }

  static toDetailDto(
    order: AdminOrderWithRelations & { items: OrderItem[] },
  ): AdminOrderDetailResponseDto {
    return {
      id: order.id,
      orderNo: order.orderNo,
      status: order.status,
      totalPrice: Number(order.totalPrice),
      shippingFee: Number(order.shippingFee),
      addressSnapshot: (order.addressSnapshot as Record<string, unknown>) ?? {},
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      user: this.toCustomerDto(order.user),
      items: (order.items ?? []).map((item) => this.toOrderItemDto(item)),
      payment: this.toPaymentDto(order.payment),
    };
  }

  static toPaginatedResponseDto(
    orders: AdminOrderWithRelations[],
    count: number,
    query: AdminOrdersQueryDto,
  ): AdminOrdersPaginatedResponseDto {
    return {
      count,
      limit: query.limit ?? ADMIN_PAGINATION.DEFAULT_LIMIT,
      offset: query.offset ?? ADMIN_PAGINATION.DEFAULT_OFFSET,
      search: query.search ?? null,
      status: query.status ?? null,
      results: orders.map((order) => this.toListItemDto(order)),
    };
  }
}
