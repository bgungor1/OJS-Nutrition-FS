import { Order, OrderItem, PaymentTransaction } from '@prisma/client';
import {
  AddressSnapshot,
  OrderDetailResponse,
  OrderItemResponse,
  OrderSummaryResponse,
  PaginatedOrdersResponse,
  PaymentSummaryResponse,
} from './interfaces/order-response.interface';

export type OrderWithRelations = Order & {
  items?: OrderItem[];
  payment?: PaymentTransaction | null;
};

export class OrdersMapper {
  static toAddressSnapshot(raw: unknown): AddressSnapshot {
    if (!raw || typeof raw !== 'object') {
      return {
        title: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
        country: '',
        region: '',
        subregion: '',
        fullAddress: '',
      };
    }

    const obj = raw as Record<string, unknown>;
    const getString = (val: unknown): string =>
      typeof val === 'string' ? val : '';

    return {
      title: getString(obj.title),
      firstName: getString(obj.firstName),
      lastName: getString(obj.lastName),
      phoneNumber: getString(obj.phoneNumber),
      country: getString(obj.country),
      region: getString(obj.region),
      subregion: getString(obj.subregion),
      fullAddress: getString(obj.fullAddress),
    };
  }

  static toPaymentSummary(
    payment: PaymentTransaction | null | undefined,
  ): PaymentSummaryResponse | null {
    if (!payment) return null;

    return {
      provider: payment.provider,
      provider_ref: payment.providerRef,
      card_type: payment.cardType,
      last4: payment.last4,
      status: payment.status,
      created_at: payment.createdAt.toISOString(),
    };
  }

  static toOrderItemResponse(item: OrderItem): OrderItemResponse {
    const unitPrice = Number(item.unitPrice);
    const totalPrice = Number(item.totalPrice);

    return {
      id: item.id,
      product_id: item.productId,
      product_variant_id: item.productVariantId,
      product_name: item.productName,
      variant_name: item.variantName,
      pieces: item.pieces,
      unit_price: unitPrice,
      total_price: totalPrice,
      photo: item.photo,
      photo_src: item.photo,
    };
  }

  static toOrderDetailResponse(order: OrderWithRelations): OrderDetailResponse {
    const totalPrice = Number(order.totalPrice);
    const shippingFee = Number(order.shippingFee);
    const subtotal = Number((totalPrice - shippingFee).toFixed(2));

    const items = (order.items ?? []).map((item) =>
      this.toOrderItemResponse(item),
    );

    return {
      id: order.id,
      order_no: order.orderNo,
      status: order.status,
      total_price: totalPrice,
      shipping_fee: shippingFee,
      subtotal,
      address_snapshot: this.toAddressSnapshot(order.addressSnapshot),
      items,
      cart_detail: items,
      payment: this.toPaymentSummary(order.payment),
      created_at: order.createdAt.toISOString(),
      updated_at: order.updatedAt.toISOString(),
    };
  }

  static toOrderSummaryResponse(
    order: OrderWithRelations,
  ): OrderSummaryResponse {
    const totalPrice = Number(order.totalPrice);
    const shippingFee = Number(order.shippingFee);

    const itemCount =
      order.items?.reduce((acc, item) => acc + item.pieces, 0) ?? 0;

    return {
      id: order.id,
      order_no: order.orderNo,
      status: order.status,
      total_price: totalPrice,
      shipping_fee: shippingFee,
      item_count: itemCount,
      created_at: order.createdAt.toISOString(),
      updated_at: order.updatedAt.toISOString(),
      payment: this.toPaymentSummary(order.payment),
    };
  }

  static toOrderSummaryList(
    orders: OrderWithRelations[],
  ): OrderSummaryResponse[] {
    return orders.map((order) => this.toOrderSummaryResponse(order));
  }

  static toPaginatedOrdersResponse(
    orders: OrderWithRelations[],
    count: number,
  ): PaginatedOrdersResponse {
    return {
      count,
      results: this.toOrderSummaryList(orders),
    };
  }
}
