import {
  Order,
  OrderItem,
  OrderStatus,
  ProductVariant,
  User,
} from '@prisma/client';
import {
  AdminLowStockVariantDto,
  AdminRecentOrderDto,
  AdminSalesTrendItemDto,
  AdminTopProductDto,
  DashboardSummaryDto,
  OrdersByStatusDto,
} from './dto/dashboard-stats-response.dto';

export type OrderWithUserAndItems = Order & {
  user: User;
  items: OrderItem[];
};

export type LowStockVariantRelation = ProductVariant & {
  product: {
    name: string;
    slug: string;
  };
};

export class AdminDashboardMapper {
  static toDashboardSummary(
    totalOrders: number,
    totalRevenue: number,
    totalUsers: number,
    totalProducts: number,
  ): DashboardSummaryDto {
    return {
      totalOrders,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalUsers,
      totalProducts,
    };
  }

  static toOrdersByStatus(
    statusCounts: Array<{ status: OrderStatus; _count: { id: number } }>,
  ): OrdersByStatusDto {
    const statusMap: Record<OrderStatus, number> = {
      [OrderStatus.pending]: 0,
      [OrderStatus.processing]: 0,
      [OrderStatus.shipped]: 0,
      [OrderStatus.delivered]: 0,
      [OrderStatus.cancelled]: 0,
      [OrderStatus.returned]: 0,
    };

    for (const item of statusCounts) {
      if (item.status in statusMap) {
        statusMap[item.status] = item._count.id;
      }
    }

    return {
      pending: statusMap.pending,
      processing: statusMap.processing,
      shipped: statusMap.shipped,
      delivered: statusMap.delivered,
      cancelled: statusMap.cancelled,
      returned: statusMap.returned,
    };
  }

  static toRecentOrders(
    orders: OrderWithUserAndItems[],
  ): AdminRecentOrderDto[] {
    return orders.map((order) => ({
      id: order.id,
      orderNo: order.orderNo,
      customerName:
        `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim() ||
        order.user.email,
      customerEmail: order.user.email,
      totalPrice: Number(order.totalPrice),
      status: order.status,
      itemsCount: (order.items || []).reduce(
        (sum, item) => sum + item.pieces,
        0,
      ),
      createdAt: order.createdAt,
    }));
  }

  static toTopProducts(
    topItems: Array<{
      productId: string;
      productName: string;
      _sum: {
        pieces: number | null;
        totalPrice: unknown;
      };
    }>,
    productPhotos: Map<string, string | null> = new Map(),
  ): AdminTopProductDto[] {
    return topItems.map((item) => ({
      productId: item.productId,
      productName: item.productName,
      totalQuantitySold: item._sum.pieces ?? 0,
      totalRevenue: Math.round(Number(item._sum.totalPrice ?? 0) * 100) / 100,
      photoSrc: productPhotos.get(item.productId) ?? null,
    }));
  }

  static toLowStockVariants(
    variants: LowStockVariantRelation[],
  ): AdminLowStockVariantDto[] {
    return variants.map((v) => ({
      variantId: v.id,
      productId: v.productId,
      productName: v.product.name,
      productSlug: v.product.slug,
      aroma: v.aroma,
      gram: v.gram,
      stockQuantity: v.stockQuantity,
      isAvailable: v.isAvailable,
      photoSrc: v.photoSrc,
    }));
  }

  static toSalesTrend(
    dailyData: Map<string, { orderCount: number; totalRevenue: number }>,
  ): AdminSalesTrendItemDto[] {
    const trend: AdminSalesTrendItemDto[] = [];
    for (const [date, data] of dailyData.entries()) {
      trend.push({
        date,
        orderCount: data.orderCount,
        totalRevenue: Math.round(data.totalRevenue * 100) / 100,
      });
    }
    return trend.sort((a, b) => a.date.localeCompare(b.date));
  }
}
