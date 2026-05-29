import { useQuery } from '@tanstack/react-query';
import { deliveriesService } from '../services/deliveries.service';

export function useDeliveries(filters?: { status?: string }) {
  return useQuery({
    queryKey: ['deliveries', filters],
    queryFn: () => deliveriesService.list(filters),
    refetchInterval: 30_000, // refresh every 30s to simulate live tracking
  });
}
