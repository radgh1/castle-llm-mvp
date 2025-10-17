// Content omitted for brevity; see ChatGPT document for full source.
import { OpenAIEmbeddings } from '@langchain/openai';
import { OllamaEmbeddings } from '@langchain/community/embeddings/ollama';

export function makeEmbeddings() {
  const prov = process.env.EMBEDDINGS_PROVIDER ?? 'openai';
  if (prov === 'ollama') {
    const baseUrl = process.env.OLLAMA_BASE ?? 'http://ollama:11434';
    return new OllamaEmbeddings({ model: process.env.OLLAMA_EMBED_MODEL ?? 'nomic-embed-text', baseUrl });
  }
  // default: OpenAI text-embedding-3-small (fast/cheap)
  return new OpenAIEmbeddings({ model: process.env.OPENAI_EMBED_MODEL ?? 'text-embedding-3-small' });
}