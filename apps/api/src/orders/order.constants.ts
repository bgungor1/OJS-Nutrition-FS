import { OrderStatus } from '@prisma/client';

export const FREE_SHIPPING_THRESHOLD = 500;

export const DEFAULT_SHIPPING_FEE = 49.9;

export const ORDER_NO_PREFIX = 'ORD';

export const DEFAULT_CURRENCY = 'TRY';
export const VALID_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.pending]: [OrderStatus.processing, OrderStatus.cancelled],
  [OrderStatus.processing]: [OrderStatus.shipped, OrderStatus.cancelled],
  [OrderStatus.shipped]: [OrderStatus.delivered],
  [OrderStatus.delivered]: [OrderStatus.returned],
  [OrderStatus.cancelled]: [],
  [OrderStatus.returned]: [],
};

export const RESTOCKABLE_STATUSES: OrderStatus[] = [
  OrderStatus.cancelled,
  OrderStatus.returned,
];
