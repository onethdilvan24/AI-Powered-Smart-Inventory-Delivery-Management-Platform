import type { ChatCompletionTool } from 'openai/resources/chat/completions';
import { prisma } from '../../lib/prisma';
import { StockStatus, OrderStatus, DeliveryStatus, SupplierStatus } from '@prisma/client';

/**
 * Tool schemas exposed to the OpenAI model. Each maps to an executor in
 * `toolExecutors` below. The model decides which to call; we run the Prisma
 * query and return only the relevant rows — never the whole database.
 */
export const tools: ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'get_inventory',
      description:
        'Get products from inventory. Use to answer questions about stock levels, low/critical/expired items, quantities, or a specific category.',
      parameters: {
        type: 'object',
        properties: {
          filter: {
            type: 'string',
            enum: ['all', 'low', 'critical', 'expired', 'low_and_critical'],
            description: 'Which products to return. Defaults to all.',
          },
          category: {
            type: 'string',
            description: 'Optional category name to filter by (e.g. "Vegetables").',
          },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_orders',
      description:
        'Get purchase orders, optionally filtered by status (pending, packed, out_for_delivery, delivered, cancelled).',
      parameters: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            enum: ['all', 'pending', 'packed', 'out_for_delivery', 'delivered', 'cancelled'],
            description: 'Order status to filter by. Defaults to all.',
          },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_deliveries',
      description:
        'Get deliveries and fleet status, optionally filtered by status (scheduled, in_transit, delivered, delayed).',
      parameters: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            enum: ['all', 'scheduled', 'in_transit', 'delivered', 'delayed'],
            description: 'Delivery status to filter by. Defaults to all.',
          },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_suppliers',
      description:
        'Get suppliers with performance metrics. Use for vendor questions, performance scores, or on-time delivery rates.',
      parameters: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            enum: ['all', 'active', 'inactive'],
            description: 'Supplier status to filter by. Defaults to active.',
          },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_summary',
      description:
        'Get an aggregate snapshot of the whole operation: inventory value, stock alerts, order counts by status, and delivery counts by status. Use for "overview", "summary", or "how are things" questions.',
      parameters: { type: 'object', properties: {} },
    },
  },
];

const STOCK_FILTER: Record<string, StockStatus[] | undefined> = {
  all: undefined,
  low: [StockStatus.LOW],
  critical: [StockStatus.CRITICAL],
  expired: [StockStatus.EXPIRED],
  low_and_critical: [StockStatus.LOW, StockStatus.CRITICAL],
};

type ToolArgs = Record<string, unknown>;

/** Executors keyed by tool name. Each returns a JSON-serialisable result. */
export const toolExecutors: Record<string, (args: ToolArgs) => Promise<unknown>> = {
  async get_inventory(args) {
    const filter = (args.filter as string) ?? 'all';
    const category = args.category as string | undefined;
    const statuses = STOCK_FILTER[filter];

    const products = await prisma.product.findMany({
      where: {
        ...(statuses ? { status: { in: statuses } } : {}),
        ...(category ? { category: { equals: category, mode: 'insensitive' } } : {}),
      },
      include: { supplier: { select: { name: true } } },
      orderBy: { quantity: 'asc' },
      take: 50,
    });

    return {
      count: products.length,
      products: products.map(p => ({
        name: p.name,
        category: p.category,
        quantity: p.quantity,
        unit: p.unit,
        minStock: p.minStock,
        status: p.status,
        costPerUnit: p.costPerUnit,
        expiryDate: p.expiryDate.toISOString().split('T')[0],
        supplier: p.supplier.name,
      })),
    };
  },

  async get_orders(args) {
    const status = (args.status as string) ?? 'all';
    const orders = await prisma.order.findMany({
      where: status !== 'all' ? { status: status.toUpperCase() as OrderStatus } : {},
      include: { supplier: { select: { name: true } }, items: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return {
      count: orders.length,
      orders: orders.map(o => ({
        orderNumber: o.orderNumber,
        supplier: o.supplier.name,
        status: o.status,
        total: o.total,
        expectedDelivery: o.expectedDelivery.toISOString().split('T')[0],
        itemCount: o.items.length,
        notes: o.notes ?? undefined,
      })),
    };
  },

  async get_deliveries(args) {
    const status = (args.status as string) ?? 'all';
    const deliveries = await prisma.delivery.findMany({
      where: status !== 'all' ? { status: status.toUpperCase() as DeliveryStatus } : {},
      include: {
        driver: { select: { name: true, phone: true, vehicle: true } },
        order: { select: { orderNumber: true } },
      },
      take: 50,
    });

    return {
      count: deliveries.length,
      deliveries: deliveries.map(d => ({
        orderNumber: d.order.orderNumber,
        status: d.status,
        driver: d.driver.name,
        driverPhone: d.driver.phone,
        vehicle: d.driver.vehicle,
        eta: d.eta,
        distance: d.distance,
        destination: d.destinationLabel,
        customer: d.customerName,
      })),
    };
  },

  async get_suppliers(args) {
    const status = (args.status as string) ?? 'active';
    const suppliers = await prisma.supplier.findMany({
      where: status !== 'all' ? { status: status.toUpperCase() as SupplierStatus } : {},
      orderBy: { performanceScore: 'desc' },
      take: 50,
    });

    return {
      count: suppliers.length,
      suppliers: suppliers.map(s => ({
        name: s.name,
        category: s.category,
        status: s.status,
        performanceScore: s.performanceScore,
        onTimeDelivery: s.onTimeDelivery,
        totalOrders: s.totalOrders,
        lastDelivery: s.lastDelivery ?? undefined,
      })),
    };
  },

  async get_summary() {
    const [products, orders, deliveries] = await Promise.all([
      prisma.product.findMany({ select: { quantity: true, costPerUnit: true, status: true } }),
      prisma.order.groupBy({ by: ['status'], _count: true }),
      prisma.delivery.groupBy({ by: ['status'], _count: true }),
    ]);

    const totalValue = products.reduce((s, p) => s + p.quantity * p.costPerUnit, 0);
    const stockCounts = products.reduce<Record<string, number>>((acc, p) => {
      acc[p.status] = (acc[p.status] ?? 0) + 1;
      return acc;
    }, {});

    const orderCounts = Object.fromEntries(orders.map(o => [o.status, o._count]));
    const deliveryCounts = Object.fromEntries(deliveries.map(d => [d.status, d._count]));

    return {
      inventory: {
        totalProducts: products.length,
        totalValue: Math.round(totalValue),
        byStatus: stockCounts,
      },
      orders: orderCounts,
      deliveries: deliveryCounts,
    };
  },
};
