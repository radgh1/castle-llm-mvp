import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { streamChat } from './services/chat';
import { ChatRequest } from './schema';
import { loadPrompts, savePrompts } from './store/prompts';
import { upsertDocuments, ingestDocument } from './services/vectorstore';
import { chatChains } from './services/chains';
import { z } from 'zod';
import type { Message } from './schema';

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

// Enhanced document ingestion with LangChain loaders
app.post('/api/rag/ingest', async (req, res) => {
  const schema = z.object({
    source: z.string().min(1), // File path or URL
    chunkSize: z.number().optional(),
    chunkOverlap: z.number().optional(),
    metadata: z.record(z.any()).optional()
  });
  const { source, chunkSize, chunkOverlap, metadata } = schema.parse(req.body);

  try {
    const result = await ingestDocument(source, {
      chunkSize,
      chunkOverlap,
      metadata
    });
    res.json(result);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Ingestion failed'
    });
  }
});

// LangChain chains endpoints
app.post('/api/chains/summarize', async (req, res) => {
  const schema = z.object({
    conversation: z.array(z.object({
      role: z.enum(['system', 'user', 'assistant']),
      content: z.string()
    }))
  });
  const { conversation } = schema.parse(req.body);

  try {
    const result = await chatChains.summarizeConversation(conversation);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Summarization failed'
    });
  }
});

app.post('/api/chains/qa', async (req, res) => {
  const schema = z.object({
    question: z.string().min(1),
    context: z.array(z.string())
  });
  const { question, context } = schema.parse(req.body);

  try {
    const result = await chatChains.answerWithContext(question, context);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'QA failed'
    });
  }
});

app.post('/api/chains/explain-code', async (req, res) => {
  const schema = z.object({
    code: z.string().min(1),
    language: z.string().min(1)
  });
  const { code, language } = schema.parse(req.body);

  try {
    const result = await chatChains.explainCode(code, language);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Code explanation failed'
    });
  }
});

app.post('/api/chains/creative', async (req, res) => {
  const schema = z.object({
    type: z.string().min(1),
    topic: z.string().min(1),
    style: z.string().optional(),
    length: z.number().optional()
  });
  const { type, topic, style, length } = schema.parse(req.body);

  try {
    const result = await chatChains.generateCreativeContent(type, topic, style, length);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Creative generation failed'
    });
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});