export type StockStatus = 'ok' | 'low' | 'critical' | 'expired';

export interface Product {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minStock: number;
  expiryDate: string;
  costPerUnit: number;
  supplier: string;
  status: StockStatus;
}

export type OrderStatus = 'pending' | 'packed' | 'out_for_delivery' | 'delivered' | 'cancelled';

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  supplierId: string;
  supplierName: string;
  status: OrderStatus;
  createdAt: string;
  expectedDelivery: string;
  items: OrderItem[];
  total: number;
  notes?: string;
}

export type DeliveryStatus = 'scheduled' | 'in_transit' | 'delivered' | 'delayed';

export interface Driver {
  id: string;
  name: string;
  phone: string;
  vehicle: string;
  licensePlate: string;
}

export interface Delivery {
  id: string;
  orderId: string;
  orderNumber: string;
  driver: Driver;
  status: DeliveryStatus;
  origin: { lat: number; lng: number; label: string };
  destination: { lat: number; lng: number; label: string };
  currentPosition: { lat: number; lng: number };
  eta: string;
  distance: string;
  startedAt: string;
  customerName: string;
}

export type SupplierStatus = 'active' | 'inactive';

export interface Supplier {
  id: string;
  name: string;
  category: string;
  contact: string;
  email: string;
  phone: string;
  status: SupplierStatus;
  performanceScore: number;
  totalOrders: number;
  onTimeDelivery: number;
  lastDelivery: string;
  address: string;
}

export interface KpiData {
  label: string;
  value: string;
  delta: string;
  deltaType: 'up' | 'down';
  icon: string;
  color: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface SalesDataPoint {
  month: string;
  sales: number;
  expenses: number;
}

export interface WasteDataPoint {
  month: string;
  waste: number;
}
