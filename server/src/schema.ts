import { z } from 'zod';

export const messageSchema = z.object({
  role: z.enum(['system', 'user', 'assistant']),
  content: z.string()
});

export const modelSchema = z.string().regex(/^(openai|ollama):\S+$/);

export const chatRequestSchema = z.object({
  model: modelSchema,
  temperature: z.number().min(0).max(2).default(0.7),
  system: z.string().optional(),
  messages: z.array(messageSchema),
  useRag: z.boolean().default(false),
  promptName: z.string().optional()
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;
export type Message = z.infer<typeof messageSchema>;
