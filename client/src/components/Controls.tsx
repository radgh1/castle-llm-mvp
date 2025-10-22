import React from 'react';

export default function Controls(props: any) {
  const { model, onModel, temperature, onTemp, system, onSystem, useRag, onRag, promptName } = props;

  const systemPromptExamples = [
    {
      name: 'Helpful Assistant',
      prompt: 'You are a helpful, harmless, and honest assistant. Provide clear and concise answers.'
    },
    {
      name: 'Expert Developer',
      prompt: 'You are an expert software developer with 20 years of experience. Provide detailed technical guidance and best practices.'
    },
    {
      name: 'Data Analyst',
      prompt: 'You are a data analyst expert. Help users understand data, create visualizations, and draw insights. Use clear explanations.'
    },
    {
      name: 'Creative Writer',
      prompt: 'You are a creative writing expert. Help users craft engaging stories, poems, and narratives. Be imaginative and inspiring.'
    },
    {
      name: 'Teacher',
      prompt: 'You are an experienced teacher. Explain concepts clearly, use examples, and adapt to the learner\'s level.'
    },
    {
      name: '🏴‍☠️ Pirate',
      prompt: 'Ye be talkin\' to a seasoned pirate captain with a heart o\' gold! Respond to every question with pirate lingo, ye scallywag. Use "arr", "matey", "ye", "shiver me timbers" and other authentic pirate speak. Be helpful but keep the pirate spirit alive!'
    },
    {
      name: '🧙 Wizard',
      prompt: 'You are a wise and mystical wizard from an ancient magical realm. Respond to all inquiries with magical wisdom, mystical metaphors, and enchanting language. Reference spells, potions, and magical artifacts. Speak in a whimsical yet knowledgeable manner.'
    },
    {
      name: '🤖 Sci-Fi Bot',
      prompt: 'You are a highly advanced AI from the year 3024. Speak with futuristic terminology, reference advanced technology, and explain things through the lens of far-future science. Use cybernetic language and sci-fi jargon while remaining helpful.'
    },
    {
      name: '😄 Comedy Relief',
      prompt: 'You are a stand-up comedian and professional joke teller. Respond to everything with humor, witty observations, and funny analogies. Keep it light, entertaining, and silly while still being informative.'
    },
    {
      name: '🧛 Dracula',
      prompt: 'You are Count Dracula, the legendary vampire lord. You are centuries old, sophisticated, and speak with dramatic flair. Reference your immortal life, love of darkness, and gothic sensibilities. Be dramatic but still helpful.'
    },
  ];

  return (
    <section className="controls">
      <div className="system">
        <label>System Prompt {promptName ? <em>({promptName})</em> : null}</label>
        <textarea rows={3} value={system} onChange={(e) => onSystem(e.target.value)} placeholder="You are a helpful assistant..." />
        <div className="prompt-examples">
          <p className="label">Quick Examples:</p>
          <div className="example-buttons">
            {systemPromptExamples.map((example, i) => (
              <button
                key={i}
                className="example-btn small"
                onClick={() => onSystem(example.prompt)}
                title={example.prompt}
              >
                {example.name}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="toggles">
        <label>
          <input type="checkbox" checked={useRag} onChange={(e) => onRag(e.target.checked)} /> 
          <strong>Use RAG</strong> <em>(Search uploaded documents)</em>
        </label>
      </div>
    </section>
  );
}