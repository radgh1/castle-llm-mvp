import { useState, useRef } from 'react';
import { api } from '../lib/api';

interface DocumentChatProps {
  model?: string;
  temperature?: number;
}

export default function DocumentChat({ model = 'ollama:llama2', temperature = 0.7 }: DocumentChatProps) {
  // Chat state
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const sendChatMessage = async (text?: string) => {
    const messageText = text || chatInput;
    if (!messageText.trim()) return;

    const next = [...chatMessages, { role: 'user', content: messageText } as const];
    setChatMessages(next);
    setChatInput('');

    setIsChatting(true);

    try {
      const resp = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          temperature,
          system: 'You are a helpful assistant that answers questions based on the uploaded documents. If you cannot find relevant information in the documents, say so clearly.',
          useRag: true, // Always use RAG for document chat
          promptName: 'document-chat',
          messages: next
        })
      });

      const reader = resp.body!.getReader();
      const decoder = new TextDecoder();
      let assistant = '';
      setChatMessages(curr => [...curr, { role: 'assistant', content: '' }]);

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
            setChatMessages(curr => {
              const cp = curr.slice();
              cp[cp.length - 1] = { role: 'assistant', content: assistant };
              return cp;
            });
          }
        });
      }
    } catch (error) {
      setChatMessages(curr => [...curr, {
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      }]);
    } finally {
      setIsChatting(false);
    }
  };

  return (
    <div className="bottom-document-chat">
      <div className="chat-header">
        <h3>💬 Chat with Documents</h3>
        <p>Ask questions about your uploaded documents</p>
      </div>

      <div className="chat-messages">
        {chatMessages.length === 0 ? (
          <div className="chat-empty">
            <h4>Start a conversation with your documents</h4>
            <p>Try these example questions:</p>
            <div className="example-buttons">
              <button
                className="example-btn"
                onClick={() => sendChatMessage("What are the main topics covered in the documents?")}
              >
                📋 Document Summary
              </button>
              <button
                className="example-btn"
                onClick={() => sendChatMessage("Explain the key concepts from the uploaded content")}
              >
                🔑 Key Concepts
              </button>
              <button
                className="example-btn"
                onClick={() => sendChatMessage("What are the practical applications mentioned?")}
              >
                💼 Applications
              </button>
            </div>
          </div>
        ) : (
          <>
            {chatMessages.map((m, i) => (
              <div key={i} className={`chat-msg ${m.role}`}>
                <div className="msg-content">{m.content}</div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </>
        )}
      </div>

      <div className="chat-input">
        <input
          value={chatInput}
          onChange={e => setChatInput(e.target.value)}
          placeholder="Ask about your documents..."
          onKeyDown={(e) => { if (e.key === 'Enter' && !isChatting) sendChatMessage(); }}
          disabled={isChatting}
        />
        <button
          onClick={() => sendChatMessage()}
          disabled={isChatting || !chatInput.trim()}
        >
          {isChatting ? '⏳' : '📤'}
        </button>
      </div>
    </div>
  );
}