// Content omitted for brevity; see ChatGPT document for full source.
// LangChain-powered RAG hook with optional Chroma persistence.
// Falls back to in-memory vector store if CHROMA_URL is not set.
import type { Message } from '../schema';
import { getRetriever } from './vectorstore';

export async function enrichWithRag(messages: Message[]): Promise<Message[]> {
  const userText = messages.filter(m => m.role === 'user').map(m => m.content).join('\n');
  if (!userText.trim()) return messages;

  const retriever = await getRetriever();
  const docs = await retriever.getRelevantDocuments(userText);
  if (!docs?.length) return messages;

  const ctx = docs
    .slice(0, 5)
    .map((d, i) => `[#${i + 1}] ${d.pageContent}${d.metadata?.source ? `\n(source: ${d.metadata.source})` : ''}`)
    .join('\n\n');

  const prefix: Message = {
    role: 'system',
    content: `Use the following retrieved context to answer. If the context is insufficient, say so clearly.

${ctx}`
  };
  return [prefix, ...messages];
}