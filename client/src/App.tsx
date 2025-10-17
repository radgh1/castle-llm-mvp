// Content omitted for brevity; see ChatGPT document for full source.
import { useState } from 'react';
import Chat from './components/Chat';
import Controls from './components/Controls';
import PromptManager from './components/PromptManager';
import './styles.css';

export default function App() {
  const [model, setModel] = useState('openai:gpt-4o-mini');
  const [temperature, setTemp] = useState(0.7);
  const [system, setSystem] = useState('');
  const [useRag, setUseRag] = useState(false);
  const [promptName, setPromptName] = useState<string | undefined>();

  return (
    <div className="container">
      <header>
        <h1>Castle LLM UI MVP</h1>
        <p>OpenAI / Ollama • Streaming • Prompt Mgmt • RAG hook</p>
      </header>
      <Controls
        model={model}
        onModel={setModel}
        temperature={temperature}
        onTemp={setTemp}
        system={system}
        onSystem={setSystem}
        useRag={useRag}
        onRag={setUseRag}
        promptName={promptName}
        onPrompt={setPromptName}
      />
      <PromptManager onPick={setPromptName} onSystem={setSystem} />
      <Chat model={model} temperature={temperature} system={system} useRag={useRag} promptName={promptName} />
    </div>
  );
}