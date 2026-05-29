import type { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { OrderStatus } from '@prisma/client';

const orderItemSchema = z.object({
  productName: z.string().min(1),
  quantity: z.number().positive(),
  unit: z.string().min(1),
  unitPrice: z.number().nonnegative(),
});

const orderSchema = z.object({
  supplierId: z.string().cuid(),
  expectedDelivery: z.string(),
  notes: z.string().optional(),
  items: z.array(orderItemSchema).min(1),
});

const statusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
});

function generateOrderNumber(): string {
  const num = Math.floor(200000 + Math.random() * 100000);
  return `#${num}`;
}

export const listOrders = asyncHandler(async (req: Request, res: Response) => {
  const { status, supplierId } = req.query;
  const orders = await prisma.order.findMany({
    where: {
      ...(status ? { status: status as OrderStatus } : {}),
      ...(supplierId ? { supplierId: String(supplierId) } : {}),
    },
    include: {
      supplier: { select: { id: true, name: true } },
      items: true,
      delivery: { select: { id: true, status: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ data: orders });
});

export const getOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await prisma.order.findUnique({
    where: { id: String(req.params.id) },
    include: {
      supplier: true,
      items: true,
      delivery: { include: { driver: true } },
    },
  });
  if (!order) { res.status(404).json({ error: 'Order not found' }); return; }
  res.json({ data: order });
});

export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const body = orderSchema.parse(req.body);
  const total = body.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  const order = await prisma.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      supplierId: body.supplierId,
      expectedDelivery: new Date(body.expectedDelivery),
      notes: body.notes,
      total,
      items: { create: body.items },
    },
    include: {
      supplier: { select: { id: true, name: true } },
      items: true,
    },
  });
  res.status(201).json({ data: order });
});

export const updateOrder = asyncHandler(async (req: Request, res: Response) => {
  const body = orderSchema.partial().parse(req.body);

  const existing = await prisma.order.findUnique({ where: { id: String(req.params.id) }, include: { items: true } });
  if (!existing) { res.status(404).json({ error: 'Order not found' }); return; }

  let total = existing.total;
  if (body.items) {
    total = body.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    await prisma.orderItem.deleteMany({ where: { orderId: String(req.params.id) } });
  }

  const order = await prisma.order.update({
    where: { id: String(req.params.id) },
    data: {
      ...(body.supplierId ? { supplierId: body.supplierId } : {}),
      ...(body.expectedDelivery ? { expectedDelivery: new Date(body.expectedDelivery) } : {}),
      ...(body.notes !== undefined ? { notes: body.notes } : {}),
      total,
      ...(body.items ? { items: { create: body.items } } : {}),
    },
    include: { supplier: { select: { id: true, name: true } }, items: true },
  });
  res.json({ data: order });
});

export const updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
  const { status } = statusSchema.parse(req.body);
  const order = await prisma.order.update({
    where: { id: String(req.params.id) },
    data: { status },
    include: { supplier: { select: { id: true, name: true } }, items: true },
  });
  res.json({ data: order });
});

export const deleteOrder = asyncHandler(async (req: Request, res: Response) => {
  await prisma.order.delete({ where: { id: String(req.params.id) } });
  res.status(204).send();
});
