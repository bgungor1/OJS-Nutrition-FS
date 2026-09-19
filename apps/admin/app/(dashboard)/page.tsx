import * as React from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { getDashboardStats } from '@/lib/api/dashboard';
import { formatPrice } from '@/lib/utils';
import {
  MetricCard,
  SalesTrendChart,
  StatusBreakdown,
  RecentOrdersTable,
  CriticalStockTable,
  TopProductsCard,
} from '@/components/dashboard';
import type { DashboardStatsResponse } from '@/types';
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  AlertCircle,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  let stats: DashboardStatsResponse | null = null;
  let fetchError: string | null = null;

  try {
    stats = await getDashboardStats();
  } catch (err) {
    fetchError =
      err instanceof Error ? err.message : 'Dashboard verileri alınamadı.';
  }

  if (!stats) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Dashboard"
          description="OJS Nutrition mağaza performansı, sipariş özetleri ve analitik genel bakış."
        />
        <div
          data-testid="dashboard-error-banner"
          className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-destructive flex items-center gap-3 text-sm"
        >
          <AlertCircle className="h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">Dashboard verileri yüklenirken bir hata oluştu.</p>
            <p className="text-xs opacity-90">{fetchError}</p>
          </div>
        </div>
      </div>
    );
  }

  const activeOrdersCount =
    (stats.ordersByStatus.pending || 0) + (stats.ordersByStatus.processing || 0);

  const criticalVariantsCount = stats.lowStockVariants.length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="OJS Nutrition mağaza performansı, sipariş özetleri ve analitik genel bakış."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard
          testId="metric-total-revenue"
          title="Toplam Ciro"
          value={formatPrice(stats.summary.totalRevenue)}
          icon={DollarSign}
          description="Net tahsilat tutarı"
        />

        <MetricCard
          testId="metric-total-orders"
          title="Toplam Sipariş"
          value={stats.summary.totalOrders}
          icon={ShoppingCart}
          description={
            activeOrdersCount > 0
              ? `${activeOrdersCount} sipariş hazırlanıyor/beklemede`
              : 'Aktif bekleyen sipariş yok'
          }
        />

        <MetricCard
          testId="metric-total-users"
          title="Kayıtlı Müşteri"
          value={stats.summary.totalUsers}
          icon={Users}
          description="Kayıtlı kullanıcı tabanı"
        />

        <MetricCard
          testId="metric-total-products"
          title="Katalog Ürünleri"
          value={stats.summary.totalProducts}
          icon={Package}
          badgeText={criticalVariantsCount > 0 ? `${criticalVariantsCount} Kritik` : undefined}
          badgeVariant={criticalVariantsCount > 0 ? 'destructive' : 'success'}
          description={
            criticalVariantsCount > 0
              ? `${criticalVariantsCount} varyantın stoğu tükenmek üzere`
              : 'Tüm stok seviyeleri yeterli'
          }
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <SalesTrendChart data={stats.salesTrend} />
        </div>
        <div className="xl:col-span-1">
          <StatusBreakdown ordersByStatus={stats.ordersByStatus} />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <RecentOrdersTable orders={stats.recentOrders} />
        </div>
        <div className="xl:col-span-1 space-y-6">
          <CriticalStockTable variants={stats.lowStockVariants} />
          <TopProductsCard products={stats.topProducts} />
        </div>
      </div>
    </div>
  );
}
