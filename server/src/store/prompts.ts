// Content omitted for brevity; see ChatGPT document for full source.
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const file = path.join(__dirname, 'prompts.json');

export async function loadPrompts() {
  try { return JSON.parse(await fs.readFile(file, 'utf8')); }
  catch { return { items: [] as Array<{ name: string; text: string; version: string }> }; }
}

export async function savePrompts(p: { name: string; text: string; version: string }) {
  const data = await loadPrompts();
  const existing = data.items.findIndex((x: any) => x.name === p.name);
  if (existing >= 0) data.items[existing] = p; else data.items.push(p);
  await fs.writeFile(file, JSON.stringify(data, null, 2));
  return data;
}