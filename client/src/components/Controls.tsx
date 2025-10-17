// Content omitted for brevity; see ChatGPT document for full source.
import React from 'react';

export default function Controls(props: any) {
  const { model, onModel, temperature, onTemp, system, onSystem, useRag, onRag, promptName } = props;
  return (
    <section className="controls">
      <div>
        <label>Model</label>
        <select value={model} onChange={(e) => onModel(e.target.value)}>
          <option value="openai:gpt-4o-mini">OpenAI / gpt-4o-mini</option>
          <option value="openai:gpt-4.1">OpenAI / gpt-4.1</option>
          <option value="llama2:latest">Ollama / llama2</option>
        </select>
      </div>
      <div>
        <label>Temperature</label>
        <input type="range" min={0} max={1.5} step={0.1} value={temperature} onChange={(e) => onTemp(parseFloat(e.target.value))} />
        <span>{temperature.toFixed(1)}</span>
      </div>
      <div className="system">
        <label>System Prompt {promptName ? <em>({promptName})</em> : null}</label>
        <textarea rows={3} value={system} onChange={(e) => onSystem(e.target.value)} placeholder="You are a helpful assistant..." />
      </div>
      <div className="toggles">
        <label><input type="checkbox" checked={useRag} onChange={(e) => onRag(e.target.checked)} /> Use RAG</label>
      </div>
    </section>
  );
}