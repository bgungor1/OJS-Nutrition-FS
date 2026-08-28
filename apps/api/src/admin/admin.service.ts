import { Injectable } from '@nestjs/common';

/**
 * Faz 5 — BACKEND_PLAN §5.10. Yalnızca admin'e özgü agregasyon uçları burada;
 * ürün/sipariş/FAQ/contact mutasyonları ilgili controller'lara @Roles('admin')
 * ile eklenir.
 *  - dashboardStats(): { totalOrders, totalRevenue, ordersByStatus,
 *    recentOrders, topProducts }
 *  - listUsers({ limit, offset }): salt-okunur
 */
@Injectable()
export class AdminService {}
