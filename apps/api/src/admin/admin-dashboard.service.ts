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
    thirtyDaysAgo.setUTCDate(
      thirtyDaysAgo.getUTCDate() - (ADMIN_DASHBOARD.SALES_TREND_DAYS - 1),
    );
    thirtyDaysAgo.setUTCHours(0, 0, 0, 0);

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
      this.getSalesTrendRaw(thirtyDaysAgo),
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
      d.setUTCDate(d.getUTCDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      dailyMap.set(dateStr, { orderCount: 0, totalRevenue: 0 });
    }

    for (const row of trendOrders) {
      const entry = dailyMap.get(row.date);
      if (entry) {
        entry.orderCount = Number(row.orderCount);
        entry.totalRevenue = Number(row.totalRevenue);
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

  /**
   * 30 günlük satış trendini hesaplar.
   * PostgreSQL seviyesinde date_trunc ile hesaplamayı önceler;
   * Mock/test ortamlarında veya queryRaw desteklenmeyen durumlarda in-memory fallback çalıştırır.
   */
  private async getSalesTrendRaw(
    thirtyDaysAgo: Date,
  ): Promise<
    Array<{ date: string; orderCount: number; totalRevenue: number }>
  > {
    if (typeof this.prisma.$queryRaw === 'function') {
      try {
        return await this.prisma.$queryRaw<
          Array<{ date: string; orderCount: number; totalRevenue: number }>
        >`
          SELECT 
            to_char(date_trunc('day', "createdAt"), 'YYYY-MM-DD') AS date,
            COUNT(*)::int AS "orderCount",
            COALESCE(SUM("totalPrice"), 0)::float AS "totalRevenue"
          FROM "Order"
          WHERE "createdAt" >= ${thirtyDaysAgo}
            AND "status" NOT IN ('cancelled'::"OrderStatus", 'returned'::"OrderStatus")
          GROUP BY date_trunc('day', "createdAt")
          ORDER BY date ASC
        `;
      } catch {
        // noop
      }
    }

    const fallbackOrders = await this.prisma.order.findMany({
      where: {
        createdAt: { gte: thirtyDaysAgo },
        status: { notIn: [OrderStatus.cancelled, OrderStatus.returned] },
      },
      select: { createdAt: true, totalPrice: true },
    });

    const fallbackMap = new Map<
      string,
      { orderCount: number; totalRevenue: number }
    >();
    for (const ord of fallbackOrders) {
      const dateKey = ord.createdAt.toISOString().split('T')[0];
      const existing = fallbackMap.get(dateKey) ?? {
        orderCount: 0,
        totalRevenue: 0,
      };
      existing.orderCount += 1;
      existing.totalRevenue += Number(ord.totalPrice);
      fallbackMap.set(dateKey, existing);
    }

    return Array.from(fallbackMap.entries()).map(([date, data]) => ({
      date,
      orderCount: data.orderCount,
      totalRevenue: data.totalRevenue,
    }));
  }
}
