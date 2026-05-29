import type { Request, Response } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler';
import { processQuery } from '../services/assistant.service';
import { runAssistant, isOpenAIEnabled } from '../services/ai/openai.service';

const querySchema = z.object({
  message: z.string().min(1).max(500),
  history: z
    .array(z.object({ role: z.enum(['user', 'assistant']), content: z.string() }))
    .optional(),
});

export const query = asyncHandler(async (req: Request, res: Response) => {
  const { message, history } = querySchema.parse(req.body);

  let response: string;
  let source: 'openai' | 'rules' = 'rules';

  if (isOpenAIEnabled()) {
    try {
      response = await runAssistant(message, history ?? []);
      source = 'openai';
    } catch (err) {
      // Resilient fallback: if OpenAI fails (quota, network, etc.) use rule-based replies
      console.error('[assistant] OpenAI call failed, falling back to rules:', err);
      response = await processQuery(message);
    }
  } else {
    response = await processQuery(message);
  }

  res.json({
    data: {
      message: response,
      source,
      timestamp: new Date().toISOString(),
    },
  });
});
