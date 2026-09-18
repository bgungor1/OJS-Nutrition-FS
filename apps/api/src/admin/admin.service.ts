import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus, Prisma, Role } from '@prisma/client';
import { AuditEvent, SecurityAuditService } from '../common/audit';
import { PrismaService } from '../prisma';
import { ADMIN_PAGINATION } from './admin.constants';
import { AdminMapper } from './admin.mapper';
import {
  AdminUserDetailResponseDto,
  AdminUserListItemDto,
  AdminUsersPaginatedResponseDto,
  AdminUsersQueryDto,
  UpdateUserRoleDto,
} from './dto';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: SecurityAuditService,
  ) {}

  async listUsers(
    query: AdminUsersQueryDto,
  ): Promise<AdminUsersPaginatedResponseDto> {
    const limit = query.limit ?? ADMIN_PAGINATION.DEFAULT_LIMIT;
    const offset = query.offset ?? ADMIN_PAGINATION.DEFAULT_OFFSET;
    const search = query.search?.trim();

    const where: Prisma.UserWhereInput = {};

    if (query.role) {
      where.role = query.role;
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [totalUsers, users] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { orders: true, addresses: true },
          },
        },
      }),
    ]);

    const userIds = users.map((u) => u.id);
    const spentMap = new Map<string, number>();

    if (userIds.length > 0) {
      const orderAggregates = await this.prisma.order.groupBy({
        by: ['userId'],
        where: {
          userId: { in: userIds },
          status: { notIn: [OrderStatus.cancelled, OrderStatus.returned] },
        },
        _sum: {
          totalPrice: true,
        },
      });

      for (const agg of orderAggregates) {
        if (agg.userId && agg._sum.totalPrice) {
          spentMap.set(agg.userId, Number(agg._sum.totalPrice));
        }
      }
    }

    const results: AdminUserListItemDto[] = users.map((user) =>
      AdminMapper.toUserListItem(user, spentMap.get(user.id) ?? 0),
    );

    return AdminMapper.toPaginatedResponse(
      totalUsers,
      results,
      limit,
      offset,
      search,
      query.role,
    );
  }

  async getUserById(id: string): Promise<AdminUserDetailResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        addresses: {
          include: { country: true, region: true, subregion: true },
          orderBy: { createdAt: 'desc' },
        },
        orders: {
          include: { items: true },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: { orders: true, addresses: true },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı.');
    }

    const validOrders = user.orders.filter(
      (o) =>
        o.status !== OrderStatus.cancelled && o.status !== OrderStatus.returned,
    );
    const totalSpent = validOrders.reduce(
      (sum, o) => sum + Number(o.totalPrice),
      0,
    );

    return AdminMapper.toUserDetail(user, totalSpent);
  }

  async updateUserRole(
    adminUserId: string,
    targetUserId: string,
    dto: UpdateUserRoleDto,
    ip?: string,
  ): Promise<AdminUserListItemDto> {
    const targetUser = await this.prisma.user.findUnique({
      where: { id: targetUserId },
      include: {
        _count: { select: { orders: true, addresses: true } },
      },
    });

    if (!targetUser) {
      throw new NotFoundException('Kullanıcı bulunamadı.');
    }

    if (adminUserId === targetUserId && dto.role !== Role.admin) {
      throw new BadRequestException(
        'Kendi yöneticilik yetkinizi kaldıramazsınız.',
      );
    }

    if (targetUser.role === Role.admin && dto.role !== Role.admin) {
      const adminCount = await this.prisma.user.count({
        where: { role: Role.admin },
      });

      if (adminCount <= 1) {
        throw new BadRequestException(
          'Sistemde en az bir yönetici bulunmalıdır.',
        );
      }
    }

    const previousRole = targetUser.role;

    const updatedUser = await this.prisma.user.update({
      where: { id: targetUserId },
      data: { role: dto.role },
      include: {
        _count: { select: { orders: true, addresses: true } },
      },
    });

    this.auditService.warn(AuditEvent.ADMIN_USER_ROLE_CHANGED, {
      ip,
      userId: adminUserId,
      resourceId: targetUserId,
      details: {
        targetEmail: targetUser.email,
        previousRole,
        newRole: dto.role,
      },
    });

    const spentAgg = await this.prisma.order.aggregate({
      where: {
        userId: targetUserId,
        status: { notIn: [OrderStatus.cancelled, OrderStatus.returned] },
      },
      _sum: { totalPrice: true },
    });
    const totalSpent = spentAgg._sum.totalPrice
      ? Number(spentAgg._sum.totalPrice)
      : 0;

    return AdminMapper.toUserListItem(updatedUser, totalSpent);
  }
}
