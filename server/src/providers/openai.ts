import fetch from 'node-fetch';
import type { Message } from '../schema';

// Clean OpenAI streaming helper. Uses async-iteration over the response body
// when available and falls back to reading the full text otherwise.
export async function withOpenAI(opts: {
  model: string;
  system?: string;
  messages: Message[];
  temperature: number;
  onToken: (t: string) => void;
}) {
  const { model, system, messages, temperature, onToken } = opts;
  const apiKey = process.env.OPENAI_API_KEY!;

  const payload = {
    model,
    messages: [
      { role: 'system', content: system ?? 'You are a helpful assistant.' },
      ...messages.map((m) => ({ role: m.role, content: m.content }))
    ],
    temperature,
    stream: true
  };

  const resp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!resp.ok) {
    const errorText = await resp.text();
    console.error('OpenAI API error:', resp.status, errorText);
    throw new Error(`OpenAI error: ${resp.status} - ${errorText}`);
  }
  if (!resp.body) throw new Error(`OpenAI error: No response body`);

  // Buffer to handle partial lines across chunks
  let buffer = '';
  const decoder = new TextDecoder();
  const bodyAny: any = resp.body;

  if (bodyAny && typeof bodyAny[Symbol.asyncIterator] === 'function') {
    for await (const chunk of bodyAny as AsyncIterable<Uint8Array | string>) {
      const str = typeof chunk === 'string' ? chunk : decoder.decode(chunk, { stream: true });
      buffer += str;
      
      const lines = buffer.split('\n');
      // Keep the last incomplete line in the buffer
      buffer = lines[lines.length - 1];
      
      for (let i = 0; i < lines.length - 1; i++) {
        const line = lines[i].trim();
        if (!line || line === '[DONE]') continue;
        if (line.startsWith('data: ')) {
          try {
            const obj = JSON.parse(line.substring(6));
            const text = obj.choices?.[0]?.delta?.content ?? '';
            if (text) onToken(text);
          } catch {}
        }
      }
    }
  } else {
    const txt = await resp.text();
    const lines = txt.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed === '[DONE]') continue;
      if (trimmed.startsWith('data: ')) {
        try {
          const obj = JSON.parse(trimmed.substring(6));
          const text = obj.choices?.[0]?.delta?.content ?? '';
          if (text) onToken(text);
        } catch {}
      }
    }
  }
}