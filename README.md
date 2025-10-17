# Castle LLM MVP — Quick start

This repo contains a React client and a TypeScript Express server for a small LLM demo (RAG + streaming chat).

Quick run (Windows PowerShell)

1. Install dependencies at repo root (this installs server and client deps from root):

```powershell
cd C:\Users\idten\OneDrive\source\repos\ChatGPT\castle-llm-mvp
npm install
```

2. Start the server (from repo root):

```powershell
npx tsx --no-warnings server/src/index.ts
```

Or run the root npm script:

```powershell
npm run dev:server
```

3. Start the client in a separate terminal:

```powershell
cd client
npm run dev
```

4. Open the client in your browser:

- http://localhost:5173

Server endpoints

- GET /api/prompts — returns stored prompts (empty list by default)
- POST /api/prompts — save a prompt (body: { name, text, version })
- POST /api/rag/upsert — upsert array of texts (body: { texts: ["..."], metadatas: [...] })
- POST /api/chat — streaming chat endpoint used by the client

Notes

- The server uses ES modules. Use `npx tsx` or the provided npm script to run it locally.
- If port 3001 is in use, either stop the conflicting process or set `PORT` before starting the server.
- To run services like Chroma or Ollama see `docker-compose.yml` — the dev setup assumes you may run these in Docker.

Want more? I can add a convenience root `dev` script to run client+server concurrently, or create a small test script that exercises the API endpoints.