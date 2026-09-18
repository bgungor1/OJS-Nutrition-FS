import { OrderStatus, Role } from '@prisma/client';
import {
  AdminDashboardMapper,
  LowStockVariantRelation,
  OrderWithUserAndItems,
} from './admin-dashboard.mapper';
import {
  AdminUserMapper,
  UserDetailRelation,
  UserWithCountRelation,
} from './admin-user.mapper';
import {
  AdminUserDetailResponseDto,
  AdminUserListItemDto,
  AdminUsersPaginatedResponseDto,
} from './dto/admin-user-response.dto';
import {
  AdminLowStockVariantDto,
  AdminRecentOrderDto,
  AdminSalesTrendItemDto,
  AdminTopProductDto,
  DashboardSummaryDto,
  OrdersByStatusDto,
} from './dto/dashboard-stats-response.dto';

export * from './admin-user.mapper';
export * from './admin-dashboard.mapper';

export class AdminMapper {
  // User mappings
  static toUserListItem(
    user: UserWithCountRelation,
    totalSpent: number = 0,
  ): AdminUserListItemDto {
    return AdminUserMapper.toUserListItem(user, totalSpent);
  }

  static toUserDetail(
    user: UserDetailRelation,
    totalSpent: number = 0,
  ): AdminUserDetailResponseDto {
    return AdminUserMapper.toUserDetail(user, totalSpent);
  }

  static toPaginatedResponse(
    count: number,
    results: AdminUserListItemDto[],
    limit: number,
    offset: number,
    search?: string,
    role?: Role,
  ): AdminUsersPaginatedResponseDto {
    return AdminUserMapper.toPaginatedResponse(
      count,
      results,
      limit,
      offset,
      search,
      role,
    );
  }

  // Dashboard mappings
  static toDashboardSummary(
    totalOrders: number,
    totalRevenue: number,
    totalUsers: number,
    totalProducts: number,
  ): DashboardSummaryDto {
    return AdminDashboardMapper.toDashboardSummary(
      totalOrders,
      totalRevenue,
      totalUsers,
      totalProducts,
    );
  }

  static toOrdersByStatus(
    statusCounts: Array<{ status: OrderStatus; _count: { id: number } }>,
  ): OrdersByStatusDto {
    return AdminDashboardMapper.toOrdersByStatus(statusCounts);
  }

  static toRecentOrders(
    orders: OrderWithUserAndItems[],
  ): AdminRecentOrderDto[] {
    return AdminDashboardMapper.toRecentOrders(orders);
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
    return AdminDashboardMapper.toTopProducts(topItems, productPhotos);
  }

  static toLowStockVariants(
    variants: LowStockVariantRelation[],
  ): AdminLowStockVariantDto[] {
    return AdminDashboardMapper.toLowStockVariants(variants);
  }

  static toSalesTrend(
    dailyData: Map<string, { orderCount: number; totalRevenue: number }>,
  ): AdminSalesTrendItemDto[] {
    return AdminDashboardMapper.toSalesTrend(dailyData);
  }
}
