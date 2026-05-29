import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { OrderStatus, StockStatus, DeliveryStatus, SupplierStatus } from '@prisma/client';

export const getDashboardStats = asyncHandler(async (_req: Request, res: Response) => {
  const [
    products,
    orderCounts,
    deliveryCounts,
    activeSuppliers,
    recentOrders,
    recentDeliveries,
  ] = await Promise.all([
    prisma.product.findMany({ select: { quantity: true, costPerUnit: true, status: true } }),
    prisma.order.groupBy({ by: ['status'], _count: { status: true } }),
    prisma.delivery.groupBy({ by: ['status'], _count: { status: true } }),
    prisma.supplier.findMany({
      where: { status: SupplierStatus.ACTIVE },
      select: { id: true, name: true, performanceScore: true, lastDelivery: true, status: true },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { supplier: { select: { name: true } }, items: true },
    }),
    prisma.delivery.findMany({
      where: { status: { in: [DeliveryStatus.IN_TRANSIT, DeliveryStatus.DELAYED] } },
      take: 4,
      include: { driver: { select: { name: true } }, order: { select: { orderNumber: true } } },
    }),
  ]);

  // Inventory aggregations
  const totalInventoryValue = products.reduce((s, p) => s + p.quantity * p.costPerUnit, 0);
  const lowStockCount = products.filter(p => p.status === StockStatus.LOW).length;
  const criticalCount = products.filter(p => p.status === StockStatus.CRITICAL).length;
  const expiredCount = products.filter(p => p.status === StockStatus.EXPIRED).length;

  // Order counts by status
  const ordersByStatus: Record<string, number> = {};
  orderCounts.forEach(g => { ordersByStatus[g.status] = g._count.status; });

  // Delivery counts by status
  const deliveriesByStatus: Record<string, number> = {};
  deliveryCounts.forEach(g => { deliveriesByStatus[g.status] = g._count.status; });

  // Supplier performance
  const avgPerformance = activeSuppliers.length
    ? activeSuppliers.reduce((s, sup) => s + sup.performanceScore, 0) / activeSuppliers.length
    : 0;

  // Static sales/waste series (will be replaced by real data in a later phase)
  const salesSeries = [
    { month: 'Dec', sales: 52000, expenses: 38000 },
    { month: 'Jan', sales: 61000, expenses: 42000 },
    { month: 'Feb', sales: 55000, expenses: 39000 },
    { month: 'Mar', sales: 72000, expenses: 48000 },
    { month: 'Apr', sales: 67000, expenses: 43000 },
    { month: 'May', sales: 80000, expenses: 53000 },
  ];

  const wasteSeries = [
    { month: 'Dec', waste: 7.8 },
    { month: 'Jan', waste: 6.9 },
    { month: 'Feb', waste: 7.2 },
    { month: 'Mar', waste: 6.5 },
    { month: 'Apr', waste: 5.7 },
    { month: 'May', waste: 5.2 },
  ];

  res.json({
    data: {
      inventory: {
        totalProducts: products.length,
        totalValue: Math.round(totalInventoryValue * 100) / 100,
        lowStock: lowStockCount,
        critical: criticalCount,
        expired: expiredCount,
      },
      orders: {
        total: orderCounts.reduce((s, g) => s + g._count.status, 0),
        byStatus: {
          pending: ordersByStatus[OrderStatus.PENDING] ?? 0,
          packed: ordersByStatus[OrderStatus.PACKED] ?? 0,
          outForDelivery: ordersByStatus[OrderStatus.OUT_FOR_DELIVERY] ?? 0,
          delivered: ordersByStatus[OrderStatus.DELIVERED] ?? 0,
          cancelled: ordersByStatus[OrderStatus.CANCELLED] ?? 0,
        },
      },
      deliveries: {
        total: deliveryCounts.reduce((s, g) => s + g._count.status, 0),
        byStatus: {
          scheduled: deliveriesByStatus[DeliveryStatus.SCHEDULED] ?? 0,
          inTransit: deliveriesByStatus[DeliveryStatus.IN_TRANSIT] ?? 0,
          delivered: deliveriesByStatus[DeliveryStatus.DELIVERED] ?? 0,
          delayed: deliveriesByStatus[DeliveryStatus.DELAYED] ?? 0,
        },
      },
      suppliers: {
        active: activeSuppliers.length,
        avgPerformance: Math.round(avgPerformance * 10) / 10,
        recentDeliveries: activeSuppliers.slice(0, 3),
      },
      recentOrders,
      activeDeliveries: recentDeliveries,
      salesSeries,
      wasteSeries,
    },
  });
});
