// Content omitted for brevity; see ChatGPT document for full source.
import { makeEmbeddings } from './embeddings';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { Chroma } from '@langchain/community/vectorstores/chroma';
import { Document } from '@langchain/core/documents';
import { CallbackManager } from '@langchain/core/callbacks/manager';

let retrieverPromise: Awaited<ReturnType<typeof buildRetriever>> | null = null;

async function buildRetriever() {
  const embeddings = makeEmbeddings();
  const chromaUrl = process.env.CHROMA_URL;

  if (chromaUrl) {
    const store = await Chroma.fromExistingCollection(embeddings, {
      url: chromaUrl,
      collectionName: process.env.CHROMA_COLLECTION ?? 'castle_mvp',
    });
    return store.asRetriever({ k: 5 });
  }

  // In-memory fallback (non-persistent)
  const store = new MemoryVectorStore(embeddings);
  return store.asRetriever({ k: 5 });
}

export async function getRetriever() {
  if (!retrieverPromise) retrieverPromise = await buildRetriever();
  return retrieverPromise;
}

export async function upsertDocuments(docs: Array<{ text: string; metadata?: Record<string, any> }>) {
  const embeddings = makeEmbeddings();
  const chromaUrl = process.env.CHROMA_URL;

  const documents = docs.map(d => new Document({ pageContent: d.text, metadata: d.metadata ?? {} }));

  if (chromaUrl) {
    const store = await Chroma.fromExistingCollection(embeddings, {
      url: chromaUrl,
      collectionName: process.env.CHROMA_COLLECTION ?? 'castle_mvp',
    });
    await store.addDocuments(documents);
    return { provider: 'chroma', count: documents.length };
  } else {
    // In-memory store requires a shared instance; re-use retriever backing store if possible
    const store = (await getRetriever()) as any;
    if (store?.vectorStore?.addDocuments) {
      await store.vectorStore.addDocuments(documents);
      return { provider: 'memory', count: documents.length };
    }
    const mem = new MemoryVectorStore(embeddings);
    await mem.addDocuments(documents);
    return { provider: 'memory:new', count: documents.length };
  }
}