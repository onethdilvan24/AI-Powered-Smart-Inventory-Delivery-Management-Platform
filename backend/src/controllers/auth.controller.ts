import type { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { hashPassword, comparePassword } from '../utils/hash';
import { signToken } from '../utils/jwt';
import { asyncHandler } from '../utils/asyncHandler';
import { Role } from '@prisma/client';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1),
  role: z.nativeEnum(Role).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function sanitizeUser(user: { id: string; email: string; name: string; role: Role; createdAt: Date }) {
  return { id: user.id, email: user.email, name: user.name, role: user.role, createdAt: user.createdAt };
}

export const register = asyncHandler(async (req: Request, res: Response) => {
  const body = registerSchema.parse(req.body);
  const passwordHash = await hashPassword(body.password);
  const user = await prisma.user.create({
    data: {
      email: body.email,
      passwordHash,
      name: body.name,
      role: body.role ?? Role.STAFF,
    },
  });
  const token = signToken({ userId: user.id, email: user.email, role: user.role });
  res.status(201).json({ token, user: sanitizeUser(user) });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const body = loginSchema.parse(req.body);
  const user = await prisma.user.findUnique({ where: { email: body.email } });
  if (!user) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }
  const valid = await comparePassword(body.password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }
  const token = signToken({ userId: user.id, email: user.email, role: user.role });
  res.json({ token, user: sanitizeUser(user) });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  res.json({ user: sanitizeUser(user) });
});
