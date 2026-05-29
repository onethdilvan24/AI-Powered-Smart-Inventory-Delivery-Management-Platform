import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersService, type CreateOrderInput } from '../services/orders.service';
import type { OrderStatus } from '../types';

export function useOrders(filters?: { status?: string; supplierId?: string }) {
  return useQuery({
    queryKey: ['orders', filters],
    queryFn: () => ordersService.list(filters),
  });
}

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateOrderInput) => ordersService.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders'] }),
  });
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      ordersService.updateStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders'] }),
  });
}
