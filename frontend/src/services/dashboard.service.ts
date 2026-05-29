import { api } from '../api/client';
import type { SalesDataPoint, WasteDataPoint } from '../types';

export interface DashboardStats {
  inventory: {
    totalProducts: number;
    totalValue: number;
    lowStock: number;
    critical: number;
    expired: number;
  };
  orders: {
    total: number;
    byStatus: {
      pending: number;
      packed: number;
      outForDelivery: number;
      delivered: number;
      cancelled: number;
    };
  };
  deliveries: {
    total: number;
    byStatus: {
      scheduled: number;
      inTransit: number;
      delivered: number;
      delayed: number;
    };
  };
  suppliers: {
    active: number;
    avgPerformance: number;
    recentDeliveries: Array<{ id: string; name: string; performanceScore: number; lastDelivery: string | null; status: string }>;
  };
  recentOrders: Array<Record<string, unknown>>;
  activeDeliveries: Array<Record<string, unknown>>;
  salesSeries: SalesDataPoint[];
  wasteSeries: WasteDataPoint[];
}

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const res = await api.get<{ data: DashboardStats }>('/dashboard/stats');
    return res.data;
  },
};
