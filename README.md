# 🏰 Castle LLM MVP

**A full-stack AI chat application with streaming responses, multiple LLM providers, and Retrieval-Augmented Generation (RAG) capabilities.**

Castle LLM MVP is a modern, production-ready chat interface that demonstrates advanced AI integration patterns. Built with React, TypeScript, and Express, it provides a seamless experience for interacting with Large Language Models through both cloud APIs (OpenAI) and local models (Ollama).

## ✨ Key Features

### 🤖 **Multiple LLM Support**
- **OpenAI Integration**: GPT-4o-mini, GPT-4o, GPT-3.5-turbo
- **Local Models**: Ollama support for Llama 2, Mistral, and other open-source models
- **Seamless Switching**: Change models instantly through the UI

### 💬 **Advanced Chat Features**
- **Real-time Streaming**: Token-by-token responses for immediate feedback
- **Temperature Control**: Adjustable creativity (0.0-1.5 range for optimal results)
- **System Prompts**: Define AI personality and behavior
- **Prompt Library**: Save and reuse custom prompts

### 🧠 **Retrieval-Augmented Generation (RAG)**
- **Document Ingestion**: Add your knowledge base via API
- **Vector Embeddings**: Automatic text-to-vector conversion
- **Smart Retrieval**: Finds relevant context for better answers
- **Persistent Storage**: ChromaDB integration for production use

### 🎨 **Modern UI/UX**
- **Responsive Design**: Works on desktop and mobile
- **Dark Theme**: Clean, professional interface
- **Real-time Updates**: Live streaming of AI responses
- **Intuitive Controls**: Easy model switching and parameter adjustment

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Client  │    │ Express Server  │    │  LLM Providers  │
│   (Vite + TS)   │◄──►│   (TypeScript)  │◄──►│ OpenAI │ Ollama │
│                 │    │                 │    │                 │
│ • Chat UI       │    │ • API Routes    │    │ • Streaming     │
│ • Controls      │    │ • RAG Service   │    │ • Embeddings    │
│ • Prompt Mgmt   │    │ • Vector Store  │    │ • Rate Limiting │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   Vector DB     │
                       │   ChromaDB      │
                       │   (Optional)    │
                       └─────────────────┘
```

### **Tech Stack**
- **Frontend**: React 18, TypeScript, Vite, CSS
- **Backend**: Node.js, Express, TypeScript
- **AI/ML**: OpenAI API, Ollama, LangChain, ChromaDB
- **Streaming**: Server-Sent Events (SSE)
- **Deployment**: Docker, docker-compose

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- OpenAI API key (for OpenAI models)
- Ollama (optional, for local models)

### Installation

1. **Clone and install dependencies:**
```bash
git clone <your-repo-url>
cd castle-llm-mvp
npm install
```

2. **Set up environment:**
```bash
cp .env.example .env
# Edit .env with your OpenAI API key
```

3. **Start the backend:**
```bash
npm run dev:server
# Server runs on http://localhost:3001
```

4. **Start the frontend (new terminal):**
```bash
cd client
npm run dev
or 
npm run dev:client

# Client runs on http://localhost:5173
```

5. **Open your browser:**
   - Navigate to http://localhost:5173
   - Start chatting!

## 📖 How to Use

### **Basic Chat**
1. Select your preferred model from the dropdown
2. Adjust temperature for creativity (0.0 = consistent, 1.5 = creative)
3. Type your message and press Enter
4. Watch responses stream in real-time

### **System Prompts**
1. Use the textarea to define AI behavior
2. Example: `"You are a helpful coding assistant. Explain concepts clearly."`
3. Save prompts to your library for reuse

### **RAG (Retrieval-Augmented Generation)**
1. Enable the "Use RAG" checkbox
2. Add documents via API (see API section)
3. Ask questions about your documents
4. AI gets relevant context automatically

### **Model Switching**
- **OpenAI models**: Cloud-based, pay-per-token
- **Ollama models**: Local, free after setup
- Switch instantly without restarting

## 🔧 Configuration

### Environment Variables (.env)
```bash
# Required for OpenAI
OPENAI_API_KEY=your-api-key-here

# Optional: Model defaults
OPENAI_MODEL=gpt-4o-mini
OLLAMA_BASE=http://localhost:11434

# Optional: Vector database
CHROMA_URL=http://localhost:8000
CHROMA_COLLECTION=castle_mvp

# Optional: Custom ports
PORT=3001
```

### Docker Services
For full functionality, run supporting services:

```bash
# Start ChromaDB (vector database)
docker run -p 8000:8000 chromadb/chroma

# Start Ollama (local models)
docker run -d -v ollama:/root/.ollama -p 11434:11434 --name ollama ollama/ollama
```

## 📡 API Reference

### **Chat Endpoints**

#### `POST /api/chat`
Stream a chat conversation with an LLM.

**Request Body:**
```json
{
  "model": "llama2:latest",
  "system": "You are helpful",
  "messages": [
    {"role": "user", "content": "Hello!"}
  ],
  "temperature": 0.7,
  "useRag": false
}
```

**Response:** Server-Sent Events stream
```
event: open
data: {"model":"llama2:latest"}

event: token
data: {"token":"Hello"}

event: token
data: {"token":" there"}

event: done
data: {}
```

### **Prompt Management**

#### `GET /api/prompts`
Get all saved prompts.

#### `POST /api/prompts`
Save a new prompt.

**Request Body:**
```json
{
  "name": "coding-assistant",
  "text": "You are an expert programmer...",
  "version": "v1"
}
```

### **RAG Endpoints**

#### `POST /api/rag/upsert`
Add documents to the vector store.

**Request Body:**
```json
{
  "texts": [
    "Your document content here...",
    "Another document..."
  ],
  "metadatas": [
    {"source": "manual.pdf", "page": 1},
    {"source": "guide.md"}
  ]
}
```

## 🎯 Use Cases

### **For Developers**
- **API Testing**: Test LLM integrations before production
- **Prompt Engineering**: Experiment with system prompts
- **RAG Prototyping**: Build document-aware chatbots
- **Model Comparison**: Compare OpenAI vs local models

### **For Researchers**
- **LLM Evaluation**: Compare model performance
- **RAG Research**: Test retrieval-augmented techniques
- **Streaming Analysis**: Study token generation patterns

### **For Businesses**
- **Internal Tools**: Company knowledge assistants
- **Customer Support**: Context-aware chatbots
- **Content Creation**: AI-assisted writing tools
- **Data Analysis**: Document Q&A systems

## 🔒 Security & Best Practices

### **API Keys**
- Never commit `.env` files
- Use environment variables for secrets
- Rotate keys regularly

### **Rate Limiting**
- OpenAI has rate limits by default
- Implement caching for frequent queries
- Monitor API usage costs

### **Data Privacy**
- Local models (Ollama) keep data private
- Cloud models send data to providers
- RAG stores embeddings (consider privacy implications)

## 🐛 Troubleshooting

### **Common Issues**

**"OpenAI API error"**
- Check your API key in `.env`
- Verify account has credits
- Check rate limits

**"Ollama connection failed"**
- Ensure Ollama is running: `ollama serve`
- Pull models: `ollama pull llama2`
- Check port 11434 availability

**"RAG not working"**
- Add documents via `/api/rag/upsert`
- Check vector store connectivity
- Verify embeddings are configured

**"Port already in use"**
- Kill processes: `npx kill-port 3001 5173`
- Change ports in `.env`

### **Performance Tips**
- Use local models for development
- Cache frequent responses
- Optimize RAG document chunking
- Monitor memory usage with large vector stores

## 🤝 Contributing

### **Development Setup**
```bash
# Install dependencies
npm install

# Start development servers
npm run dev:server  # Backend
cd client && npm run dev  # Frontend

# Run tests (when available)
npm test
```

### **Code Structure**
```
castle-llm-mvp/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── lib/           # Utilities
│   │   └── styles.css     # Styling
├── server/                 # Express backend
│   ├── src/
│   │   ├── providers/     # LLM integrations
│   │   ├── services/      # Business logic
│   │   ├── store/         # Data persistence
│   │   └── index.ts       # Server entry
├── scripts/               # Utility scripts
└── docker-compose.yml     # Container orchestration
```

### **Adding New Features**
1. **LLM Providers**: Add to `server/src/providers/`
2. **UI Components**: Add to `client/src/components/`
3. **API Routes**: Add to `server/src/index.ts`
4. **Tests**: Add comprehensive test coverage

## 📄 License

MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- **OpenAI** for powerful LLM APIs
- **Ollama** for local model support
- **LangChain** for RAG framework
- **ChromaDB** for vector storage
- **React & Express** communities

---

**Built with ❤️ for the AI community**

*Questions? Issues? Contributions welcome!* 🚀