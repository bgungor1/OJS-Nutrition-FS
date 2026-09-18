import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AuditEvent } from '../common/audit/audit-event.enum';
import { SecurityAuditService } from '../common/audit/security-audit.service';
import { OrderLifecycleHelper } from '../orders/helpers/order-lifecycle.helper';
import { PrismaService } from '../prisma/prisma.service';
import { ADMIN_PAGINATION } from './admin.constants';
import { AdminOrdersMapper } from './admin-orders.mapper';
import {
  AdminOrderDetailResponseDto,
  AdminOrdersPaginatedResponseDto,
  AdminOrdersQueryDto,
  AdminOrderSort,
  UpdateAdminOrderStatusDto,
} from './dto';

@Injectable()
export class AdminOrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: SecurityAuditService,
  ) {}

  async listOrders(
    query: AdminOrdersQueryDto,
  ): Promise<AdminOrdersPaginatedResponseDto> {
    const limit = query.limit ?? ADMIN_PAGINATION.DEFAULT_LIMIT;
    const offset = query.offset ?? ADMIN_PAGINATION.DEFAULT_OFFSET;
    const where = this.buildWhereClause(query);
    const orderBy = this.resolveSortOrder(query.sort);

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          user: true,
          items: true,
          payment: true,
        },
        orderBy,
        take: limit,
        skip: offset,
      }),
      this.prisma.order.count({ where }),
    ]);

    return AdminOrdersMapper.toPaginatedResponseDto(orders, total, query);
  }

  async getOrderById(orderId: string): Promise<AdminOrderDetailResponseDto> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        items: true,
        payment: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Sipariş bulunamadı.');
    }

    return AdminOrdersMapper.toDetailDto(order);
  }

  async updateOrderStatus(
    orderId: string,
    dto: UpdateAdminOrderStatusDto,
    adminUserId: string,
    ip?: string,
  ): Promise<AdminOrderDetailResponseDto> {
    const { order, isRestock } = await OrderLifecycleHelper.executeStatusUpdate(
      this.prisma,
      orderId,
      dto,
    );

    const fullOrder = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        items: true,
        payment: true,
      },
    });

    if (!fullOrder) {
      throw new NotFoundException('Sipariş bulunamadı.');
    }

    this.auditService.info(AuditEvent.ADMIN_ORDER_STATUS_UPDATED, {
      ip,
      userId: adminUserId,
      resourceId: orderId,
      details: {
        orderNo: order.orderNo,
        customerId: order.userId,
        previousStatus: order.status,
        newStatus: dto.status,
      },
    });

    if (isRestock) {
      this.auditService.warn(AuditEvent.ORDER_CANCELLED_RESTOCKED, {
        ip,
        userId: adminUserId,
        resourceId: orderId,
        details: {
          orderNo: order.orderNo,
          restockedItemsCount: order.items.length,
        },
      });
    }

    return AdminOrdersMapper.toDetailDto(fullOrder);
  }

  private buildWhereClause(query: AdminOrdersQueryDto): Prisma.OrderWhereInput {
    const where: Prisma.OrderWhereInput = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.startDate || query.endDate) {
      const createdAtFilter: Prisma.DateTimeFilter = {};
      if (query.startDate) {
        createdAtFilter.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        const endDate = new Date(query.endDate);
        if (query.endDate.length === 10) {
          endDate.setUTCHours(23, 59, 59, 999);
        }
        createdAtFilter.lte = endDate;
      }
      where.createdAt = createdAtFilter;
    }

    if (query.search) {
      where.OR = [
        { orderNo: { contains: query.search, mode: 'insensitive' } },
        { user: { email: { contains: query.search, mode: 'insensitive' } } },
        {
          user: { firstName: { contains: query.search, mode: 'insensitive' } },
        },
        { user: { lastName: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    return where;
  }

  private resolveSortOrder(
    sort?: AdminOrderSort,
  ): Prisma.OrderOrderByWithRelationInput {
    switch (sort) {
      case 'date_asc':
        return { createdAt: 'asc' };
      case 'total_desc':
        return { totalPrice: 'desc' };
      case 'total_asc':
        return { totalPrice: 'asc' };
      case 'date_desc':
      default:
        return { createdAt: 'desc' };
    }
  }
}
