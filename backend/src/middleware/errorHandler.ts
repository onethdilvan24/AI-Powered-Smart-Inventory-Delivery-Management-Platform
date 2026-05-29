import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  console.error('[Error]', err);

  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Validation error',
      details: err.errors.map(e => ({ path: e.path.join('.'), message: e.message })),
    });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      res.status(409).json({ error: 'A record with that value already exists' });
      return;
    }
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'Record not found' });
      return;
    }
  }

  if (err instanceof Error) {
    const status = (err as Error & { statusCode?: number }).statusCode ?? 500;
    res.status(status).json({ error: err.message || 'Internal server error' });
    return;
  }

  res.status(500).json({ error: 'Internal server error' });
}
