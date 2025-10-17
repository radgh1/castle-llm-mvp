import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { streamChat } from './services/chat';
import { ChatRequest } from './schema';
import { loadPrompts, savePrompts } from './store/prompts';
import { upsertDocuments } from './services/vectorstore';
import { z } from 'zod';

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/chat', async (req, res) => {
  const body: ChatRequest = req.body;
  await streamChat(body, res);
});

app.get('/api/prompts', async (req, res) => {
  const data = await loadPrompts();
  res.json(data);
});

app.post('/api/prompts', async (req, res) => {
  const prompt = req.body;
  const data = await savePrompts(prompt);
  res.json(data);
});

// Add this after other routes
app.post('/api/rag/upsert', async (req, res) => {
  const schema = z.object({
    texts: z.array(z.string().min(1)),
    metadatas: z.array(z.record(z.any())).optional()
  });
  const { texts, metadatas } = schema.parse(req.body);
  const docs = texts.map((t, i) => ({ text: t, metadata: metadatas?.[i] ?? {} }));
  const result = await upsertDocuments(docs);
  res.json({ ok: true, ...result });
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});