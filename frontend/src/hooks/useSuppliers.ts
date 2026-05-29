import { useQuery } from '@tanstack/react-query';
import { suppliersService } from '../services/suppliers.service';

export function useSuppliers(filters?: { search?: string; status?: string }) {
  return useQuery({
    queryKey: ['suppliers', filters],
    queryFn: () => suppliersService.list(filters),
  });
}
