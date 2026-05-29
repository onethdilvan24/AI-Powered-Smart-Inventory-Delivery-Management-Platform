import { api } from '../api/client';
import type { Order, OrderStatus, OrderItem } from '../types';

function mapStatus(s: string): OrderStatus {
  return s.toLowerCase() as OrderStatus;
}

function mapOrder(o: Record<string, unknown>): Order {
  const sup = o.supplier as { id: string; name: string } | null;
  const items = (o.items as Record<string, unknown>[]) ?? [];
  return {
    id: o.id as string,
    orderNumber: o.orderNumber as string,
    supplierId: (sup?.id ?? o.supplierId) as string,
    supplierName: sup?.name ?? '',
    status: mapStatus(o.status as string),
    createdAt: (o.createdAt as string).split('T')[0],
    expectedDelivery: (o.expectedDelivery as string).split('T')[0],
    items: items.map(item => ({
      productId: item.productId as string ?? '',
      productName: item.productName as string,
      quantity: item.quantity as number,
      unit: item.unit as string,
      unitPrice: item.unitPrice as number,
    } satisfies OrderItem)),
    total: o.total as number,
    notes: o.notes as string | undefined,
  };
}

export interface CreateOrderInput {
  supplierId: string;
  expectedDelivery: string;
  notes?: string;
  items: { productName: string; quantity: number; unit: string; unitPrice: number }[];
}

export const ordersService = {
  async list(filters?: { status?: string; supplierId?: string }): Promise<Order[]> {
    const params = new URLSearchParams();
    if (filters?.status && filters.status !== 'all') params.set('status', filters.status.toUpperCase());
    if (filters?.supplierId) params.set('supplierId', filters.supplierId);
    const qs = params.toString();
    const res = await api.get<{ data: Record<string, unknown>[] }>(
      `/orders${qs ? `?${qs}` : ''}`,
    );
    return res.data.map(mapOrder);
  },

  async get(id: string): Promise<Order> {
    const res = await api.get<{ data: Record<string, unknown> }>(`/orders/${id}`);
    return mapOrder(res.data);
  },

  async create(input: CreateOrderInput): Promise<Order> {
    const res = await api.post<{ data: Record<string, unknown> }>('/orders', input);
    return mapOrder(res.data);
  },

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    const res = await api.patch<{ data: Record<string, unknown> }>(
      `/orders/${id}/status`,
      { status: status.toUpperCase() },
    );
    return mapOrder(res.data);
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/orders/${id}`);
  },
};
