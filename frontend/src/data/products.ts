import type { Product } from '../types';

export const products: Product[] = [
  { id: 'p1', name: 'Chicken Breast', category: 'Poultry', quantity: 12, unit: 'kg', minStock: 20, expiryDate: '2026-06-02', costPerUnit: 8.5, supplier: 'Meat Masters', status: 'low' },
  { id: 'p2', name: 'Atlantic Salmon', category: 'Seafood', quantity: 8, unit: 'kg', minStock: 15, expiryDate: '2026-05-31', costPerUnit: 14.0, supplier: 'Ocean Fresh Co.', status: 'critical' },
  { id: 'p3', name: 'Roma Tomatoes', category: 'Vegetables', quantity: 4, unit: 'kg', minStock: 10, expiryDate: '2026-06-01', costPerUnit: 2.5, supplier: 'Fresh Farms Co.', status: 'critical' },
  { id: 'p4', name: 'Whole Milk', category: 'Dairy', quantity: 60, unit: 'L', minStock: 20, expiryDate: '2026-06-05', costPerUnit: 1.2, supplier: 'Dairy Best Ltd.', status: 'ok' },
  { id: 'p5', name: 'Boliar Chicken', category: 'Poultry', quantity: 10, unit: 'kg', minStock: 15, expiryDate: '2026-06-03', costPerUnit: 7.8, supplier: 'Meat Masters', status: 'low' },
  { id: 'p6', name: 'Basmati Rice', category: 'Grains', quantity: 120, unit: 'kg', minStock: 30, expiryDate: '2027-01-01', costPerUnit: 1.8, supplier: 'Grain World', status: 'ok' },
  { id: 'p7', name: 'Olive Oil', category: 'Condiments', quantity: 18, unit: 'L', minStock: 10, expiryDate: '2026-12-15', costPerUnit: 9.0, supplier: 'Mediterranean Goods', status: 'ok' },
  { id: 'p8', name: 'Rui Fish', category: 'Seafood', quantity: 10, unit: 'kg', minStock: 12, expiryDate: '2026-05-30', costPerUnit: 5.5, supplier: 'Ocean Fresh Co.', status: 'low' },
  { id: 'p9', name: 'Heavy Cream', category: 'Dairy', quantity: 3, unit: 'L', minStock: 10, expiryDate: '2026-05-29', costPerUnit: 3.5, supplier: 'Dairy Best Ltd.', status: 'expired' },
  { id: 'p10', name: 'Cheddar Cheese', category: 'Dairy', quantity: 25, unit: 'kg', minStock: 8, expiryDate: '2026-07-10', costPerUnit: 11.0, supplier: 'Dairy Best Ltd.', status: 'ok' },
  { id: 'p11', name: 'Garlic', category: 'Vegetables', quantity: 15, unit: 'kg', minStock: 5, expiryDate: '2026-06-20', costPerUnit: 3.0, supplier: 'Fresh Farms Co.', status: 'ok' },
  { id: 'p12', name: 'Pasta (Penne)', category: 'Grains', quantity: 80, unit: 'kg', minStock: 20, expiryDate: '2027-03-01', costPerUnit: 2.2, supplier: 'Grain World', status: 'ok' },
  { id: 'p13', name: 'Ground Beef', category: 'Meat', quantity: 5, unit: 'kg', minStock: 15, expiryDate: '2026-06-01', costPerUnit: 10.5, supplier: 'Meat Masters', status: 'critical' },
  { id: 'p14', name: 'Spinach', category: 'Vegetables', quantity: 2, unit: 'kg', minStock: 5, expiryDate: '2026-05-30', costPerUnit: 4.0, supplier: 'Fresh Farms Co.', status: 'expired' },
  { id: 'p15', name: 'Eggs (Free Range)', category: 'Dairy', quantity: 200, unit: 'pcs', minStock: 60, expiryDate: '2026-06-08', costPerUnit: 0.4, supplier: 'Fresh Farms Co.', status: 'ok' },
];
