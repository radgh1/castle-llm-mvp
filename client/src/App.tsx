import { useState } from 'react';
import Chat from './components/Chat';
import Controls from './components/Controls';
import PromptManager from './components/PromptManager';
import DocumentUpload from './components/DocumentUpload';
import CodeExplainer from './components/CodeExplainer';
import CreativeWriter from './components/CreativeWriter';
import ConversationSummarizer from './components/ConversationSummarizer';
import { ChatMessage } from './lib/api';
import './styles.css';

export default function App() {
  const [model, setModel] = useState('ollama:llama2');
  const [temperature, setTemp] = useState(0.7);
  const [system, setSystem] = useState('');
  const [useRag, setUseRag] = useState(false);
  const [promptName, setPromptName] = useState<string | undefined>();
  const [activeTab, setActiveTab] = useState<'chat' | 'documents' | 'code' | 'creative' | 'summarize'>('chat');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

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
              <option value="openai:gpt-4o-mini">GPT-4o Mini (Fast)</option>
              <option value="openai:gpt-4o">GPT-4o (Powerful)</option>
              <option value="openai:gpt-3.5-turbo">GPT-3.5 Turbo (Legacy)</option>
            </optgroup>
            <optgroup label="Local (Ollama)">
              <option value="ollama:llama2">Llama 2</option>
              <option value="ollama:mistral">Mistral</option>
              <option value="ollama:neural-chat">Neural Chat</option>
            </optgroup>
          </select>
        </div>
        <div className="setting-group">
          <label htmlFor="temp-slider">Temperature: {temperature.toFixed(2)}</label>
          <input 
            id="temp-slider"
            type="range" 
            min="0" 
            max="1.5" 
            step="0.1" 
            value={temperature}
            onChange={(e) => setTemp(parseFloat(e.target.value))}
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
      {activeTab === 'code' && <CodeExplainer />}
      {activeTab === 'creative' && <CreativeWriter />}
      {activeTab === 'summarize' && <ConversationSummarizer chatHistory={chatHistory} />}
    </div>
  );
}