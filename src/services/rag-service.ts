import { Mastra } from '@mastra/core';
import { RAGEngine } from '@mastra/rag';
import { VectorDB } from '@mastra/vector-db';
import { deepseek } from '@ai-sdk/deepseek';
import { generateText } from 'ai';

export interface QueryResult {
  answer: string;
  sources: Array<{
    content: string;
    metadata?: any;
    similarity?: number;
  }>;
  processingTime: number;
  model: string;
}

export interface DocumentResult {
  id: string;
  chunks: number;
  processed: boolean;
  timestamp: string;
}

export class MastraRAGService {
  private mastra: Mastra;
  private ragEngine: RAGEngine;
  private vectorDB: VectorDB;
  private llmModel: any;

  constructor() {
    // 使用 DeepSeek 模型
    this.llmModel = deepseek('deepseek-chat');
    
    this.vectorDB = new VectorDB({
      provider: 'pinecone',
      config: {
        url: process.env.VECTOR_DB_URL
      }
    });

    this.ragEngine = new RAGEngine({
      vectorDB: this.vectorDB,
      embedder: {
        provider: 'openai', // 仅用于嵌入
        model: 'text-embedding-3-small',
        apiKey: process.env.OPENAI_API_KEY
      },
      llm: {
        provider: 'custom', // 使用自定义 DeepSeek
        model: 'deepseek-chat',
        generateFn: async (prompt: string, options: any) => {
          const { text } = await generateText({
            model: this.llmModel,
            prompt,
            temperature: options.temperature || 0.7,
            maxTokens: options.maxTokens || 1000,
          });
          return text;
        }
      }
    });

    this.mastra = new Mastra({
      engines: {
        rag: this.ragEngine
      }
    });
  }

  async initialize(): Promise<void> {
    try {
      await this.vectorDB.initialize();
      await this.ragEngine.initialize();
      console.log('✅ Mastra RAG 服务初始化成功 (DeepSeek)');
    } catch (error) {
      console.error('❌ Mastra RAG 服务初始化失败:', error);
      throw error;
    }
  }

  async query(question: string): Promise<QueryResult> {
    const startTime = Date.now();
    
    try {
      // 使用 RAG 引擎进行搜索
      const searchResults = await this.ragEngine.search({
        query: question,
        topK: 5,
        threshold: 0.7
      });

      // 使用 DeepSeek 生成回答
      const answer = await this.generateAnswer(question, searchResults);

      return {
        answer,
        sources: searchResults.map(source => ({
          content: source.content,
          metadata: source.metadata,
          similarity: source.similarity
        })),
        processingTime: Date.now() - startTime,
        model: 'deepseek-chat'
      };
    } catch (error) {
      console.error('查询错误:', error);
      throw error;
    }
  }

  async addDocument(content: string, metadata?: any): Promise<DocumentResult> {
    try {
      const result = await this.ragEngine.addDocument({
        content,
        metadata: {
          ...metadata,
          timestamp: new Date().toISOString(),
          addedBy: 'mastra-rag-service-deepseek'
        }
      });

      return {
        id: result.id,
        chunks: result.chunks || 1,
        processed: true,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('文档添加错误:', error);
      throw error;
    }
  }

  private async generateAnswer(question: string, sources: any[]): Promise<string> {
    const context = sources.map(source => source.content).join('\n\n');
    
    try {
      const { text: answer } = await generateText({
        model: this.llmModel,
        system: '你是一个有用的AI助手，能够基于提供的上下文信息回答问题。如果上下文中没有相关信息，请说明无法找到相关信息。',
        prompt: `基于以下上下文信息回答问题：

上下文:
${context}

问题: ${question}

请提供准确、有用的回答：`,
        temperature: 0.7,
        maxTokens: 1000,
      });

      return answer;
    } catch (error) {
      console.error('DeepSeek 生成回答错误:', error);
      throw new Error(`生成回答失败: ${error.message}`);
    }
  }

  // 新增：直接与 DeepSeek 对话的方法
  async chat(message: string, system?: string): Promise<{ response: string; model: string; timestamp: string }> {
    try {
      const { text: response } = await generateText({
        model: this.llmModel,
        system: system || '你是一个有用的AI助手。',
        prompt: message,
        temperature: 0.7,
        maxTokens: 1000,
      });

      return {
        response,
        model: 'deepseek-chat',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('DeepSeek 对话错误:', error);
      throw new Error(`对话失败: ${error.message}`);
    }
  }
}