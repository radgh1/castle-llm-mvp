import { useEffect, useState } from 'react';
import Chat from './components/Chat';
import Controls from './components/Controls';
import PromptManager from './components/PromptManager';
import DocumentUpload from './components/DocumentUpload';
import CodeExplainer from './components/CodeExplainer';
import CreativeWriter from './components/CreativeWriter';
import ConversationSummarizer from './components/ConversationSummarizer';
import { api, ChatMessage, ModelOption } from './lib/api';
import './styles.css';

export default function App() {
  const [model, setModel] = useState('ollama:llama2');
  const [ollamaModels, setOllamaModels] = useState<ModelOption[]>([
    { value: 'ollama:llama2', label: 'llama2' },
  ]);
  const [temperature, setTemp] = useState(0.7);
  const [system, setSystem] = useState('');
  const [useRag, setUseRag] = useState(false);
  const [promptName, setPromptName] = useState<string | undefined>();
  const [activeTab, setActiveTab] = useState<'chat' | 'documents' | 'code' | 'creative' | 'summarize'>('chat');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  useEffect(() => {
    let cancelled = false;
    api.listOllamaModels()
      .then(models => {
        if (!cancelled) setOllamaModels(models);
      })
      .catch(error => {
        console.warn('Unable to load local Ollama models:', error);
      });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="container">
      <header>
        <h1>Castle LLM UI MVP</h1>
        <p>OpenAI / Ollama • Streaming • Prompt Mgmt • RAG • LangChain</p>
      </header>

      <div className="main-navigation">
        <button 
          className={`nav-button ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveTab('chat')}
        >
          💬 Chat
        </button>
        <button 
          className={`nav-button ${activeTab === 'documents' ? 'active' : ''}`}
          onClick={() => setActiveTab('documents')}
        >
          📄 Documents
        </button>
        <button 
          className={`nav-button ${activeTab === 'code' ? 'active' : ''}`}
          onClick={() => setActiveTab('code')}
        >
          💻 Code Explainer
        </button>
        <button 
          className={`nav-button ${activeTab === 'creative' ? 'active' : ''}`}
          onClick={() => setActiveTab('creative')}
        >
          ✨ Creative Writer
        </button>
        <button 
          className={`nav-button ${activeTab === 'summarize' ? 'active' : ''}`}
          onClick={() => setActiveTab('summarize')}
        >
          📋 Summarizer
        </button>
      </div>

      {/* Global Settings */}
      <div className="global-settings">
        <div className="setting-group">
          <label htmlFor="model-select">Model</label>
          <select 
            id="model-select"
            value={model} 
            onChange={(e) => setModel(e.target.value)}
          >
            <optgroup label="OpenAI">
              <option value="openai:gpt-6.1-sol">GPT-6.1 Sol (Balanced)</option>
              <option value="openai:gpt-6.1-terra">GPT-6.1 Terra (Fast)</option>
              <option value="openai:gpt-6-luna">GPT-6 Luna (Efficient)</option>
              <option value="openai:gpt-6-astra">GPT-6 Astra (Most capable)</option>
            </optgroup>
            <optgroup label="Local (Ollama)">
              {ollamaModels.length > 0 ? ollamaModels.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              )) : (
                <option value="ollama:llama2" disabled>No local models found</option>
              )}
            </optgroup>
          </select>
        </div>
        <div className="setting-group">
          <label htmlFor="temp-slider">
            Temperature: {temperature.toFixed(2)}{model.startsWith('openai:gpt-6') ? ' (not used by GPT-6)' : ''}
          </label>
          <input 
            id="temp-slider"
            type="range" 
            min="0" 
            max="1.5" 
            step="0.1" 
            value={temperature}
            onChange={(e) => setTemp(parseFloat(e.target.value))}
            disabled={model.startsWith('openai:gpt-6')}
          />
        </div>
      </div>

      {activeTab === 'chat' && (
        <>
          <Controls
            system={system}
            onSystem={setSystem}
            promptName={promptName}
            onPrompt={setPromptName}
          />
          <PromptManager onPick={setPromptName} onSystem={setSystem} />
          <Chat 
            model={model} 
            temperature={temperature} 
            system={system} 
            useRag={useRag} 
            promptName={promptName}
            onUpdateHistory={setChatHistory}
          />
        </>
      )}

      {activeTab === 'documents' && <DocumentUpload 
        model={model}
        temperature={temperature}
        useRag={useRag}
        onRagChange={setUseRag}
      />}
      {activeTab === 'code' && <CodeExplainer model={model} temperature={temperature} />}
      {activeTab === 'creative' && <CreativeWriter model={model} temperature={temperature} />}
      {activeTab === 'summarize' && <ConversationSummarizer chatHistory={chatHistory} model={model} temperature={temperature} />}
    </div>
  );
}
