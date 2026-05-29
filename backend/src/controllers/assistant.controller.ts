import type { Request, Response } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler';
import { processQuery } from '../services/assistant.service';

const querySchema = z.object({
  message: z.string().min(1).max(500),
});

export const query = asyncHandler(async (req: Request, res: Response) => {
  const { message } = querySchema.parse(req.body);
  const response = await processQuery(message);
  res.json({
    data: {
      message: response,
      timestamp: new Date().toISOString(),
    },
  });
});
