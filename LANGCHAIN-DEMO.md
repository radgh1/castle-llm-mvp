# Castle LLM MVP - LangChain Features Demo

This document demonstrates the new LangChain-powered features in Castle LLM MVP.

## Sample Documents for Testing

### test-document.txt
```
Introduction to Artificial Intelligence

Artificial Intelligence (AI) is a branch of computer science that aims to create machines capable of intelligent behavior. AI systems can learn from data, recognize patterns, and make decisions with minimal human intervention.

Key Concepts:
- Machine Learning: Algorithms that improve through experience
- Deep Learning: Neural networks with multiple layers
- Natural Language Processing: Understanding and generating human language
- Computer Vision: Interpreting visual information

AI has applications in healthcare, finance, transportation, and many other fields.
```

### sample-code.js
```javascript
function fibonacci(n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

function memoizedFibonacci(n, memo = {}) {
    if (n in memo) return memo[n];
    if (n <= 1) return n;
    return memo[n] = memoizedFibonacci(n - 1, memo) + memoizedFibonacci(n - 2, memo);
}
```

## API Usage Examples

### 1. Document Ingestion

#### Ingest Text File
```bash
curl -X POST http://localhost:3001/api/rag/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "source": "./demo/test-document.txt",
    "metadata": {"category": "education", "topic": "AI"}
  }'
```

#### Ingest from URL
```bash
curl -X POST http://localhost:3001/api/rag/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "source": "https://en.wikipedia.org/wiki/Artificial_intelligence",
    "chunkSize": 800,
    "metadata": {"source": "wikipedia", "topic": "AI"}
  }'
```

### 2. LangChain Chains

#### Conversation Summarization
```bash
curl -X POST http://localhost:3001/api/chains/summarize \
  -H "Content-Type: application/json" \
  -d '{
    "conversation": [
      {"role": "user", "content": "What is machine learning?"},
      {"role": "assistant", "content": "Machine learning is a subset of AI that enables computers to learn from data without being explicitly programmed."},
      {"role": "user", "content": "How does it work?"},
      {"role": "assistant", "content": "ML algorithms use statistical techniques to find patterns in data and make predictions."},
      {"role": "user", "content": "What are some applications?"},
      {"role": "assistant", "content": "ML is used in recommendation systems, image recognition, fraud detection, and autonomous vehicles."}
    ]
  }'
```

#### Question Answering with Context
```bash
curl -X POST http://localhost:3001/api/chains/qa \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What are the key concepts in AI?",
    "context": [
      "Artificial Intelligence includes machine learning, deep learning, natural language processing, and computer vision.",
      "Machine learning algorithms improve through experience and data analysis.",
      "Deep learning uses neural networks with multiple layers for complex pattern recognition."
    ]
  }'
```

#### Code Explanation
```bash
curl -X POST http://localhost:3001/api/chains/explain-code \
  -H "Content-Type: application/json" \
  -d '{
    "code": "function fibonacci(n) {\n    if (n <= 1) return n;\n    return fibonacci(n - 1) + fibonacci(n - 2);\n}",
    "language": "javascript"
  }'
```

#### Creative Writing
```bash
curl -X POST http://localhost:3001/api/chains/creative \
  -H "Content-Type: application/json" \
  -d '{
    "type": "short story",
    "topic": "A robot learning to paint",
    "style": "whimsical",
    "length": 300
  }'
```

### 3. Enhanced Chat with RAG

#### Regular Chat (without RAG)
```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "What is machine learning?"}
    ],
    "model": "gpt-4o-mini"
  }'
```

#### Chat with RAG Context
```bash
# First, ingest some documents
curl -X POST http://localhost:3001/api/rag/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "source": "./demo/test-document.txt"
  }'

# Then ask questions that will use the ingested content
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "What are the key concepts in AI according to our documents?"}
    ],
    "model": "gpt-4o-mini",
    "useRag": true
  }'
```

## Expected Results

### Document Ingestion Response
```json
{
  "success": true,
  "message": "Successfully ingested 3 document chunks",
  "stats": {
    "totalChunks": 3,
    "totalCharacters": 487
  }
}
```

### Summarization Response
```json
{
  "response": "The conversation covers machine learning: what it is (AI subset for learning from data), how it works (statistical pattern finding), and applications (recommendations, image recognition, fraud detection, autonomous vehicles)."
}
```

### Q&A Response
```json
{
  "response": "The key concepts in AI mentioned include machine learning, deep learning, natural language processing, and computer vision. Machine learning involves algorithms that improve through experience and data analysis, while deep learning uses neural networks with multiple layers for complex pattern recognition."
}
```

### Code Explanation Response
```json
{
  "response": "This is a recursive function that calculates the nth Fibonacci number. It uses a base case where if n is 0 or 1, it returns n directly. Otherwise, it calls itself twice with smaller values and adds the results together. This creates the Fibonacci sequence where each number is the sum of the two preceding ones."
}
```

### Creative Writing Response
```json
{
  "response": "In a workshop filled with canvases and colors, a sleek robot named Pixel discovered his passion for painting. At first, his brushes moved with mechanical precision, creating perfect geometric shapes. But one day, he watched a butterfly land on his palette and was mesmerized by its delicate wings..."
}
```

## Testing Steps

1. **Start the application:**
   ```bash
   npm run dev:server
   cd client && npm run dev
   ```

2. **Test document ingestion:**
   - Create the test files above
   - Use the API calls to ingest them
   - Check that documents are stored in ChromaDB

3. **Test LangChain chains:**
   - Try each chain endpoint
   - Verify responses are coherent and useful

4. **Test RAG-enhanced chat:**
   - Ingest documents first
   - Ask questions that should use the document context
   - Compare responses with and without RAG

## Troubleshooting

- **Document ingestion fails**: Check file paths and permissions
- **Chains return errors**: Ensure OpenAI API key is set
- **RAG not working**: Verify ChromaDB is running and documents are ingested
- **Empty responses**: Check model availability and API limits