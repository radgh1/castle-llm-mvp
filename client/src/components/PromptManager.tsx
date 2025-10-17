// Content omitted for brevity; see ChatGPT document for full source.
import { useEffect, useState } from 'react';

export default function PromptManager({ onPick, onSystem }: { onPick: (name?: string) => void; onSystem: (s: string) => void }) {
  const [items, setItems] = useState<Array<{ name: string; text: string; version: string }>>([]);
  const [name, setName] = useState('');
  const [text, setText] = useState('');

  useEffect(() => { fetch('/api/prompts').then(r => r.json()).then(d => setItems(d.items)); }, []);

  async function save() {
    const resp = await fetch('/api/prompts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, text, version: 'v1' }) });
    const d = await resp.json();
    setItems(d.items); setName(''); setText('');
  }

  return (
    <section className="prompts">
      <h3>Prompt Library</h3>
      <div className="prompt-grid">
        <div>
          <label>Pick</label>
          <select onChange={(e) => {
            const sel = items.find(i => i.name === e.target.value); onPick(sel?.name); if (sel) onSystem(sel.text);
          }}>
            <option value="">—</option>
            {items.map(i => <option key={i.name} value={i.name}>{i.name} ({i.version})</option>)}
          </select>
        </div>
        <div>
          <label>New Prompt</label>
          <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
          <textarea placeholder="Text" value={text} onChange={e => setText(e.target.value)} rows={3} />
          <button onClick={save}>Save</button>
        </div>
      </div>
    </section>
  );
}