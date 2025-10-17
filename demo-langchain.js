#!/usr/bin/env node

/**
 * Standalone LangChain Features Demo
 * Demonstrates the new LangChain capabilities without running the full server
 */

import { Document } from '@langchain/core/documents';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { OpenAIEmbeddings } from '@langchain/openai';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { PromptTemplate } from '@langchain/core/prompts';

async function demonstrateLangChainFeatures() {
    console.log('🚀 Castle LLM MVP - LangChain Features Demo\n');

    try {
        // 1. Document Loading and Text Splitting
        console.log('📄 1. Document Loading & Text Splitting');

        const sampleText = `
        Artificial Intelligence (AI) is a branch of computer science that aims to create machines
        capable of intelligent behavior. AI systems can learn from data, recognize patterns, and
        make decisions with minimal human intervention.

        Key concepts in AI include:
        - Machine Learning: Algorithms that improve through experience
        - Deep Learning: Neural networks with multiple layers
        - Natural Language Processing: Understanding and generating human language
        - Computer Vision: Interpreting visual information

        AI has applications in healthcare, finance, transportation, and many other fields.
        `;

        const textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 200,
            chunkOverlap: 50,
        });

        const docs = await textSplitter.createDocuments([sampleText]);
        console.log(`✅ Split into ${docs.length} chunks`);
        console.log(`📏 First chunk: "${docs[0].pageContent.substring(0, 100)}..."`);
        console.log(`📏 Second chunk: "${docs[1].pageContent.substring(0, 100)}..."\n`);

        // 2. Embeddings and Vector Store
        console.log('🗄️ 2. Embeddings & Vector Storage');

        // Note: This would require an OpenAI API key in a real scenario
        console.log('ℹ️  Embeddings would convert text to vectors for semantic search');
        console.log('ℹ️  Vector stores enable finding relevant content by meaning, not keywords\n');

        // 3. Prompt Templates
        console.log('📝 3. Prompt Templates');

        const qaTemplate = PromptTemplate.fromTemplate(`
Use the following context to answer the question. If you cannot find the answer in the context, say so clearly.

Context:
{context}

Question: {question}

Answer:`);

        const formattedPrompt = await qaTemplate.format({
            context: 'AI includes machine learning, deep learning, NLP, and computer vision.',
            question: 'What are the key concepts in AI?'
        });

        console.log('✅ Template formatted successfully');
        console.log(`📋 Formatted prompt length: ${formattedPrompt.length} characters\n`);

        // 4. RAG Pipeline Simulation
        console.log('🧠 4. RAG Pipeline Simulation');

        // Simulate document retrieval
        const retrievedDocs = [
            new Document({
                pageContent: 'Machine learning is a subset of AI that enables computers to learn from data.',
                metadata: { source: 'ai-basics.txt', chunk: 1 }
            }),
            new Document({
                pageContent: 'Deep learning uses neural networks with multiple layers for complex pattern recognition.',
                metadata: { source: 'ai-basics.txt', chunk: 2 }
            })
        ];

        const context = retrievedDocs.map(doc => doc.pageContent).join('\n\n');
        console.log('✅ Retrieved relevant documents');
        console.log(`📚 Context length: ${context.length} characters`);
        console.log(`🔍 Retrieved ${retrievedDocs.length} relevant chunks\n`);

        // 5. Chain-like Operations
        console.log('🔗 5. Chain-like Operations');

        // Simulate a summarization chain
        const summaryTemplate = PromptTemplate.fromTemplate(`
Summarize the following text in 2-3 sentences:

{text}

Summary:`);

        const summaryPrompt = await summaryTemplate.format({
            text: sampleText.trim()
        });

        console.log('✅ Summarization prompt created');
        console.log(`📝 Prompt would generate a summary of the AI text\n`);

        // 6. Code Explanation Simulation
        console.log('💻 6. Code Explanation Pattern');

        const codeTemplate = PromptTemplate.fromTemplate(`
Explain the following {language} code in simple terms:

\`\`\`{language}
{code}
\`\`\`

Explanation:`);

        const codePrompt = await codeTemplate.format({
            language: 'javascript',
            code: 'function fibonacci(n) { return n <= 1 ? n : fibonacci(n-1) + fibonacci(n-2); }'
        });

        console.log('✅ Code explanation template formatted');
        console.log(`🔧 Would explain the recursive Fibonacci function\n`);

        console.log('🎉 LangChain Features Demo Complete!');
        console.log('\n📋 Summary of Demonstrated Features:');
        console.log('✅ Document Loading & Text Splitting');
        console.log('✅ Prompt Templates & Formatting');
        console.log('✅ RAG Pipeline Simulation');
        console.log('✅ Chain-like Operations');
        console.log('✅ Code Explanation Patterns');
        console.log('\n🚀 All features working correctly!');

    } catch (error) {
        console.error('❌ Demo failed:', error.message);
        console.log('\n💡 This demo shows the LangChain components that would be used in the full application.');
        console.log('   In the actual app, these would connect to LLMs via the provider interfaces.');
    }
}

// Run the demonstration
demonstrateLangChainFeatures();