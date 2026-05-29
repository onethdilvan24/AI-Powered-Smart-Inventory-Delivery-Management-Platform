import { api } from '../api/client';
import type { Product, StockStatus } from '../types';

// Backend returns uppercase enums; frontend types use lowercase
function mapStatus(s: string): StockStatus {
  return s.toLowerCase() as StockStatus;
}

// Backend product.supplier is an object {id, name}; frontend uses string
function mapProduct(p: Record<string, unknown>): Product {
  const sup = p.supplier as { id: string; name: string } | null;
  return {
    id: p.id as string,
    name: p.name as string,
    category: p.category as string,
    quantity: p.quantity as number,
    unit: p.unit as string,
    minStock: p.minStock as number,
    expiryDate: (p.expiryDate as string).split('T')[0],
    costPerUnit: p.costPerUnit as number,
    supplier: sup?.name ?? (p.supplierId as string),
    status: mapStatus(p.status as string),
  };
}

export interface ProductFilters {
  search?: string;
  category?: string;
  status?: string;
}

export interface CreateProductInput {
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minStock: number;
  expiryDate: string;
  costPerUnit: number;
  supplierId: string;
}

export const productsService = {
  async list(filters?: ProductFilters): Promise<Product[]> {
    const params = new URLSearchParams();
    if (filters?.search) params.set('search', filters.search);
    if (filters?.category) params.set('category', filters.category);
    if (filters?.status) params.set('status', filters.status.toUpperCase());
    const qs = params.toString();
    const res = await api.get<{ data: Record<string, unknown>[] }>(
      `/products${qs ? `?${qs}` : ''}`,
    );
    return res.data.map(mapProduct);
  },

  async lowStock(): Promise<Product[]> {
    const res = await api.get<{ data: Record<string, unknown>[] }>('/products/low-stock');
    return res.data.map(mapProduct);
  },

  async get(id: string): Promise<Product> {
    const res = await api.get<{ data: Record<string, unknown> }>(`/products/${id}`);
    return mapProduct(res.data);
  },

  async create(input: CreateProductInput): Promise<Product> {
    const res = await api.post<{ data: Record<string, unknown> }>('/products', input);
    return mapProduct(res.data);
  },

  async update(id: string, input: Partial<CreateProductInput>): Promise<Product> {
    const res = await api.put<{ data: Record<string, unknown> }>(`/products/${id}`, input);
    return mapProduct(res.data);
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/products/${id}`);
  },
};
