import { PromptTemplate } from '@langchain/core/prompts';
import { withOpenAI } from '../providers/openai';
import { withOllama } from '../providers/ollama';
import type { Message } from '../schema';

export interface ChainConfig {
  provider: 'openai' | 'ollama';
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface ChainResult {
  response: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
}

/**
 * Enhanced prompt templates and conversation handling using LangChain patterns
 */
export class ChatChains {
  private config: ChainConfig;
  private conversationHistory: Message[] = [];

  constructor(config: ChainConfig = { provider: 'openai' }) {
    this.config = config;
  }

  /**
   * Execute a prompt template with variables
   */
  async executeTemplate(
    template: string,
    variables: Record<string, string>,
    options: { systemPrompt?: string } = {}
  ): Promise<ChainResult> {
    const prompt = PromptTemplate.fromTemplate(template);
    const formattedPrompt = await prompt.format(variables);

    const messages: Message[] = [
      { role: 'user', content: formattedPrompt }
    ];

    if (options.systemPrompt) {
      messages.unshift({ role: 'system', content: options.systemPrompt });
    }

    return this.executeMessages(messages);
  }

  /**
   * Summarize a conversation
   */
  async summarizeConversation(conversation: Message[]): Promise<ChainResult> {
    const conversationText = conversation
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n');

    const template = `Please summarize the following conversation, highlighting key points, decisions, and action items:

Conversation:
{conversation}

Summary:`;

    return this.executeTemplate(template, { conversation: conversationText });
  }

  /**
   * Answer questions using provided context
   */
  async answerWithContext(question: string, context: string[]): Promise<ChainResult> {
    const contextText = context.join('\n\n');

    const template = `Use the following context to answer the question. If the context doesn't contain enough information to fully answer, say so clearly.

Context:
{context}

Question: {question}

Answer:`;

    return this.executeTemplate(template, {
      context: contextText,
      question
    });
  }

  /**
   * Explain code with context
   */
  async explainCode(code: string, language: string): Promise<ChainResult> {
    const template = `Explain the following {language} code in simple terms. Break down what it does, how it works, and any important concepts:

Code:
{code}

Explanation:`;

    return this.executeTemplate(template, { code, language });
  }

  /**
   * Generate creative content
   */
  async generateCreativeContent(
    type: string,
    topic: string,
    style: string = 'professional',
    length: number = 500
  ): Promise<ChainResult> {
    const template = `Write a {type} about: {topic}

Style: {style}
Target length: approximately {length} words

Creative piece:`;

    return this.executeTemplate(template, {
      type,
      topic,
      style,
      length: length.toString()
    });
  }

  /**
   * Add message to conversation history
   */
  addToHistory(message: Message) {
    this.conversationHistory.push(message);
    // Keep only last 20 messages to avoid token limits
    if (this.conversationHistory.length > 20) {
      this.conversationHistory = this.conversationHistory.slice(-20);
    }
  }

  /**
   * Get conversation history
   */
  getHistory(): Message[] {
    return [...this.conversationHistory];
  }

  /**
   * Clear conversation history
   */
  clearHistory() {
    this.conversationHistory = [];
  }

  /**
   * Execute messages using the configured provider
   */
  private async executeMessages(messages: Message[]): Promise<ChainResult> {
    let response = '';

    const onToken = (token: string) => {
      response += token;
    };

    if (this.config.provider === 'ollama') {
      await withOllama({
        model: this.config.model || 'llama2',
        messages,
        temperature: this.config.temperature || 0.7,
        onToken,
      });
    } else {
      await withOpenAI({
        model: this.config.model || 'gpt-4o-mini',
        messages,
        temperature: this.config.temperature || 0.7,
        onToken,
      });
    }

    return { response };
  }

  /**
   * Update chain configuration
   */
  updateConfig(config: Partial<ChainConfig>) {
    this.config = { ...this.config, ...config };
  }
}

// Export default instance
export const chatChains = new ChatChains();