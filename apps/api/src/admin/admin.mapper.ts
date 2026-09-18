import {
  Role,
  User,
  Address,
  Country,
  Region,
  Subregion,
  Order,
  OrderItem,
} from '@prisma/client';
import {
  AdminUserAddressDto,
  AdminUserDetailResponseDto,
  AdminUserListItemDto,
  AdminUserOrderSummaryDto,
  AdminUsersPaginatedResponseDto,
} from './dto/admin-user-response.dto';

export type UserWithCountRelation = User & {
  _count?: {
    orders: number;
    addresses: number;
  };
};

export type AddressWithLocation = Address & {
  country: Country;
  region: Region;
  subregion: Subregion;
};

export type OrderWithItems = Order & {
  items: OrderItem[];
};

export type UserDetailRelation = User & {
  addresses: AddressWithLocation[];
  orders: OrderWithItems[];
  _count?: {
    orders: number;
    addresses: number;
  };
};

export class AdminMapper {
  static toUserListItem(
    user: UserWithCountRelation,
    totalSpent: number = 0,
  ): AdminUserListItemDto {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      role: user.role,
      authProvider: user.authProvider,
      ordersCount: user._count?.orders ?? 0,
      totalSpent: Math.round(totalSpent * 100) / 100,
      addressesCount: user._count?.addresses ?? 0,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  static toUserDetail(
    user: UserDetailRelation,
    totalSpent: number = 0,
  ): AdminUserDetailResponseDto {
    const addresses: AdminUserAddressDto[] = (user.addresses || []).map(
      (addr) => ({
        id: addr.id,
        title: addr.title,
        firstName: addr.firstName,
        lastName: addr.lastName,
        country: {
          id: addr.country.id,
          name: addr.country.name,
        },
        region: {
          id: addr.region.id,
          name: addr.region.name,
        },
        subregion: {
          id: addr.subregion.id,
          name: addr.subregion.name,
        },
        fullAddress: addr.fullAddress,
        phoneNumber: addr.phoneNumber,
        createdAt: addr.createdAt,
      }),
    );

    const recentOrders: AdminUserOrderSummaryDto[] = (user.orders || []).map(
      (order) => ({
        id: order.id,
        orderNo: order.orderNo,
        status: order.status,
        totalPrice: Number(order.totalPrice),
        itemsCount: (order.items || []).reduce(
          (sum, item) => sum + item.pieces,
          0,
        ),
        createdAt: order.createdAt,
      }),
    );

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      role: user.role,
      authProvider: user.authProvider,
      ordersCount: user._count?.orders ?? user.orders?.length ?? 0,
      totalSpent: Math.round(totalSpent * 100) / 100,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      addresses,
      recentOrders,
    };
  }

  static toPaginatedResponse(
    count: number,
    results: AdminUserListItemDto[],
    limit: number,
    offset: number,
    search?: string,
    role?: Role,
  ): AdminUsersPaginatedResponseDto {
    const buildQuery = (newOffset: number): string => {
      const params = new URLSearchParams();
      params.set('limit', limit.toString());
      params.set('offset', newOffset.toString());
      if (search) params.set('search', search);
      if (role) params.set('role', role);
      return `?${params.toString()}`;
    };

    const next = offset + limit < count ? buildQuery(offset + limit) : null;
    const previous =
      offset > 0 ? buildQuery(Math.max(0, offset - limit)) : null;

    return {
      count,
      next,
      previous,
      results,
    };
  }
}
