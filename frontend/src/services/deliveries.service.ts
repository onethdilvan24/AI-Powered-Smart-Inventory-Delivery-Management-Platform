import { api } from '../api/client';
import type { Delivery, DeliveryStatus, Driver } from '../types';

function mapStatus(s: string): DeliveryStatus {
  return s.toLowerCase() as DeliveryStatus;
}

function mapDelivery(d: Record<string, unknown>): Delivery {
  const driver = d.driver as Record<string, unknown>;
  const order = d.order as Record<string, unknown> | null;
  return {
    id: d.id as string,
    orderId: d.orderId as string,
    orderNumber: (order?.orderNumber ?? d.orderId) as string,
    driver: {
      id: driver.id as string,
      name: driver.name as string,
      phone: driver.phone as string,
      vehicle: driver.vehicle as string,
      licensePlate: driver.licensePlate as string,
    } satisfies Driver,
    status: mapStatus(d.status as string),
    origin: {
      lat: d.originLat as number,
      lng: d.originLng as number,
      label: d.originLabel as string,
    },
    destination: {
      lat: d.destinationLat as number,
      lng: d.destinationLng as number,
      label: d.destinationLabel as string,
    },
    currentPosition: {
      lat: d.currentLat as number,
      lng: d.currentLng as number,
    },
    eta: d.eta as string,
    distance: d.distance as string,
    startedAt: d.startedAt as string,
    customerName: d.customerName as string,
  };
}

export const deliveriesService = {
  async list(filters?: { status?: string }): Promise<Delivery[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status.toUpperCase());
    const qs = params.toString();
    const res = await api.get<{ data: Record<string, unknown>[] }>(
      `/deliveries${qs ? `?${qs}` : ''}`,
    );
    return res.data.map(mapDelivery);
  },

  async get(id: string): Promise<Delivery> {
    const res = await api.get<{ data: Record<string, unknown> }>(`/deliveries/${id}`);
    return mapDelivery(res.data);
  },

  async updatePosition(id: string, lat: number, lng: number, eta?: string): Promise<void> {
    await api.patch(`/deliveries/${id}/position`, { lat, lng, eta });
  },

  async updateStatus(id: string, status: DeliveryStatus): Promise<void> {
    await api.patch(`/deliveries/${id}/status`, { status: status.toUpperCase() });
  },
};
