import { api } from '../api/client';
import type { Supplier, SupplierStatus } from '../types';

function mapSupplier(s: Record<string, unknown>): Supplier {
  return {
    id: s.id as string,
    name: s.name as string,
    category: s.category as string,
    contact: s.contact as string,
    email: s.email as string,
    phone: s.phone as string,
    status: (s.status as string).toLowerCase() as SupplierStatus,
    performanceScore: s.performanceScore as number,
    totalOrders: s.totalOrders as number,
    onTimeDelivery: s.onTimeDelivery as number,
    lastDelivery: (s.lastDelivery as string | null) ?? 'N/A',
    address: s.address as string,
  };
}

export const suppliersService = {
  async list(filters?: { search?: string; status?: string }): Promise<Supplier[]> {
    const params = new URLSearchParams();
    if (filters?.search) params.set('search', filters.search);
    if (filters?.status && filters.status !== 'all') params.set('status', filters.status.toUpperCase());
    const qs = params.toString();
    const res = await api.get<{ data: Record<string, unknown>[] }>(
      `/suppliers${qs ? `?${qs}` : ''}`,
    );
    return res.data.map(mapSupplier);
  },

  async get(id: string): Promise<Supplier> {
    const res = await api.get<{ data: Record<string, unknown> }>(`/suppliers/${id}`);
    return mapSupplier(res.data);
  },

  async create(input: Partial<Supplier>): Promise<Supplier> {
    const res = await api.post<{ data: Record<string, unknown> }>('/suppliers', {
      ...input,
      status: input.status?.toUpperCase(),
    });
    return mapSupplier(res.data);
  },

  async update(id: string, input: Partial<Supplier>): Promise<Supplier> {
    const res = await api.put<{ data: Record<string, unknown> }>(`/suppliers/${id}`, {
      ...input,
      ...(input.status ? { status: input.status.toUpperCase() } : {}),
    });
    return mapSupplier(res.data);
  },
};
