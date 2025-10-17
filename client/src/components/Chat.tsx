// Content omitted for brevity; see ChatGPT document for full source.
import { useEffect, useRef, useState } from 'react';

export default function Chat({ model, temperature, system, useRag, promptName, onUpdateHistory }: any) {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  const examples = [
    { title: 'Explain Concept', prompt: 'Explain quantum computing in simple terms' },
    { title: 'Write Code', prompt: 'Write a function to calculate factorial in Python' },
    { title: 'Brainstorm', prompt: 'Give me 5 creative ideas for a productivity app' },
    { title: 'Ask Question', prompt: 'What are the key differences between React and Vue?' },
  ];

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages.length]);

  useEffect(() => {
    // Update parent with chat history
    if (onUpdateHistory) {
      onUpdateHistory(messages);
    }
  }, [messages, onUpdateHistory]);

  async function send(text?: string) {
    const messageText = text || input;
    if (!messageText.trim()) return;
    
    const next = [...messages, { role: 'user', content: messageText } as const];
    setMessages(next); 
    setInput('');

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
      <div className="chat-header">
        <h3>💬 Chat Interface</h3>
        <div className="tech-specs">
          <p><strong>Stack:</strong> React 18 + TypeScript • Server-Sent Events (SSE) Streaming • LangChain Integration</p>
          <p><strong>What it does:</strong> Real-time conversational interface with streaming token generation. Supports multi-model switching (OpenAI GPT-4/3.5, Ollama local models). Features system prompt injection, RAG integration, and conversation history tracking. Backend uses LangChain chains for message handling with temperature-based response tuning.</p>
          <p><strong>Key Features:</strong> 
            • Persistent chat examples for quick iteration 
            • Global model/temperature controls 
            • RAG-enabled document retrieval 
            • SSE streaming for low-latency responses
          </p>
        </div>
      </div>
      <div className="history">
        {messages.length === 0 ? (
          <div className="chat-empty">
            <h2>Start a conversation</h2>
            <p>Try one of these examples or ask anything:</p>
            <div className="example-buttons">
              {examples.map((example, i) => (
                <button 
                  key={i}
                  className="example-btn"
                  onClick={() => send(example.prompt)}
                  title={example.prompt}
                >
                  {example.title}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((m, i) => (
              <div key={i} className={`msg ${m.role}`}>{m.content}</div>
            ))}
            <div className="chat-suggestions">
              <p className="label">Try more:</p>
              <div className="example-buttons">
                {examples.map((example, i) => (
                  <button 
                    key={i}
                    className="example-btn small"
                    onClick={() => send(example.prompt)}
                    title={example.prompt}
                  >
                    {example.title}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
        <div ref={endRef} />
      </div>
      <div className="composer">
        <input 
          value={input} 
          onChange={e => setInput(e.target.value)} 
          placeholder="Ask something…" 
          onKeyDown={(e) => { if (e.key === 'Enter') send(); }} 
        />
        <button onClick={() => send()}>Send</button>
      </div>
    </section>
  );
}