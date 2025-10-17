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

// Configure CORS for production deployments
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3001',
  'http://localhost:3000',
  process.env.FRONTEND_URL || '', // Netlify frontend URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
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
    type: z.enum(['url', 'text', 'file']).optional(),
    content: z.string().optional(),
    url: z.string().optional(),
    filename: z.string().optional(),
    source: z.string().optional(), // Legacy format support
    chunkSize: z.number().optional(),
    chunkOverlap: z.number().optional(),
    metadata: z.record(z.any()).optional()
  });
  
  const parsed = schema.parse(req.body);
  const { type, content, url, filename, source, chunkSize, chunkOverlap, metadata } = parsed;

  try {
    let result;
    
    // Handle new frontend format
    if (type === 'url' && url) {
      result = await ingestDocument(url, {
        chunkSize,
        chunkOverlap,
        metadata: { ...metadata, filename: filename || 'webpage' }
      });
    } else if (type === 'text' && content) {
      // Direct text ingestion
      const { Document } = await import('langchain/document');
      const doc = new Document({
        pageContent: content,
        metadata: { ...metadata, filename: filename || 'text-input', source: 'direct-text' }
      });
      const { makeEmbeddings } = await import('./services/embeddings');
      const embeddings = makeEmbeddings();
      const { upsertDocuments } = await import('./services/vectorstore');
      result = await upsertDocuments([{ text: content, metadata: doc.metadata }]);
    } else if (source) {
      // Legacy format
      result = await ingestDocument(source, {
        chunkSize,
        chunkOverlap,
        metadata
      });
    } else {
      throw new Error('Invalid request: must provide type with content/url, or source field');
    }
    
    res.json({
      success: true,
      message: `Document ingested successfully`,
      documentCount: (result as any).count || 1,
      stats: result
    });
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
    text: z.string().optional(),
    conversation: z.array(z.object({
      role: z.enum(['system', 'user', 'assistant']),
      content: z.string()
    })).optional(),
    type: z.enum(['conversation', 'document', 'general']).optional(),
    length: z.enum(['brief', 'moderate', 'detailed']).optional()
  });
  const parsed = schema.parse(req.body);
  const { text, conversation, type, length } = parsed;

  try {
    // Convert text format to conversation format if needed
    let conversationToSummarize = conversation;
    
    if (text && !conversation) {
      // If we have plain text, convert it to a conversation format
      conversationToSummarize = [
        { role: 'user' as const, content: text }
      ];
    }

    if (!conversationToSummarize || conversationToSummarize.length === 0) {
      return res.status(400).json({
        error: 'Please provide either text or conversation to summarize'
      });
    }

    const result = await chatChains.summarizeConversation(conversationToSummarize);
    
    res.json({
      summary: result.response,
      keyPoints: extractKeyPoints(result.response),
      type: type || 'general',
      length: length || 'moderate'
    });
  } catch (error) {
    console.error('Summarization error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Summarization failed'
    });
  }
});

function extractKeyPoints(text: string): string[] {
  return text
    .split('\n')
    .filter(line => line.trim().length > 0)
    .slice(0, 10)
    .map(line => line.replace(/^[-*•]\s*/, '').trim());
}

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
    language: z.string().min(1),
    context: z.string().optional()
  });
  const { code, language, context } = schema.parse(req.body);

  try {
    const result = await chatChains.explainCode(code, language);
    
    // Extract key points from the explanation
    const explanation = result.response;
    const keyPoints = explanation
      .split('\n')
      .filter(line => line.trim().length > 0)
      .slice(0, 5)
      .map(line => line.replace(/^[-*•]\s*/, '').trim());

    res.json({
      explanation,
      keyPoints,
      complexity: extractComplexity(explanation),
      suggestions: extractSuggestions(explanation)
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Code explanation failed'
    });
  }
});

function extractComplexity(text: string): string {
  if (text.toLowerCase().includes('o(1)')) return 'O(1)';
  if (text.toLowerCase().includes('o(n²)') || text.toLowerCase().includes('o(n^2)')) return 'O(n²)';
  if (text.toLowerCase().includes('o(n)')) return 'O(n)';
  if (text.toLowerCase().includes('o(n log n)')) return 'O(n log n)';
  if (text.toLowerCase().includes('o(log n)')) return 'O(log n)';
  if (text.toLowerCase().includes('high|complex|complicated')) return 'High';
  if (text.toLowerCase().includes('simple|linear')) return 'Low';
  return 'Medium';
}

function extractSuggestions(text: string): string[] {
  const suggestions: string[] = [];
  if (text.toLowerCase().includes('could be optimized')) {
    suggestions.push('Consider optimizing for better performance');
  }
  if (text.toLowerCase().includes('error') || text.toLowerCase().includes('exception')) {
    suggestions.push('Add error handling for edge cases');
  }
  if (text.toLowerCase().includes('loop')) {
    suggestions.push('Review loop complexity and consider alternatives');
  }
  return suggestions;
}

app.post('/api/chains/creative-write', async (req, res) => {
  const schema = z.object({
    prompt: z.string().min(1),
    style: z.string().optional(),
    length: z.enum(['short', 'medium', 'long']).optional(),
    genre: z.string().optional()
  });
  const { prompt, style, length, genre } = schema.parse(req.body);

  try {
    // Map frontend format to backend format
    const type = genre || 'general';
    const topic = prompt;
    const lengthMap: Record<string, number> = {
      'short': 200,
      'medium': 500,
      'long': 1000
    };
    const lengthWords = lengthMap[length || 'medium'] || 500;

    const result = await chatChains.generateCreativeContent(type, topic, style, lengthWords);
    
    res.json({
      content: result.response,
      wordCount: result.response.split(/\s+/).length
    });
  } catch (error) {
    console.error('Creative generation error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Creative generation failed'
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