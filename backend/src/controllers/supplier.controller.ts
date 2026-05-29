import type { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { SupplierStatus } from '@prisma/client';

const supplierSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  contact: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  status: z.nativeEnum(SupplierStatus).optional(),
  performanceScore: z.number().min(0).max(5).optional(),
  totalOrders: z.number().int().nonnegative().optional(),
  onTimeDelivery: z.number().int().min(0).max(100).optional(),
  lastDelivery: z.string().optional(),
  address: z.string().min(1),
});

export const listSuppliers = asyncHandler(async (req: Request, res: Response) => {
  const { search, status } = req.query;
  const suppliers = await prisma.supplier.findMany({
    where: {
      ...(search ? { name: { contains: String(search), mode: 'insensitive' } } : {}),
      ...(status ? { status: status as SupplierStatus } : {}),
    },
    include: {
      _count: { select: { orders: true, products: true } },
    },
    orderBy: { name: 'asc' },
  });
  res.json({ data: suppliers });
});

export const getSupplier = asyncHandler(async (req: Request, res: Response) => {
  const supplier = await prisma.supplier.findUnique({
    where: { id: req.params.id },
    include: {
      products: true,
      orders: { orderBy: { createdAt: 'desc' }, take: 5 },
    },
  });
  if (!supplier) { res.status(404).json({ error: 'Supplier not found' }); return; }
  res.json({ data: supplier });
});

export const createSupplier = asyncHandler(async (req: Request, res: Response) => {
  const body = supplierSchema.parse(req.body);
  const supplier = await prisma.supplier.create({ data: body });
  res.status(201).json({ data: supplier });
});

export const updateSupplier = asyncHandler(async (req: Request, res: Response) => {
  const body = supplierSchema.partial().parse(req.body);
  const supplier = await prisma.supplier.update({
    where: { id: req.params.id },
    data: body,
  });
  res.json({ data: supplier });
});

export const deleteSupplier = asyncHandler(async (req: Request, res: Response) => {
  await prisma.supplier.delete({ where: { id: req.params.id } });
  res.status(204).send();
});
