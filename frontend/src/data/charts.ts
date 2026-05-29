import type { SalesDataPoint, WasteDataPoint } from '../types';

export const salesData: SalesDataPoint[] = [
  { month: 'Dec', sales: 52000, expenses: 38000 },
  { month: 'Jan', sales: 61000, expenses: 42000 },
  { month: 'Feb', sales: 55000, expenses: 39000 },
  { month: 'Mar', sales: 72000, expenses: 48000 },
  { month: 'Apr', sales: 67000, expenses: 43000 },
  { month: 'May', sales: 80000, expenses: 53000 },
];

export const wasteData: WasteDataPoint[] = [
  { month: 'Dec', waste: 7.8 },
  { month: 'Jan', waste: 6.9 },
  { month: 'Feb', waste: 7.2 },
  { month: 'Mar', waste: 6.5 },
  { month: 'Apr', waste: 5.7 },
  { month: 'May', waste: 5.2 },
];

export const orderTrendData = [
  { day: 'Mon', orders: 12 },
  { day: 'Tue', orders: 18 },
  { day: 'Wed', orders: 14 },
  { day: 'Thu', orders: 22 },
  { day: 'Fri', orders: 19 },
  { day: 'Sat', orders: 25 },
  { day: 'Sun', orders: 16 },
];
