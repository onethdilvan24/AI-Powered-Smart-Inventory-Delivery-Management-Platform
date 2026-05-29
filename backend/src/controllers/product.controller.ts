import type { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { computeStockStatus } from '../utils/stockStatus';
import { StockStatus } from '@prisma/client';

const productSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  quantity: z.number().nonnegative(),
  unit: z.string().min(1),
  minStock: z.number().nonnegative(),
  expiryDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  costPerUnit: z.number().nonnegative(),
  supplierId: z.string().cuid(),
});

const updateSchema = productSchema.partial();

export const listProducts = asyncHandler(async (req: Request, res: Response) => {
  const { search, category, status } = req.query;
  const products = await prisma.product.findMany({
    where: {
      ...(search ? { name: { contains: String(search), mode: 'insensitive' } } : {}),
      ...(category ? { category: String(category) } : {}),
      ...(status ? { status: status as StockStatus } : {}),
    },
    include: { supplier: { select: { id: true, name: true } } },
    orderBy: { updatedAt: 'desc' },
  });
  res.json({ data: products });
});

export const getLowStock = asyncHandler(async (_req: Request, res: Response) => {
  const products = await prisma.product.findMany({
    where: { status: { in: [StockStatus.LOW, StockStatus.CRITICAL] } },
    include: { supplier: { select: { id: true, name: true } } },
    orderBy: { quantity: 'asc' },
  });
  res.json({ data: products });
});

export const getProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await prisma.product.findUnique({
    where: { id: req.params.id },
    include: { supplier: true },
  });
  if (!product) { res.status(404).json({ error: 'Product not found' }); return; }
  res.json({ data: product });
});

export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const body = productSchema.parse(req.body);
  const expiryDate = new Date(body.expiryDate);
  const status = computeStockStatus(body.quantity, body.minStock, expiryDate);
  const product = await prisma.product.create({
    data: { ...body, expiryDate, status },
    include: { supplier: { select: { id: true, name: true } } },
  });
  res.status(201).json({ data: product });
});

export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const body = updateSchema.parse(req.body);
  const existing = await prisma.product.findUnique({ where: { id: req.params.id } });
  if (!existing) { res.status(404).json({ error: 'Product not found' }); return; }

  const quantity = body.quantity ?? existing.quantity;
  const minStock = body.minStock ?? existing.minStock;
  const expiryDate = body.expiryDate ? new Date(body.expiryDate) : existing.expiryDate;
  const status = computeStockStatus(quantity, minStock, expiryDate);

  const product = await prisma.product.update({
    where: { id: req.params.id },
    data: { ...body, expiryDate, status },
    include: { supplier: { select: { id: true, name: true } } },
  });
  res.json({ data: product });
});

export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  await prisma.product.delete({ where: { id: req.params.id } });
  res.status(204).send();
});
