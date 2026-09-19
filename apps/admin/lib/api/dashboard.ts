import { serverFetch } from '@/lib/api-client';
import type { DashboardStatsResponse } from '@/types';

export async function getDashboardStats(): Promise<DashboardStatsResponse> {
  return serverFetch<DashboardStatsResponse>('/admin/dashboard/stats');
}
