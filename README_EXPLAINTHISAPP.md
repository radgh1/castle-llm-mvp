# Castle LLM MVP — What We Built

The Castle LLM MVP is a full-stack AI application designed to demonstrate the skills requested in Castle Interactive's AI Engineer – Full Stack / LLM UI Integration job description.

Think of it as a miniature, extensible ChatGPT platform that can communicate with multiple AI models, manage prompts, and answer questions using a private knowledge base.

The important distinction is that we're building the application around the AI model, not training the model itself.

## 1. System architecture

React + TypeScript UI

Chat • Model selection • Prompt library • RAG toggle

HTTP / Server-Sent Events

Node.js + Express API

Request validation • Model routing • Streaming • RAG orchestration

LLM Providers

OpenAI, Ollama, optional Grok adapter

LangChain RAG

Embeddings • Vector search • Chroma

## 2. What the user can do

[oa-chat & oa-desktop: AI chat apps with unlinkable inference - The Open Anonymity Project](https://images.openai.com/static-rsc-4/X_Wij-8ZBSRU7w4rZBF1wLNxjA8tvSeszpZQkEpJeJ5vQbrlw3MVH3UQUBOKKNgX9ZSk38VGVZfuVlM0V94pb9EZOcSmTGpdOkNND7j15KU9ZUWo5HjrXdgn3jrMT7Vl3Ux9oyz3jV_R4yJ_sc3h5pM24YJq3XMjmjggrxMk5e4?purpose=inline)

Chat with AI models

Enter a question and receive a streaming response. The model can be changed without rewriting the application.

[NeuralHub — AI Analytics & Model Management :: Behance](https://images.openai.com/static-rsc-4/-bvJ_VdmHNIiQ_qwo0G1-qYb5DokgIOKsroyqSwsADk1hqaVgmquQzfWU9rAZAfvcHQKQtkYrRq95fUEdgVnruZyKSL1JMVEGpwkfy3-879jVYVa3S8vZOZaeqVk2dhu88Z1z1JIzJC7VHEI2ctRjUcQ5cInoGIdTsDjV_xdmPg?purpose=inline)

Manage prompts

Create and reuse system prompts that control how the AI responds, such as a technical assistant or business analyst.

[How Retrieval-Augmented Generation (RAG) Solves the Limitations of LLMs | by Vinod Rane | Medium](https://images.openai.com/static-rsc-4/nJy9CkmGLNTbezenhKafGMMcMGfG8jXh6Cxxmf0q7m6v_DZFd3Fftl2RDbGRd9Gf1UPV85UUnIuKEaA2qzcRI_qrQVORnjloTQ3QSHyHtpx27YpyuV5F-OSPp8Bt2sjelJfB2hi_l_CPbIdIdeizLr3Q6tA_NcUz56kz_KcyxA8?purpose=inline)

Ask questions about private knowledge

Store text in a vector database, retrieve relevant passages, and provide those passages to the AI before it generates an answer.

These are illustrative interface references, not screenshots of the actual Castle MVP.

## 3. How RAG works

Suppose you load a company's employee handbook into the knowledge base.

A user asks:

> How many vacation days do employees receive after five years?

The application follows this sequence:

1

User submits a question

2

LangChain converts the question into an embedding

3

Chroma searches for semantically relevant passages

4

Relevant passages are added to the LLM context

5

The model generates an answer using that context

6

The answer streams into the React interface

This is useful for enterprise knowledge assistants, healthcare documentation, technical support, policy questions, and internal document search.

Importantly, RAG reduces reliance on model memory, but doesn't guarantee factual accuracy. A robust implementation still needs citations, access controls, retrieval evaluation, and hallucination testing.

## 4. Technologies demonstrated

| Technology         | Purpose                             |
| ------------------ | ----------------------------------- |
| React / TypeScript | Interactive front end               |
| Node.js / Express  | Backend APIs                        |
| OpenAI / Ollama    | Language model inference            |
| Grok               | Optional alternative model provider |
| LangChain          | Retrieval orchestration             |
| Chroma             | Vector database                     |
| Embeddings         | Semantic document retrieval         |
| SSE                | Real-time response streaming        |
| Docker             | Containerized deployment            |
| Zod                | Request validation                  |

This maps closely to the original Castle Interactive job requirements.

## 5. What makes it interesting?

The architecture separates three concerns:

The interface determines how people interact with AI.

The orchestration layer determines which models, prompts, and knowledge sources are used.

The model performs the actual language generation.

That separation is valuable because you can replace OpenAI with Grok or a local Ollama model without rebuilding the React application.

It's also a foundation for more sophisticated systems: tool calling, multi-agent workflows, document processing, model evaluations, and enterprise integrations.

## 6. How mature is the application?

One important qualification: our earlier project was an MVP scaffold, not a verified production application. We also encountered TypeScript runtime errors during setup.

The original implementation needs additional engineering, particularly around reliable SSE parsing, RAG persistence, environment configuration, API security, and automated tests. Grok support was proposed as an adapter, but we haven't verified that it was integrated and running.

So I would describe the project as a full-stack AI integration prototype, rather than claim it's a finished production system.

## 7. How this relates to OrbWeaver

There's an interesting architectural progression here.

| Castle LLM MVP           | OrbWeaver                                |
| ------------------------ | ---------------------------------------- |
| User submits questions   | Agents receive tasks                     |
| Selects an LLM           | Orchestrates agent execution             |
| Retrieves knowledge      | Manages context and evidence             |
| Streams answers          | Tracks actions and outcomes              |
| User evaluates responses | Automated verification evaluates results |

Castle demonstrates LLM application integration.

OrbWeaver explores AI-driven engineering orchestration, evaluation, and controlled autonomy.

The Castle MVP is essentially the application-layer foundation. OrbWeaver is a much more ambitious investigation into how AI systems can perform work, evaluate it, and operate under explicit constraints.

The bigger lesson: The valuable engineering skill isn't simply knowing LangChain or React. It's understanding how to design a reliable system around probabilistic models—where the interface, orchestration, retrieval, verification, and operational controls work together.

That's the skill the Castle job description was really pointing toward.