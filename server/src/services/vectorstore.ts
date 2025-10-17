// Content omitted for brevity; see ChatGPT document for full source.
import { makeEmbeddings } from './embeddings';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { Chroma } from '@langchain/community/vectorstores/chroma';
import { Document } from '@langchain/core/documents';
import { CallbackManager } from '@langchain/core/callbacks/manager';
import { documentLoader } from './documentLoader';

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

/**
 * Enhanced document ingestion with LangChain document loaders
 */
export async function ingestDocument(
  source: string | Document[],
  options: {
    chunkSize?: number;
    chunkOverlap?: number;
    metadata?: Record<string, any>;
  } = {}
): Promise<{ success: boolean; message: string; stats?: any }> {
  try {
    let documents: Document[];

    if (Array.isArray(source)) {
      // Direct documents provided
      documents = source;
    } else if (source.startsWith('http://') || source.startsWith('https://')) {
      // Load from URL
      const result = await documentLoader.loadFromUrl(source);
      documents = result.documents;
    } else {
      // Load from file path
      const result = await documentLoader.loadFromFile(source);
      documents = result.documents;
    }

    // Add custom metadata if provided
    if (options.metadata) {
      documents = documents.map(doc => ({
        ...doc,
        metadata: { ...doc.metadata, ...options.metadata }
      }));
    }

    // Update document loader config if specified
    if (options.chunkSize || options.chunkOverlap) {
      documentLoader.updateSplitterConfig(
        options.chunkSize || 1000,
        options.chunkOverlap || 200
      );
    }

    // Store documents
    const embeddings = makeEmbeddings();
    const chromaUrl = process.env.CHROMA_URL;

    if (chromaUrl) {
      const store = await Chroma.fromExistingCollection(embeddings, {
        url: chromaUrl,
        collectionName: process.env.CHROMA_COLLECTION ?? 'castle_mvp',
      });
      await store.addDocuments(documents);
    } else {
      // Use in-memory store
      const store = (await getRetriever()) as any;
      if (store?.vectorStore?.addDocuments) {
        await store.vectorStore.addDocuments(documents);
      } else {
        const mem = new MemoryVectorStore(embeddings);
        await mem.addDocuments(documents);
      }
    }

    return {
      success: true,
      message: `Successfully ingested ${documents.length} document chunks`,
      stats: {
        totalChunks: documents.length,
        totalCharacters: documents.reduce((sum, doc) => sum + doc.pageContent.length, 0),
      }
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to ingest document: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}