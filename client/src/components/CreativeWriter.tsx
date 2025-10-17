import { useState } from 'react';
import { api, CreativeWriteRequest, CreativeWriteResponse } from '../lib/api';

interface CreativeWriterProps {
  onContentGenerated?: (response: CreativeWriteResponse) => void;
}

export default function CreativeWriter({ onContentGenerated }: CreativeWriterProps) {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('');
  const [length, setLength] = useState('medium');
  const [genre, setGenre] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const styles = [
    'formal', 'casual', 'academic', 'creative', 'technical', 'narrative', 'persuasive', 'descriptive'
  ];

  const genres = [
    'fiction', 'non-fiction', 'blog post', 'article', 'story', 'essay', 'poem', 'script', 'review', 'tutorial'
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a writing prompt');
      return;
    }

    setIsGenerating(true);
    setError('');
    setResult(null);

    try {
      const request: CreativeWriteRequest = {
        prompt: prompt.trim(),
        style: style || undefined,
        length,
        genre: genre || undefined,
      };

      const response = await api.generateCreative(request);
      setResult(response);
      onContentGenerated?.(response);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate content');
    } finally {
      setIsGenerating(false);
    }
  };

  const loadExample = (examplePrompt: string, exampleStyle?: string, exampleGenre?: string) => {
    setPrompt(examplePrompt);
    setStyle(exampleStyle || '');
    setGenre(exampleGenre || '');
    setLength('medium');
  };

  return (
    <section className="creative-writer">
      <h3>✍️ Creative Writer</h3>
      <p>Generate stories, articles, and creative content with AI assistance</p>

      <div className="info-box">
        <p><strong>What it does:</strong> Generates original creative content based on your prompt. Customize the style (formal, casual, creative), length (short/medium/long), and genre (fiction, blog post, poem, etc.) to get exactly what you need.</p>
      </div>

      <div className="tech-specs">
        <p><strong>Stack:</strong> LangChain PromptTemplate with Variable Injection • Style/Genre Constraint Prompting</p>
        <p><strong>How it works:</strong> Frontend sends prompt + style + length + genre to backend, which uses LangChain to format a template with these variables. Backend chains this through the LLM (OpenAI for creative quality, Ollama for local execution) and returns generated content with word count metadata.</p>
        <p><strong>Prompt Engineering:</strong> Uses constraint-based prompting to guide model behavior. Style and genre act as conditioning variables that shape the output distribution without fine-tuning.</p>
      </div>

      <div className="writing-input-section">
        <div className="input-controls">
          <div className="control-row">
            <div className="control-group">
              <label>Length:</label>
              <select
                value={length}
                onChange={(e) => setLength((e.target as any).value)}
                disabled={isGenerating}
              >
                <option value="short">Short (~200 words)</option>
                <option value="medium">Medium (~500 words)</option>
                <option value="long">Long (~1000 words)</option>
              </select>
            </div>

            <div className="control-group">
              <label>Style:</label>
              <select
                value={style}
                onChange={(e) => setStyle((e.target as any).value)}
                disabled={isGenerating}
              >
                <option value="">Any Style</option>
                {styles.map(s => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>

            <div className="control-group">
              <label>Genre:</label>
              <select
                value={genre}
                onChange={(e) => setGenre((e.target as any).value)}
                disabled={isGenerating}
              >
                <option value="">Any Genre</option>
                {genres.map(g => (
                  <option key={g} value={g}>{g.charAt(0).toUpperCase() + g.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="example-buttons">
            <button
              onClick={() => loadExample('Write a short story about a detective solving a mystery in a futuristic city', 'narrative', 'fiction')}
              disabled={isGenerating}
              className="example-btn"
            >
              Mystery Story
            </button>
            <button
              onClick={() => loadExample('Explain the benefits of renewable energy for a general audience', 'formal', 'article')}
              disabled={isGenerating}
              className="example-btn"
            >
              Energy Article
            </button>
            <button
              onClick={() => loadExample('Create a product description for a smart coffee maker', 'persuasive', 'non-fiction')}
              disabled={isGenerating}
              className="example-btn"
            >
              Product Review
            </button>
          </div>
        </div>

        <div className="prompt-input">
          <label>Writing Prompt:</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe what you want to write about..."
            rows={4}
            disabled={isGenerating}
            className="prompt-textarea"
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="generate-button"
        >
          {isGenerating ? '✍️ Writing...' : '✍️ Generate Content'}
        </button>
      </div>

      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}

      {result && (
        <div className="writing-result">
          <div className="result-header">
            <h4>📝 Generated Content</h4>
            {result.title && <h5 className="content-title">{result.title}</h5>}
            <span className="word-count">📊 {result.wordCount} words</span>
          </div>

          <div className="content-body">
            {result.content.split('\n\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}