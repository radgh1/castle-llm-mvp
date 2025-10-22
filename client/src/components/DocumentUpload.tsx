import { useState, useRef } from 'react';
import { api, DocumentIngestRequest } from '../lib/api';

interface DocumentUploadProps {
  model?: string;
  temperature?: number;
  useRag?: boolean;
  onRagChange?: (useRag: boolean) => void;
  onDocumentIngested?: (result: { success: boolean; message: string; documentCount?: number }) => void;
}

export default function DocumentUpload({ model = 'ollama:llama2', temperature = 0.7, useRag = false, onRagChange, onDocumentIngested }: DocumentUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [textInput, setTextInput] = useState('');
  const [uploadSubTab, setUploadSubTab] = useState<'file' | 'url' | 'text'>('file');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Chat state
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setUploadStatus('Reading file...');

    try {
      let content = '';
      let type: DocumentIngestRequest['type'] = 'text';

      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        // For PDF files, we'll send the file as base64
        const arrayBuffer = await file.arrayBuffer();
        content = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
        type = 'file';
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                 file.name.endsWith('.docx')) {
        // For DOCX files, we'll send as base64
        const arrayBuffer = await file.arrayBuffer();
        content = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
        type = 'file';
      } else {
        // For text files
        content = await file.text();
        type = 'file';
      }

      setUploadStatus('Ingesting document...');

      const result = await api.ingestDocument({
        content,
        filename: file.name,
        type,
      });

      setUploadStatus(result.success ? 'Document ingested successfully!' : `Error: ${result.message}`);
      onDocumentIngested?.(result);

    } catch (error) {
      setUploadStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlUpload = async () => {
    if (!urlInput.trim()) {
      setUploadStatus('Please enter a URL');
      return;
    }

    setIsUploading(true);
    setUploadStatus('Fetching URL content...');

    try {
      const result = await api.ingestDocument({
        content: '', // Will be processed server-side
        filename: urlInput,
        type: 'url',
        url: urlInput,
      });

      setUploadStatus(result.success ? 'URL content ingested successfully!' : `Error: ${result.message}`);
      onDocumentIngested?.(result);
      setUrlInput('');

    } catch (error) {
      setUploadStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleTextUpload = async () => {
    if (!textInput.trim()) {
      setUploadStatus('Please enter some text');
      return;
    }

    setIsUploading(true);
    setUploadStatus('Ingesting text...');

    try {
      const result = await api.ingestDocument({
        content: textInput,
        filename: 'manual-text-input.txt',
        type: 'text',
      });

      setUploadStatus(result.success ? 'Text ingested successfully!' : `Error: ${result.message}`);
      onDocumentIngested?.(result);
      setTextInput('');

    } catch (error) {
      setUploadStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (event: any) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };
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
    <section className="document-upload">
      <div className="doc-header">
        <h2>� Your Documents</h2>
        <p>Add documents to provide context for AI responses</p>
      </div>

      {/* RAG Toggle */}
      <div className="toggles">
        <label>
          <input type="checkbox" checked={useRag} onChange={(e) => onRagChange?.(e.target.checked)} />
          <strong>Use RAG</strong> <em>(Search uploaded documents)</em>
        </label>
      </div>

      {/* Three Simple Use Cases */}
      <div className="use-cases-grid">
        {/* Use Case 1: Upload File */}
        <div className="use-case-card">
          <div className="use-case-header">
            <h3>📎 Upload File</h3>
            <p className="use-case-desc">Upload PDF, DOCX, or TXT files</p>
          </div>
          <div className="use-case-content">
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.pdf,.docx"
              onChange={handleFileSelect}
              disabled={isUploading}
              style={{ display: 'none' }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="action-button"
            >
              {isUploading ? '⏳ Uploading...' : '📁 Choose File'}
            </button>
            <p className="use-case-example">
              <strong>Examples:</strong> Research papers, meeting notes, company policies, technical docs
            </p>
          </div>
        </div>

        {/* Use Case 2: Web URL */}
        <div className="use-case-card">
          <div className="use-case-header">
            <h3>🌐 Web URL</h3>
            <p className="use-case-desc">Fetch content from any webpage</p>
          </div>
          <div className="use-case-content">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://example.com/article"
              disabled={isUploading}
              className="input-field"
            />
            <button
              onClick={handleUrlUpload}
              disabled={isUploading || !urlInput.trim()}
              className="action-button"
            >
              {isUploading ? '⏳ Fetching...' : '🔗 Load URL'}
            </button>
            <p className="use-case-example">
              <strong>Examples:</strong> Blog articles, Wikipedia, docs, news articles, FAQs
            </p>
          </div>
        </div>

        {/* Use Case 3: Paste Text */}
        <div className="use-case-card">
          <div className="use-case-header">
            <h3>✏️ Paste Text</h3>
            <p className="use-case-desc">Paste or type content directly</p>
          </div>
          <div className="use-case-content">
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Paste your text here..."
              disabled={isUploading}
              className="input-field text-area"
              rows={4}
            />
            <button
              onClick={handleTextUpload}
              disabled={isUploading || !textInput.trim()}
              className="action-button"
            >
              {isUploading ? '⏳ Processing...' : '📝 Add Text'}
            </button>
            <p className="use-case-example">
              <strong>Examples:</strong> Email content, code snippets, chat transcripts, quick notes
            </p>
          </div>
        </div>
      </div>

      {/* Status Message */}
      {uploadStatus && (
        <div className={`upload-status ${uploadStatus.includes('Error') ? 'error' : 'success'}`}>
          {uploadStatus}
        </div>
      )}

      {/* Chat with Documents */}
      <div className="document-chat">
        <div className="chat-header">
          <h3>💬 Chat with Your Documents</h3>
            <p>Ask questions about your uploaded documents. RAG is automatically enabled for document-based responses.</p>
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

        {uploadStatus && (
          <div className={`upload-status ${uploadStatus.includes('Error') ? 'error' : 'success'}`}>
            {uploadStatus}
          </div>
        )}
    </section>
  );
}