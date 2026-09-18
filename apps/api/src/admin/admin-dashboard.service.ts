import { Injectable } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { PrismaService } from '../prisma';
import { ADMIN_DASHBOARD } from './admin.constants';
import { AdminDashboardMapper } from './admin-dashboard.mapper';
import { DashboardStatsResponseDto } from './dto';

@Injectable()
export class AdminDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Admin paneli için özet metrikleri, ciro, statü dağılımı,
   * son siparişler, en çok satanlar, kritik stok uyarıları ve 30 günlük satış trendini döner.
   */
  async getDashboardStats(): Promise<DashboardStatsResponseDto> {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(
      thirtyDaysAgo.getDate() - (ADMIN_DASHBOARD.SALES_TREND_DAYS - 1),
    );
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const [
      totalOrders,
      revenueAgg,
      totalUsers,
      totalProducts,
      statusGroup,
      recentOrders,
      topSoldItems,
      lowStockVariants,
      trendOrders,
    ] = await Promise.all([
      this.prisma.order.count(),
      this.prisma.order.aggregate({
        _sum: { totalPrice: true },
        where: {
          status: { notIn: [OrderStatus.cancelled, OrderStatus.returned] },
        },
      }),
      this.prisma.user.count(),
      this.prisma.product.count(),
      this.prisma.order.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
      this.prisma.order.findMany({
        take: ADMIN_DASHBOARD.RECENT_ORDERS_LIMIT,
        orderBy: { createdAt: 'desc' },
        include: {
          user: true,
          items: true,
        },
      }),
      this.prisma.orderItem.groupBy({
        by: ['productId', 'productName'],
        where: {
          order: {
            status: { notIn: [OrderStatus.cancelled, OrderStatus.returned] },
          },
        },
        _sum: {
          pieces: true,
          totalPrice: true,
        },
        orderBy: {
          _sum: {
            pieces: 'desc',
          },
        },
        take: ADMIN_DASHBOARD.TOP_PRODUCTS_LIMIT,
      }),
      this.prisma.productVariant.findMany({
        where: {
          stockQuantity: { lte: ADMIN_DASHBOARD.LOW_STOCK_THRESHOLD },
        },
        orderBy: {
          stockQuantity: 'asc',
        },
        take: 20,
        include: {
          product: {
            select: {
              name: true,
              slug: true,
            },
          },
        },
      }),
      this.prisma.order.findMany({
        where: {
          createdAt: { gte: thirtyDaysAgo },
          status: { notIn: [OrderStatus.cancelled, OrderStatus.returned] },
        },
        select: {
          createdAt: true,
          totalPrice: true,
        },
      }),
    ]);

    const totalRevenue = revenueAgg._sum.totalPrice
      ? Number(revenueAgg._sum.totalPrice)
      : 0;

    const summary = AdminDashboardMapper.toDashboardSummary(
      totalOrders,
      totalRevenue,
      totalUsers,
      totalProducts,
    );

    const ordersByStatus = AdminDashboardMapper.toOrdersByStatus(statusGroup);
    const mappedRecentOrders =
      AdminDashboardMapper.toRecentOrders(recentOrders);

    // En çok satan ürünlerin görsellerini eşleştirmek için tek sorgu
    const topProductIds = topSoldItems.map((item) => item.productId);
    const productPhotos = new Map<string, string | null>();

    if (topProductIds.length > 0) {
      const productsWithVariants = await this.prisma.product.findMany({
        where: { id: { in: topProductIds } },
        select: {
          id: true,
          variants: {
            take: 1,
            select: { photoSrc: true },
          },
        },
      });

      for (const p of productsWithVariants) {
        productPhotos.set(p.id, p.variants[0]?.photoSrc ?? null);
      }
    }

    const mappedTopProducts = AdminDashboardMapper.toTopProducts(
      topSoldItems,
      productPhotos,
    );
    const mappedLowStockVariants =
      AdminDashboardMapper.toLowStockVariants(lowStockVariants);

    const dailyMap = new Map<
      string,
      { orderCount: number; totalRevenue: number }
    >();

    for (let i = 0; i < ADMIN_DASHBOARD.SALES_TREND_DAYS; i++) {
      const d = new Date(thirtyDaysAgo);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      dailyMap.set(dateStr, { orderCount: 0, totalRevenue: 0 });
    }

    for (const order of trendOrders) {
      const dateStr = order.createdAt.toISOString().split('T')[0];
      const entry = dailyMap.get(dateStr);
      if (entry) {
        entry.orderCount += 1;
        entry.totalRevenue += Number(order.totalPrice);
      }
    }

    const salesTrend = AdminDashboardMapper.toSalesTrend(dailyMap);

    return {
      summary,
      ordersByStatus,
      recentOrders: mappedRecentOrders,
      topProducts: mappedTopProducts,
      lowStockVariants: mappedLowStockVariants,
      salesTrend,
    };
  }
}
