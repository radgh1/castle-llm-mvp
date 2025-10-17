// Content omitted for brevity; see ChatGPT document for full source.
import type { Response } from 'express';
import { ChatRequest } from '../schema';
import { withOpenAI } from '../providers/openai';
import { withOllama } from '../providers/ollama';
import { enrichWithRag } from './rag';

export async function streamChat(req: ChatRequest, res: Response) {
  try {
    const { model, system, messages, temperature, useRag } = req;
    const msgs = useRag ? await enrichWithRag(messages) : messages;

    const isOpenAI = model.startsWith('openai:');
    const provider = isOpenAI ? withOpenAI : withOllama;
    
    // Extract model name after the provider prefix
    const providerModel = model.split(':').slice(1).join(':') as any;

    // open SSE stream
    res.write(`event: open\n`);
    res.write(`data: ${JSON.stringify({ model })}\n\n`);

    await provider({ model: providerModel, system, messages: msgs, temperature, onToken: (t) => {
      res.write(`event: token\n`);
      res.write(`data: ${JSON.stringify({ token: t })}\n\n`);
    }});

    res.write(`event: done\n`);
    res.write(`data: {}\n\n`);
    res.end();
  } catch (err) {
    console.error('Chat error:', err);
    res.write(`event: error\n`);
    res.write(`data: ${JSON.stringify({ error: String(err) })}\n\n`);
    res.end();
  }
}