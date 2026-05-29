import { prisma } from '../lib/prisma';
import { StockStatus, OrderStatus, DeliveryStatus, SupplierStatus } from '@prisma/client';

function fmt(v: number, currency = true): string {
  if (!currency) return String(v);
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(v);
}

export async function processQuery(message: string): Promise<string> {
  const q = message.toLowerCase();

  // Low stock intent
  if ((q.includes('low') || q.includes('critical')) && (q.includes('stock') || q.includes('inventory') || q.includes('product'))) {
    const items = await prisma.product.findMany({
      where: { status: { in: [StockStatus.LOW, StockStatus.CRITICAL] } },
      include: { supplier: { select: { name: true } } },
      orderBy: { quantity: 'asc' },
    });
    if (items.length === 0) return 'Great news — all products are currently well-stocked!';
    return `You have **${items.length} products** with low or critical stock levels:\n\n${
      items.map(p => `• **${p.name}** — ${p.quantity} ${p.unit} remaining (min: ${p.minStock} ${p.unit}) · ${p.supplier.name}`).join('\n')
    }\n\nI recommend placing restock orders for these items soon.`;
  }

  // Expired products intent
  if (q.includes('expir')) {
    const items = await prisma.product.findMany({
      where: { status: StockStatus.EXPIRED },
    });
    if (items.length === 0) return 'No products are currently expired. All items are within their expiry dates.';
    return `There are **${items.length} expired product(s)**:\n\n${
      items.map(p => `• **${p.name}** — expired ${p.expiryDate.toISOString().split('T')[0]}`).join('\n')
    }\n\nPlease remove these from inventory to maintain food safety standards.`;
  }

  // Pending orders intent
  if (q.includes('pending') || (q.includes('order') && (q.includes('today') || q.includes('new')))) {
    const pending = await prisma.order.findMany({
      where: { status: OrderStatus.PENDING },
      include: { supplier: { select: { name: true } } },
    });
    if (pending.length === 0) return 'There are no pending orders at the moment.';
    return `There are **${pending.length} pending orders**:\n\n${
      pending.map(o => `• **${o.orderNumber}** from ${o.supplier.name} — ${fmt(o.total)}`).join('\n')
    }\n\nWould you like me to help track any of these?`;
  }

  // Delayed orders intent
  if (q.includes('delay') || q.includes('late')) {
    const delayed = await prisma.delivery.findMany({
      where: { status: DeliveryStatus.DELAYED },
      include: { driver: { select: { name: true } }, order: { select: { orderNumber: true } } },
    });
    if (delayed.length === 0) return 'Good news — there are no delayed deliveries right now!';
    return `**${delayed.length} delivery/deliveries** are currently delayed:\n\n${
      delayed.map(d => `• **${d.order.orderNumber}** — Driver: ${d.driver.name}, ETA: ${d.eta}`).join('\n')
    }\n\nConsider contacting the drivers or suppliers for an update.`;
  }

  // Delivery / fleet intent
  if (q.includes('deliver') || q.includes('transit') || q.includes('truck') || q.includes('fleet')) {
    const [inTransit, scheduled, delivered] = await Promise.all([
      prisma.delivery.count({ where: { status: DeliveryStatus.IN_TRANSIT } }),
      prisma.delivery.count({ where: { status: DeliveryStatus.SCHEDULED } }),
      prisma.delivery.count({ where: { status: DeliveryStatus.DELIVERED } }),
    ]);
    return `Current fleet status:\n\n• **${inTransit}** in transit\n• **${scheduled}** scheduled\n• **${delivered}** delivered today\n\nWould you like details on a specific delivery?`;
  }

  // Summary / overview intent
  if (q.includes('summary') || q.includes('overview') || q.includes('status') || q.includes('report')) {
    const [products, pending, inTransit, delayed] = await Promise.all([
      prisma.product.findMany({ select: { quantity: true, costPerUnit: true, status: true } }),
      prisma.order.count({ where: { status: OrderStatus.PENDING } }),
      prisma.delivery.count({ where: { status: DeliveryStatus.IN_TRANSIT } }),
      prisma.delivery.count({ where: { status: DeliveryStatus.DELAYED } }),
    ]);
    const totalValue = products.reduce((s, p) => s + p.quantity * p.costPerUnit, 0);
    const lowStock = products.filter(p => ([StockStatus.LOW, StockStatus.CRITICAL] as StockStatus[]).includes(p.status)).length;
    return `Here's your **current summary**:\n\n📦 **Inventory**\n• Total products: ${products.length}\n• Inventory value: ${fmt(totalValue)}\n• Low/critical stock: ${lowStock} items\n\n🛒 **Orders**\n• Pending: ${pending}\n\n🚚 **Deliveries**\n• In transit: ${inTransit}\n• Delayed: ${delayed}`;
  }

  // Suppliers intent
  if (q.includes('supplier') || q.includes('vendor')) {
    const suppliers = await prisma.supplier.findMany({
      where: { status: SupplierStatus.ACTIVE },
      orderBy: { performanceScore: 'desc' },
      take: 5,
    });
    const inactive = await prisma.supplier.count({ where: { status: SupplierStatus.INACTIVE } });
    return `You have **${suppliers.length} active suppliers** (${inactive} inactive).\n\nTop performers:\n${
      suppliers.map(s => `• **${s.name}** — ${s.performanceScore.toFixed(1)}★, ${s.onTimeDelivery}% on-time`).join('\n')
    }`;
  }

  // Restock intent
  if (q.includes('restock') || q.includes('replenish') || q.includes('order more')) {
    const critical = await prisma.product.findMany({
      where: { status: StockStatus.CRITICAL },
      include: { supplier: { select: { name: true } } },
    });
    if (critical.length === 0) return 'No critical stock items requiring immediate restock.';
    return `I recommend restocking **${critical.length} critical items**:\n\n${
      critical.map(p => `• **${p.name}** — only ${p.quantity} ${p.unit} left (supplier: ${p.supplier.name})`).join('\n')
    }\n\nWould you like me to create draft orders for these?`;
  }

  // Greeting intent
  if (/^(hello|hi|hey|good morning|good afternoon|what can you do|help)/.test(q)) {
    return "Hello! I'm FoodFlow's AI assistant. I can help with:\n\n• Inventory levels and low-stock alerts\n• Order tracking and summaries\n• Delivery status updates\n• Supplier performance insights\n• Restock recommendations\n\nWhat would you like to know?";
  }

  return `I understand you're asking about "${message}". I can help with inventory levels, orders, deliveries, and supplier information.\n\nTry: "Which products are low in stock?", "Show pending orders", or "Give me a summary".`;
}
