// Content omitted for brevity; see ChatGPT document for full source.
export const API_BASE = '/api';

// Document Ingestion Types
export interface DocumentIngestRequest {
  type?: 'url' | 'text' | 'file';
  content?: string;
  url?: string;
  filename?: string;
  source?: string;
  chunkSize?: number;
  chunkOverlap?: number;
  metadata?: Record<string, any>;
}

export interface DocumentIngestResponse {
  success: boolean;
  message: string;
  documentCount?: number;
  stats?: any;
}

// RAG Query Types
export interface RagQueryRequest {
  query: string;
  topK?: number;
}

export interface RagQueryResponse {
  results: Array<{
    text: string;
    metadata?: Record<string, any>;
  }>;
}

// Code Explainer Types
export interface CodeExplainRequest {
  code: string;
  language?: string;
  context?: string;
}

export interface CodeExplainResponse {
  explanation: string;
  keyPoints?: string[];
  complexity?: string;
  suggestions?: string[];
}

// Creative Writer Types
export interface CreativeWriteRequest {
  prompt: string;
  style?: 'formal' | 'casual' | 'creative' | 'poetic';
  length?: 'short' | 'medium' | 'long';
  genre?: string;
}

export interface CreativeWriteResponse {
  content: string;
  title?: string;
  wordCount?: number;
}

// Summarize Types
export interface SummarizeRequest {
  text?: string;
  conversation?: ChatMessage[];
  type?: 'conversation' | 'document' | 'general';
  length?: 'brief' | 'moderate' | 'detailed';
}

export interface SummarizeResponse {
  summary: string;
  keyPoints?: string[];
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// API Client
export const api = {
  // Document Management
  async ingestDocument(request: DocumentIngestRequest): Promise<DocumentIngestResponse> {
    const response = await fetch(`${API_BASE}/rag/ingest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error(`Failed to ingest document: ${response.statusText}`);
    return response.json();
  },

  async queryDocuments(request: RagQueryRequest): Promise<RagQueryResponse> {
    const response = await fetch(`${API_BASE}/rag/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error(`Failed to query documents: ${response.statusText}`);
    return response.json();
  },

  // Code Explanation
  async explainCode(request: CodeExplainRequest): Promise<CodeExplainResponse> {
    const response = await fetch(`${API_BASE}/chains/explain-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error(`Failed to explain code: ${response.statusText}`);
    return response.json();
  },

  // Creative Writing
  async generateCreative(request: CreativeWriteRequest): Promise<CreativeWriteResponse> {
    const response = await fetch(`${API_BASE}/chains/creative-write`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error(`Failed to generate creative content: ${response.statusText}`);
    return response.json();
  },

  // Summarization
  async summarizeText(request: SummarizeRequest): Promise<SummarizeResponse> {
    const response = await fetch(`${API_BASE}/chains/summarize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error(`Failed to summarize: ${response.statusText}`);
    return response.json();
  },
};