import fetch from 'node-fetch';
import type { Message } from '../schema';

export async function withOllama(opts: {
  model: string;
  system?: string;
  messages: Message[];
  temperature: number;
  onToken: (t: string) => void;
}) {
  const { model, system, messages, temperature, onToken } = opts;

  const resp = await fetch('http://localhost:11434/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: [
        ...(system ? [{ role: 'system', content: system }] : []),
        ...messages
      ],
      options: { temperature },
      stream: true
    })
  });

  if (!resp.ok || !resp.body) throw new Error(`Ollama error: ${resp.status}`);

  const bodyAny: any = resp.body;
  const decoder = new TextDecoder();
  let buffer = '';

  if (bodyAny && typeof bodyAny[Symbol.asyncIterator] === 'function') {
    for await (const chunk of bodyAny as AsyncIterable<Uint8Array | string>) {
      const str = typeof chunk === 'string' ? chunk : decoder.decode(chunk, { stream: true });
      buffer += str;
      
      const lines = buffer.split('\n');
      buffer = lines[lines.length - 1];
      
      for (let i = 0; i < lines.length - 1; i++) {
        const l = lines[i].trim();
        if (!l) continue;
        try {
          const obj = JSON.parse(l);
          const text = obj?.message?.content ?? obj?.output_text ?? '';
          if (text) onToken(text);
        } catch {}
      }
    }
  } else {
    const txt = await resp.text();
    const lines = txt.split('\n');
    for (const line of lines) {
      const l = line.trim();
      if (!l) continue;
      try {
        const obj = JSON.parse(l);
        const text = obj?.message?.content ?? obj?.output_text ?? '';
        if (text) onToken(text);
      } catch {}
    }
  }
}