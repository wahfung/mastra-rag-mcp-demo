import { Mastra } from '@mastra/core';
import { RAGEngine } from '@mastra/rag';
import { VectorDB } from '@mastra/vector-db';
import { OpenAI } from 'openai';

export interface QueryResult {
  answer: string;
  sources: Array<{
    content: string;
    metadata?: any;
    similarity?: number;
  }>;
  processingTime: number;
}

export interface DocumentResult {
  id: string;
  chunks: number;
  processed: boolean;
}

export class MastraRAGService {
  private mastra: Mastra;
  private ragEngine: RAGEngine;
  private vectorDB: VectorDB;
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    this.vectorDB = new VectorDB({
      provider: 'pinecone', // 或其他向量数据库
      config: {
        url: process.env.VECTOR_DB_URL
      }
    });

    this.ragEngine = new RAGEngine({
      vectorDB: this.vectorDB,
      embedder: {
        provider: 'openai',
        model: 'text-embedding-3-small'
      },
      llm: {
        provider: 'openai',
        model: 'gpt-4',
        client: this.openai
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
      console.log('✅ Mastra RAG 服务初始化成功');
    } catch (error) {
      console.error('❌ Mastra RAG 服务初始化失败:', error);
      throw error;
    }
  }

  async query(question: string): Promise<QueryResult> {
    const startTime = Date.now();
    
    try {
      // 使用 RAG 引擎进行查询
      const result = await this.ragEngine.query({
        query: question,
        topK: 5,
        threshold: 0.7
      });

      // 生成回答
      const answer = await this.generateAnswer(question, result.sources);

      return {
        answer,
        sources: result.sources.map(source => ({
          content: source.content,
          metadata: source.metadata,
          similarity: source.similarity
        })),
        processingTime: Date.now() - startTime
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
          timestamp: new Date().toISOString()
        }
      });

      return {
        id: result.id,
        chunks: result.chunks,
        processed: true
      };
    } catch (error) {
      console.error('文档添加错误:', error);
      throw error;
    }
  }

  private async generateAnswer(question: string, sources: any[]): Promise<string> {
    const context = sources.map(source => source.content).join('\n\n');
    
    const prompt = `
    基于以下上下文信息回答问题。如果上下文中没有相关信息，请说明无法找到相关信息。

    上下文:
    ${context}

    问题: ${question}

    回答:
    `;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: '你是一个有用的AI助手，能够基于提供的上下文信息回答问题。' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    return response.choices[0].message.content || '无法生成回答';
  }
}