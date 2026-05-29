import { cn } from '../lib/utils';
import type { OrderStatus, StockStatus, DeliveryStatus } from '../types';

type BadgeVariant = OrderStatus | StockStatus | DeliveryStatus | 'active' | 'inactive';

const variantMap: Record<string, string> = {
  // Order statuses
  pending:          'bg-amber-50 text-amber-700 border border-amber-200',
  packed:           'bg-blue-50 text-blue-700 border border-blue-200',
  out_for_delivery: 'bg-purple-50 text-purple-700 border border-purple-200',
  delivered:        'bg-emerald-50 text-emerald-700 border border-emerald-200',
  cancelled:        'bg-red-50 text-red-700 border border-red-200',
  // Stock statuses
  ok:               'bg-emerald-50 text-emerald-700 border border-emerald-200',
  low:              'bg-amber-50 text-amber-700 border border-amber-200',
  critical:         'bg-red-50 text-red-700 border border-red-200',
  expired:          'bg-gray-100 text-gray-600 border border-gray-200',
  // Delivery statuses
  scheduled:        'bg-blue-50 text-blue-700 border border-blue-200',
  in_transit:       'bg-purple-50 text-purple-700 border border-purple-200',
  delayed:          'bg-red-50 text-red-700 border border-red-200',
  // Supplier statuses
  active:           'bg-emerald-50 text-emerald-700 border border-emerald-200',
  inactive:         'bg-gray-100 text-gray-500 border border-gray-200',
};

const labelMap: Record<string, string> = {
  pending: 'Pending',
  packed: 'Packed',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  ok: 'In Stock',
  low: 'Low Stock',
  critical: 'Critical',
  expired: 'Expired',
  scheduled: 'Scheduled',
  in_transit: 'In Transit',
  delayed: 'Delayed',
  active: 'Active',
  inactive: 'Inactive',
};

interface StatusBadgeProps {
  status: BadgeVariant;
  className?: string;
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span className={cn('badge', variantMap[status] ?? 'bg-gray-100 text-gray-600', className)}>
      {labelMap[status] ?? status}
    </span>
  );
}
