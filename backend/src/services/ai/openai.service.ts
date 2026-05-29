import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { env } from '../../config/env';
import { tools, toolExecutors } from './tools';

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!client) client = new OpenAI({ apiKey: env.openaiApiKey });
  return client;
}

export function isOpenAIEnabled(): boolean {
  return Boolean(env.openaiApiKey);
}

export interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

const SYSTEM_PROMPT = `You are FoodFlow's AI assistant, embedded in a smart inventory and delivery management platform for restaurants and food distributors.

Your job is to help staff manage inventory, orders, deliveries, and suppliers by answering questions using the live database. You have tools to query real data — ALWAYS use them to answer data questions rather than guessing. Never invent product names, numbers, or statuses.

Guidelines:
- Be concise, friendly, and action-oriented. Use short paragraphs and bullet lists.
- When you surface problems (low stock, expired items, delayed deliveries), suggest a concrete next step.
- Format currency as USD. Refer to dates plainly (e.g. "June 2").
- If a question is unrelated to FoodFlow operations, politely steer back to inventory, orders, deliveries, or suppliers.
- If the tools return no rows, say so plainly rather than fabricating data.`;

const MAX_TOOL_ROUNDS = 4;

/**
 * Runs an OpenAI chat completion with tool-calling. The model may call one or
 * more tools; we execute them against Prisma and feed results back until it
 * produces a final answer (bounded by MAX_TOOL_ROUNDS).
 */
export async function runAssistant(message: string, history: ChatTurn[] = []): Promise<string> {
  const openai = getClient();

  const messages: ChatCompletionMessageParam[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history.slice(-8).map(t => ({ role: t.role, content: t.content })),
    { role: 'user', content: message },
  ];

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    const completion = await openai.chat.completions.create({
      model: env.openaiModel,
      messages,
      tools,
      tool_choice: 'auto',
      temperature: 0.3,
    });

    const choice = completion.choices[0].message;

    // No tool calls → final answer
    if (!choice.tool_calls || choice.tool_calls.length === 0) {
      return choice.content?.trim() || "I couldn't generate a response. Please try rephrasing.";
    }

    // Append the assistant's tool-call message, then run each tool
    messages.push(choice);

    for (const call of choice.tool_calls) {
      if (call.type !== 'function') continue;
      const executor = toolExecutors[call.function.name];
      let result: unknown;
      try {
        const args = call.function.arguments ? JSON.parse(call.function.arguments) : {};
        result = executor ? await executor(args) : { error: `Unknown tool: ${call.function.name}` };
      } catch (err) {
        result = { error: err instanceof Error ? err.message : 'Tool execution failed' };
      }
      messages.push({
        role: 'tool',
        tool_call_id: call.id,
        content: JSON.stringify(result),
      });
    }
  }

  // Safety net: ask for a final answer without further tools
  const final = await openai.chat.completions.create({
    model: env.openaiModel,
    messages: [...messages, { role: 'user', content: 'Please give your best final answer now using the data above.' }],
    temperature: 0.3,
  });
  return final.choices[0].message.content?.trim() || "I couldn't complete that request. Please try again.";
}
