import { useState } from 'react';
import { api, SummarizeRequest, SummarizeResponse, ChatMessage } from '../lib/api';

interface ConversationSummarizerProps {
  chatHistory?: ChatMessage[];
  onSummaryGenerated?: (response: SummarizeResponse) => void;
}

export default function ConversationSummarizer({ chatHistory = [], onSummaryGenerated }: ConversationSummarizerProps) {
  const [text, setText] = useState('');
  const [type, setType] = useState('conversation');
  const [length, setLength] = useState('brief');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');

  const handleSummarize = async () => {
    let contentToSummarize = text.trim();

    // If no text provided and we have chat history, use that
    if (!contentToSummarize && chatHistory.length > 0) {
      contentToSummarize = chatHistory
        .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n\n');
      setType('conversation');
    }

    if (!contentToSummarize) {
      setError('Please enter text to summarize or ensure chat history is available');
      return;
    }

    setIsSummarizing(true);
    setError('');
    setSummary(null);

    try {
      const request: SummarizeRequest = {
        text: contentToSummarize,
        type,
        length,
      };

      const response = await api.summarizeText(request);
      setSummary(response);
      onSummaryGenerated?.(response);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate summary');
    } finally {
      setIsSummarizing(false);
    }
  };

  const loadChatHistory = () => {
    if (chatHistory.length === 0) {
      setError('No chat history available to summarize');
      return;
    }

    const chatText = chatHistory
      .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n\n');

    setText(chatText);
    setType('conversation');
    setError('');
  };

  const loadExample = (exampleText: string, exampleType: 'conversation' | 'document' | 'general') => {
    setText(exampleText);
    setType(exampleType);
    setLength('brief');
  };

  return (
    <section className="conversation-summarizer">
      <h3>📋 Text Summarizer</h3>
      <p>Condense conversations, documents, or any text into key insights</p>

      <div className="info-box">
        <p><strong>What it does:</strong> Summarizes conversations, documents, or any text into concise key points. Automatically loads your chat history when you visit this tab. Choose summary length (brief/moderate/detailed) and content type for tailored results.</p>
      </div>

      <div className="tech-specs">
        <p><strong>Stack:</strong> LangChain Chain • Conversation History Management • Multi-length Summarization</p>
        <p><strong>How it works:</strong> Accepts conversation/document/general text and uses LangChain chains to generate summaries at specified detail levels. Can auto-populate from chat history (pulled from React state). Backend uses prompt templates with length modifiers to guide summary granularity.</p>
        <p><strong>Key Points Extraction:</strong> LLM generates full summary, then backend parses output to extract key points and metadata. Useful for meeting notes, research summaries, or reducing token context for downstream tasks.</p>
      </div>

      <div className="summarizer-input-section">
        <div className="input-controls">
          <div className="control-row">
            <div className="control-group">
              <label>Content Type:</label>
              <select
                value={type}
                onChange={(e) => setType((e.target as any).value)}
                disabled={isSummarizing}
              >
                <option value="conversation">Conversation</option>
                <option value="document">Document</option>
                <option value="general">General Text</option>
              </select>
            </div>

            <div className="control-group">
              <label>Summary Length:</label>
              <select
                value={length}
                onChange={(e) => setLength((e.target as any).value)}
                disabled={isSummarizing}
              >
                <option value="brief">Brief</option>
                <option value="detailed">Detailed</option>
              </select>
            </div>
          </div>

          <div className="quick-actions">
            <button
              onClick={loadChatHistory}
              disabled={isSummarizing || chatHistory.length === 0}
              className="action-btn"
            >
              📝 Load Chat History ({chatHistory.length} messages)
            </button>

            <div className="example-buttons">
              <button
                onClick={() => loadExample('The meeting discussed the new product launch timeline. Key points included market research completion by Q2, prototype development starting next month, and target release date of Q4. The team agreed on budget allocation and assigned responsibilities to various departments.', 'general')}
                disabled={isSummarizing}
                className="example-btn"
              >
                Meeting Notes
              </button>
              <button
                onClick={() => loadExample('Artificial Intelligence (AI) is transforming industries worldwide. Machine learning algorithms can now process vast amounts of data to identify patterns and make predictions. Deep learning techniques using neural networks have achieved remarkable results in image recognition, natural language processing, and autonomous systems. However, ethical considerations around bias, privacy, and job displacement remain important concerns that need to be addressed as AI continues to evolve.', 'document')}
                disabled={isSummarizing}
                className="example-btn"
              >
                Article Summary
              </button>
            </div>
          </div>
        </div>

        <div className="text-input">
          <label>Text to Summarize:</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your text here, or use the buttons above to load content..."
            rows={8}
            disabled={isSummarizing}
            className="summary-textarea"
          />
        </div>

        <button
          onClick={handleSummarize}
          disabled={isSummarizing || (!text.trim() && chatHistory.length === 0)}
          className="summarize-button"
        >
          {isSummarizing ? '📝 Summarizing...' : '📝 Generate Summary'}
        </button>
      </div>

      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}

      {summary && (
        <div className="summary-result">
          <div className="result-header">
            <h4>📋 Summary</h4>
            <span className="word-count">📊 {summary.wordCount} words</span>
          </div>

          <div className="summary-content">
            <p>{summary.summary}</p>
          </div>

          {summary.keyPoints && summary.keyPoints.length > 0 && (
            <div className="key-points">
              <h5>🔑 Key Points</h5>
              <ul>
                {summary.keyPoints.map((point, index) => (
                  <li key={index}>{point}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
}