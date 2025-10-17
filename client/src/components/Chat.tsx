// Content omitted for brevity; see ChatGPT document for full source.
import { useEffect, useRef, useState } from 'react';

export default function Chat({ model, temperature, system, useRag, promptName }: any) {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages.length]);

  async function send() {
    const next = [...messages, { role: 'user', content: input } as const];
    setMessages(next); setInput('');

    const resp = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ model, temperature, system, useRag, promptName, messages: next }) });

    const reader = resp.body!.getReader();
    const decoder = new TextDecoder();
    let assistant = '';
    setMessages(m => [...m, { role: 'assistant', content: '' }]);

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      chunk.split('\n\n').forEach(evt => {
        if (!evt.trim()) return;
        const [header, dataLine] = evt.split('\n');
        const type = header.replace('event: ', '').trim();
        const data = JSON.parse((dataLine || '').replace('data: ', ''));
        if (type === 'token') {
          assistant += data.token;
          setMessages(curr => {
            const cp = curr.slice(); cp[cp.length - 1] = { role: 'assistant', content: assistant }; return cp;
          });
        }
      });
    }
  }

  return (
    <section className="chat">
      <div className="history">
        {messages.map((m, i) => (
          <div key={i} className={`msg ${m.role}`}>{m.content}</div>
        ))}
        <div ref={endRef} />
      </div>
      <div className="composer">
        <input value={input} onChange={e => setInput(e.target.value)} placeholder="Ask something…" onKeyDown={(e) => { if (e.key === 'Enter') send(); }} />
        <button onClick={send}>Send</button>
      </div>
    </section>
  );
}