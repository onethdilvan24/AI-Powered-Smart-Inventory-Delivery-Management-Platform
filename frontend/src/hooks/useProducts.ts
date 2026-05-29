import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsService, type ProductFilters, type CreateProductInput } from '../services/products.service';

export function useProducts(filters?: ProductFilters) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => productsService.list(filters),
  });
}

export function useLowStockProducts() {
  return useQuery({
    queryKey: ['products', 'low-stock'],
    queryFn: () => productsService.lowStock(),
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateProductInput) => productsService.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<CreateProductInput> }) =>
      productsService.update(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productsService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });
}
