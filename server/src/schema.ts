import { z } from 'zod';

export const messageSchema = z.object({
  role: z.enum(['system', 'user', 'assistant']),
  content: z.string()
});

export const chatRequestSchema = z.object({
  model: z.enum([
    'openai:gpt-4o-mini',
    'openai:gpt-4o',
    'openai:gpt-3.5-turbo',
    'openai:gpt-4.1',
    'ollama:llama2',
    'ollama:llama3.1',
    'ollama:mistral',
    'ollama:neural-chat'
  ]),
  temperature: z.number().min(0).max(2).default(0.7),
  system: z.string().optional(),
  messages: z.array(messageSchema),
  useRag: z.boolean().default(false),
  promptName: z.string().optional()
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;
export type Message = z.infer<typeof messageSchema>;