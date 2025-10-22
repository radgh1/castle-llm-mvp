import { useState, useRef } from 'react';
import { api, DocumentIngestRequest } from '../lib/api';

interface DocumentUploadProps {
  onDocumentIngested?: (result: { success: boolean; message: string; documentCount?: number }) => void;
}

export default function DocumentUpload({ onDocumentIngested }: DocumentUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [textInput, setTextInput] = useState('');
  const [activeTab, setActiveTab] = useState('file');
  const fileInputRef = useRef(null);

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setUploadStatus('Reading file...');

    try {
      let content = '';
      let type: DocumentIngestRequest['type'] = 'text';

      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        // For PDF files, we'll send the file as base64
        const arrayBuffer = await file.arrayBuffer();
        content = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
        type = 'file';
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                 file.name.endsWith('.docx')) {
        // For DOCX files, we'll send as base64
        const arrayBuffer = await file.arrayBuffer();
        content = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
        type = 'file';
      } else {
        // For text files
        content = await file.text();
        type = 'file';
      }

      setUploadStatus('Ingesting document...');

      const result = await api.ingestDocument({
        content,
        filename: file.name,
        type,
      });

      setUploadStatus(result.success ? 'Document ingested successfully!' : `Error: ${result.message}`);
      onDocumentIngested?.(result);

    } catch (error) {
      setUploadStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlUpload = async () => {
    if (!urlInput.trim()) {
      setUploadStatus('Please enter a URL');
      return;
    }

    setIsUploading(true);
    setUploadStatus('Fetching URL content...');

    try {
      const result = await api.ingestDocument({
        content: '', // Will be processed server-side
        filename: urlInput,
        type: 'url',
        url: urlInput,
      });

      setUploadStatus(result.success ? 'URL content ingested successfully!' : `Error: ${result.message}`);
      onDocumentIngested?.(result);
      setUrlInput('');

    } catch (error) {
      setUploadStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleTextUpload = async () => {
    if (!textInput.trim()) {
      setUploadStatus('Please enter some text');
      return;
    }

    setIsUploading(true);
    setUploadStatus('Ingesting text...');

    try {
      const result = await api.ingestDocument({
        content: textInput,
        filename: 'manual-text-input.txt',
        type: 'text',
      });

      setUploadStatus(result.success ? 'Text ingested successfully!' : `Error: ${result.message}`);
      onDocumentIngested?.(result);
      setTextInput('');

    } catch (error) {
      setUploadStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (event: any) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  return (
    <section className="document-upload">
      <h3>📄 Document Ingestion</h3>
      <p>Add documents to enhance AI responses with relevant context</p>

      <div className="rag-info">
        <strong>💡 Tip:</strong> Upload documents here, then go to Chat and enable <strong>"Use RAG"</strong> to search and reference them in conversations.
      </div>

      <div className="tech-specs">
        <p><strong>Stack:</strong> LangChain Document Loaders (PDF, DOCX, URL) • Embedding Generation • ChromaDB/MemoryVectorStore</p>
        <p><strong>How it works:</strong> Frontend accepts files, URLs, or raw text. Backend uses LangChain loaders to parse documents into chunks, generates embeddings via OpenAI or local models, and stores in ChromaDB (cloud) or MemoryVectorStore (local). Enables semantic search via RAG.</p>
        <p><strong>RAG Pipeline:</strong> When "Use RAG" enabled in Chat: (1) User query → (2) Embedding generation → (3) Vector similarity search → (4) Top-5 documents retrieved → (5) Injected into system prompt → (6) LLM grounds response in your documents.</p>
      </div>

      <div className="upload-tabs">
        <button
          className={activeTab === 'file' ? 'active' : ''}
          onClick={() => setActiveTab('file')}
        >
          Upload File
        </button>
        <button
          className={activeTab === 'url' ? 'active' : ''}
          onClick={() => setActiveTab('url')}
        >
          Web URL
        </button>
        <button
          className={activeTab === 'text' ? 'active' : ''}
          onClick={() => setActiveTab('text')}
        >
          Paste Text
        </button>
      </div>

      <div className="upload-content">
        {activeTab === 'file' && (
          <div className="file-upload">
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.pdf,.docx"
              onChange={handleFileSelect}
              disabled={isUploading}
              style={{ display: 'none' }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="upload-button"
            >
              {isUploading ? '📤 Uploading...' : '📎 Choose File'}
            </button>
            <p className="file-types">Supported: .txt, .pdf, .docx</p>
            
            <div className="example-files">
              <p><strong>📋 Test Examples:</strong></p>
              <div className="example-buttons">
                <button 
                  className="example-btn small"
                  onClick={() => {
                    const content = `# Introduction to Machine Learning

Machine Learning (ML) is a subset of artificial intelligence that enables computers to learn and make decisions from data without being explicitly programmed.

## Key Concepts

### Supervised Learning
- **Classification**: Predicting discrete categories (e.g., spam/not spam)
- **Regression**: Predicting continuous values (e.g., house prices)

### Unsupervised Learning  
- **Clustering**: Grouping similar data points
- **Dimensionality Reduction**: Reducing feature complexity

### Deep Learning
Neural networks with multiple layers that can learn complex patterns.

## Applications
- Image recognition
- Natural language processing
- Recommendation systems
- Autonomous vehicles

## Getting Started
1. Choose appropriate algorithm
2. Prepare and clean data
3. Train model
4. Evaluate performance
5. Deploy and monitor`;
                    
                    const blob = new Blob([content], { type: 'text/plain' });
                    const file = new File([blob], 'machine-learning-guide.txt', { type: 'text/plain' });
                    handleFileUpload(file);
                  }}
                  disabled={isUploading}
                  title="Upload a sample ML guide text file"
                >
                  📄 ML Guide (.txt)
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'url' && (
          <div className="url-upload">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://example.com/article"
              disabled={isUploading}
            />
            <button
              onClick={handleUrlUpload}
              disabled={isUploading || !urlInput.trim()}
            >
              {isUploading ? '🔗 Fetching...' : '🌐 Ingest URL'}
            </button>
            
            <div className="example-urls">
              <p><strong>🌐 Test Examples:</strong></p>
              <div className="example-buttons">
                <button 
                  className="example-btn small"
                  onClick={() => setUrlInput('https://en.wikipedia.org/wiki/Machine_learning')}
                  disabled={isUploading}
                  title="Load Wikipedia article about Machine Learning"
                >
                  📖 ML Wikipedia
                </button>
                <button 
                  className="example-btn small"
                  onClick={() => setUrlInput('https://react.dev/learn/thinking-in-react')}
                  disabled={isUploading}
                  title="Load React documentation about thinking in React"
                >
                  ⚛️ React Guide
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'text' && (
          <div className="text-upload">
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Paste your text content here..."
              rows={6}
              disabled={isUploading}
            />
            <button
              onClick={handleTextUpload}
              disabled={isUploading || !textInput.trim()}
            >
              {isUploading ? '📝 Processing...' : '📄 Ingest Text'}
            </button>
            
            <div className="example-text">
              <p><strong>📝 Test Examples:</strong></p>
              <div className="example-buttons">
                <button 
                  className="example-btn small"
                  onClick={() => setTextInput(`# Quantum Computing Fundamentals

## What is Quantum Computing?

Quantum computing harnesses the principles of quantum mechanics to perform computations that would be impractical or impossible with classical computers.

## Key Principles

### Superposition
A qubit can exist in multiple states simultaneously, unlike classical bits which are either 0 or 1.

### Entanglement  
Qubits can be correlated such that the state of one instantly influences the state of another, regardless of distance.

### Interference
Quantum algorithms use interference patterns to amplify correct solutions and cancel incorrect ones.

## Quantum Algorithms

- **Shor's Algorithm**: Factoring large numbers exponentially faster than classical algorithms
- **Grover's Algorithm**: Searching unsorted databases quadratically faster
- **Quantum Fourier Transform**: Foundation for many quantum algorithms

## Current Status

Quantum computers exist today but are in their infancy (NISQ - Noisy Intermediate-Scale Quantum). They have 50-100 qubits and can solve specific problems faster than classical computers, but not general-purpose computing.

## Future Applications

- Cryptography (breaking current encryption, enabling quantum-safe crypto)
- Drug discovery and materials science
- Optimization problems (finance, logistics, AI training)
- Fundamental physics research`)}
                  disabled={isUploading}
                  title="Load sample text about quantum computing"
                >
                  ⚛️ Quantum Computing
                </button>
                <button 
                  className="example-btn small"
                  onClick={() => setTextInput(`# Modern HR Best Practices

## Recruitment & Talent Acquisition

### Effective Job Descriptions
- Use clear, concise language that accurately reflects the role
- Include key responsibilities, required skills, and growth opportunities
- Specify must-have vs. nice-to-have qualifications
- Highlight company culture and values

### Candidate Experience
- Respond to applications within 48 hours
- Provide clear timeline for hiring process
- Offer constructive feedback to unsuccessful candidates
- Use applicant tracking systems for efficient communication

## Employee Onboarding

### 90-Day Integration Plan
1. **First Day**: Welcome, paperwork, tour, introductions
2. **First Week**: Role expectations, tools training, team meetings
3. **First Month**: Performance goals, feedback sessions, skill development
4. **First Quarter**: Performance review, career planning, mentorship

### Key Success Factors
- Clear communication of expectations
- Regular check-ins and feedback
- Access to necessary tools and resources
- Buddy/mentor system for support

## Performance Management

### Continuous Feedback Model
- Regular one-on-one meetings (bi-weekly)
- Real-time recognition of achievements
- Constructive feedback on improvement areas
- Goal setting and progress tracking

### Performance Review Process
1. Self-assessment by employee
2. Manager evaluation and calibration
3. Collaborative discussion and goal setting
4. Development plan creation
5. Follow-up and progress monitoring

## Employee Development

### Learning & Development
- Individual development plans
- Cross-training opportunities
- Conference and certification support
- Leadership development programs

### Career Progression
- Clear career paths and ladders
- Internal job posting system
- Succession planning
- Skills gap analysis and training

## Workplace Culture

### Diversity, Equity & Inclusion
- Unconscious bias training
- Employee resource groups
- Inclusive hiring practices
- Regular DEI assessments

### Work-Life Balance
- Flexible work arrangements
- Mental health support
- Paid time off policies
- Wellness programs

## Compensation & Benefits

### Competitive Packages
- Market research and benchmarking
- Transparent salary ranges
- Performance-based incentives
- Comprehensive benefits (health, dental, retirement)

### Total Rewards Strategy
- Base salary + variable pay
- Health and wellness benefits
- Professional development support
- Work-life balance perks`)}
                  disabled={isUploading}
                  title="Load sample text about HR best practices"
                >
                  � HR Best Practices
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {uploadStatus && (
        <div className={`upload-status ${uploadStatus.includes('Error') ? 'error' : 'success'}`}>
          {uploadStatus}
        </div>
      )}
    </section>
  );
}