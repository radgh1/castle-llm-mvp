import { Document } from '@langchain/core/documents';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import * as fs from 'fs/promises';
import * as path from 'path';
// import pdfParse from 'pdf-parse'; // Temporarily disabled due to module initialization issues
import mammoth from 'mammoth';

export interface DocumentLoadResult {
  documents: Document[];
  metadata: {
    totalChunks: number;
    totalCharacters: number;
    sourceType: string;
    fileName?: string;
  };
}

/**
 * Load and process documents from various sources
 */
export class DocumentLoader {
  private textSplitter: RecursiveCharacterTextSplitter;

  constructor(chunkSize: number = 1000, chunkOverlap: number = 200) {
    this.textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize,
      chunkOverlap,
      separators: ['\n\n', '\n', ' ', ''],
    });
  }

  /**
   * Load text from a file path
   */
  async loadFromFile(filePath: string): Promise<DocumentLoadResult> {
    const ext = path.extname(filePath).toLowerCase();
    const fileName = path.basename(filePath);

    let text: string;
    let sourceType: string;

    switch (ext) {
      case '.pdf':
        text = await this.loadPDF(filePath);
        sourceType = 'pdf';
        break;
      case '.docx':
        text = await this.loadDocx(filePath);
        sourceType = 'docx';
        break;
      case '.txt':
      case '.md':
        text = await fs.readFile(filePath, 'utf-8');
        sourceType = 'text';
        break;
      default:
        throw new Error(`Unsupported file type: ${ext}`);
    }

    const documents = await this.splitText(text, { source: filePath, fileName, type: sourceType });
    const totalCharacters = text.length;
    const totalChunks = documents.length;

    return {
      documents,
      metadata: {
        totalChunks,
        totalCharacters,
        sourceType,
        fileName,
      },
    };
  }

  /**
   * Load text from a URL
   */
  async loadFromUrl(url: string): Promise<DocumentLoadResult> {
    // For now, we'll use a simple fetch. In production, you might want to use
    // LangChain's WebBaseLoader or similar
    const response = await fetch(url);
    const text = await response.text();

    const documents = await this.splitText(text, { source: url, type: 'web' });
    const totalCharacters = text.length;
    const totalChunks = documents.length;

    return {
      documents,
      metadata: {
        totalChunks,
        totalCharacters,
        sourceType: 'web',
      },
    };
  }

  /**
   * Load plain text directly
   */
  async loadFromText(text: string, metadata: Record<string, any> = {}): Promise<DocumentLoadResult> {
    const documents = await this.splitText(text, { ...metadata, type: 'text' });
    const totalCharacters = text.length;
    const totalChunks = documents.length;

    return {
      documents,
      metadata: {
        totalChunks,
        totalCharacters,
        sourceType: 'text',
      },
    };
  }

  private async loadPDF(filePath: string): Promise<string> {
    // TODO: Implement proper PDF parsing
    // For now, return a placeholder message
    return `PDF content from ${path.basename(filePath)} - PDF parsing not yet implemented`;
  }

  private async loadDocx(filePath: string): Promise<string> {
    const buffer = await fs.readFile(filePath);
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  private async splitText(text: string, metadata: Record<string, any>): Promise<Document[]> {
    return await this.textSplitter.createDocuments([text], [metadata]);
  }

  /**
   * Update text splitter configuration
   */
  updateSplitterConfig(chunkSize: number, chunkOverlap: number) {
    this.textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize,
      chunkOverlap,
      separators: ['\n\n', '\n', ' ', ''],
    });
  }
}

// Export a default instance
export const documentLoader = new DocumentLoader();