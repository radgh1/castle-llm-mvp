import { useState } from 'react';
import { api, CodeExplainRequest, CodeExplainResponse } from '../lib/api';

interface CodeExplainerProps {
  onExplanationGenerated?: (response: CodeExplainResponse) => void;
}

export default function CodeExplainer({ onExplanationGenerated }: CodeExplainerProps) {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [context, setContext] = useState('');
  const [isExplaining, setIsExplaining] = useState(false);
  const [explanation, setExplanation] = useState<any>(null);
  const [error, setError] = useState('');

  const languages = [
    'javascript', 'typescript', 'python', 'java', 'cpp', 'c', 'csharp', 'go', 'rust', 'php', 'ruby', 'swift', 'kotlin', 'scala', 'html', 'css', 'sql', 'bash', 'powershell'
  ];

  const handleExplain = async () => {
    if (!code.trim()) {
      setError('Please enter some code to explain');
      return;
    }

    setIsExplaining(true);
    setError('');
    setExplanation(null);

    try {
      const request: CodeExplainRequest = {
        code: code.trim(),
        language,
        context: context.trim() || undefined,
      };

      const response = await api.explainCode(request);
      setExplanation(response);
      onExplanationGenerated?.(response);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to explain code');
      console.error('Code explanation error:', err);
    } finally {
      setIsExplaining(false);
    }
  };

  const loadExample = (exampleCode: string, exampleLanguage: string) => {
    setCode(exampleCode);
    setLanguage(exampleLanguage);
    setContext('');
  };

  return (
    <section className="code-explainer">
      <h3>💻 Code Explainer</h3>
      <p>Get detailed explanations and insights about your code</p>
      
      <div className="info-box">
        <p><strong>What it does:</strong> Analyzes your code and provides a detailed explanation of how it works, including complexity analysis (Big O notation) and optimization suggestions. Supports 19+ programming languages.</p>
      </div>

      <div className="tech-specs">
        <p><strong>Stack:</strong> LangChain PromptTemplate • Multi-language AST Analysis • Complexity Parser</p>
        <p><strong>How it works:</strong> Sends code + language to backend which uses LangChain prompt templates to generate explanations via the active LLM (OpenAI or Ollama). Backend extracts Big O complexity and suggestions through regex parsing of LLM output. Perfect for code reviews, learning new patterns, or understanding legacy systems.</p>
        <p><strong>Backend Implementation:</strong> Node.js/Express endpoint chains prompt template → LLM → response formatting. Supports streaming responses for long explanations.</p>
      </div>

      <div className="code-input-section">
        <div className="input-controls">
          <div className="control-group">
            <label>Language:</label>
            <select
              value={language}
              onChange={(e) => setLanguage((e.target as any).value)}
              disabled={isExplaining}
            >
              {languages.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>

          <div className="example-buttons">
            <button
              onClick={() => loadExample('function fibonacci(n) {\n  return n <= 1 ? n : fibonacci(n-1) + fibonacci(n-2);\n}', 'javascript')}
              disabled={isExplaining}
              className="example-btn"
            >
              Fibonacci
            </button>
            <button
              onClick={() => loadExample('def quicksort(arr):\n    if len(arr) <= 1:\n        return arr\n    pivot = arr[len(arr) // 2]\n    left = [x for x in arr if x < pivot]\n    middle = [x for x in arr if x == pivot]\n    right = [x for x in arr if x > pivot]\n    return quicksort(left) + middle + quicksort(right)', 'python')}
              disabled={isExplaining}
              className="example-btn"
            >
              Quicksort
            </button>
            <button
              onClick={() => loadExample('const debounce = (func, delay) => {\n  let timeoutId;\n  return (...args) => {\n    clearTimeout(timeoutId);\n    timeoutId = setTimeout(() => func.apply(null, args), delay);\n  };\n};', 'javascript')}
              disabled={isExplaining}
              className="example-btn"
            >
              Debounce
            </button>
          </div>
        </div>

        <div className="code-input">
          <label>Code to Explain:</label>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Paste your code here..."
            rows={12}
            disabled={isExplaining}
            className="code-textarea"
          />
        </div>

        <div className="context-input">
          <label>Additional Context (optional):</label>
          <textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="Any additional context about what this code does or how it's used..."
            rows={3}
            disabled={isExplaining}
          />
        </div>

        <button
          onClick={handleExplain}
          disabled={isExplaining || !code.trim()}
          className="explain-button"
        >
          {isExplaining ? '🔍 Analyzing...' : '🔍 Explain Code'}
        </button>
      </div>

      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}

      {explanation && (
        <div className="explanation-result">
          <h4>📋 Code Analysis</h4>

          <div className="explanation-section">
            <h5>💡 Explanation</h5>
            <div className="explanation-content">
              {explanation.explanation}
            </div>
          </div>

          {explanation.complexity && (
            <div className="explanation-section">
              <h5>🎯 Complexity</h5>
              <span className={`complexity-badge ${explanation.complexity.toLowerCase()}`}>
                {explanation.complexity}
              </span>
            </div>
          )}

          {explanation.suggestions && explanation.suggestions.length > 0 && (
            <div className="explanation-section">
              <h5>💡 Suggestions</h5>
              <ul className="suggestions-list">
                {explanation.suggestions.map((suggestion: string, index: number) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
}