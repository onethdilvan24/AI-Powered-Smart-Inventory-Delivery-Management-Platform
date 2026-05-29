import type { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { DeliveryStatus } from '@prisma/client';

const locationSchema = z.object({
  lat: z.number(),
  lng: z.number(),
  label: z.string().optional(),
});

const deliverySchema = z.object({
  orderId: z.string().cuid(),
  driverId: z.string().cuid(),
  status: z.nativeEnum(DeliveryStatus).optional(),
  origin: locationSchema,
  destination: locationSchema,
  currentPosition: locationSchema.omit({ label: true }),
  eta: z.string(),
  distance: z.string(),
  startedAt: z.string(),
  customerName: z.string(),
});

const positionSchema = z.object({
  lat: z.number(),
  lng: z.number(),
  eta: z.string().optional(),
});

const statusSchema = z.object({
  status: z.nativeEnum(DeliveryStatus),
});

export const listDeliveries = asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.query;
  const deliveries = await prisma.delivery.findMany({
    where: status ? { status: status as DeliveryStatus } : {},
    include: {
      driver: true,
      order: {
        include: {
          supplier: { select: { id: true, name: true } },
          items: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ data: deliveries });
});

export const getDelivery = asyncHandler(async (req: Request, res: Response) => {
  const delivery = await prisma.delivery.findUnique({
    where: { id: String(req.params.id) },
    include: { driver: true, order: { include: { supplier: true, items: true } } },
  });
  if (!delivery) { res.status(404).json({ error: 'Delivery not found' }); return; }
  res.json({ data: delivery });
});

export const createDelivery = asyncHandler(async (req: Request, res: Response) => {
  const body = deliverySchema.parse(req.body);
  const delivery = await prisma.delivery.create({
    data: {
      orderId: body.orderId,
      driverId: body.driverId,
      status: body.status ?? DeliveryStatus.SCHEDULED,
      originLat: body.origin.lat,
      originLng: body.origin.lng,
      originLabel: body.origin.label ?? '',
      destinationLat: body.destination.lat,
      destinationLng: body.destination.lng,
      destinationLabel: body.destination.label ?? '',
      currentLat: body.currentPosition.lat,
      currentLng: body.currentPosition.lng,
      eta: body.eta,
      distance: body.distance,
      startedAt: body.startedAt,
      customerName: body.customerName,
    },
    include: { driver: true, order: { include: { supplier: { select: { id: true, name: true } } } } },
  });
  res.status(201).json({ data: delivery });
});

export const updateDelivery = asyncHandler(async (req: Request, res: Response) => {
  const body = deliverySchema.partial().parse(req.body);
  const delivery = await prisma.delivery.update({
    where: { id: String(req.params.id) },
    data: {
      ...(body.driverId ? { driverId: body.driverId } : {}),
      ...(body.status ? { status: body.status } : {}),
      ...(body.origin ? { originLat: body.origin.lat, originLng: body.origin.lng, originLabel: body.origin.label ?? '' } : {}),
      ...(body.destination ? { destinationLat: body.destination.lat, destinationLng: body.destination.lng, destinationLabel: body.destination.label ?? '' } : {}),
      ...(body.currentPosition ? { currentLat: body.currentPosition.lat, currentLng: body.currentPosition.lng } : {}),
      ...(body.eta ? { eta: body.eta } : {}),
      ...(body.distance ? { distance: body.distance } : {}),
      ...(body.startedAt ? { startedAt: body.startedAt } : {}),
      ...(body.customerName ? { customerName: body.customerName } : {}),
    },
    include: { driver: true, order: { include: { supplier: { select: { id: true, name: true } } } } },
  });
  res.json({ data: delivery });
});

export const updatePosition = asyncHandler(async (req: Request, res: Response) => {
  const { lat, lng, eta } = positionSchema.parse(req.body);
  const delivery = await prisma.delivery.update({
    where: { id: String(req.params.id) },
    data: { currentLat: lat, currentLng: lng, ...(eta ? { eta } : {}) },
  });
  res.json({ data: delivery });
});

export const updateDeliveryStatus = asyncHandler(async (req: Request, res: Response) => {
  const { status } = statusSchema.parse(req.body);
  const delivery = await prisma.delivery.update({
    where: { id: String(req.params.id) },
    data: { status },
    include: { driver: true },
  });
  res.json({ data: delivery });
});

export const deleteDelivery = asyncHandler(async (req: Request, res: Response) => {
  await prisma.delivery.delete({ where: { id: String(req.params.id) } });
  res.status(204).send();
});
