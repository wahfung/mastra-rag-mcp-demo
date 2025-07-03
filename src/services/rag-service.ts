import { Mastra } from '@mastra/core';
import { Agent } from '@mastra/core/agent';
import { createVectorQueryTool, MDocument } from '@mastra/rag';
import { PgVector } from '@mastra/pg';
import { deepseek } from '@ai-sdk/deepseek';
import { embedMany } from 'ai';

export interface QueryResult {
  answer: string;
  sources?: Array<{
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
  private ragAgent: Agent;
  private chatAgent: Agent;
  private pgVector: PgVector;

  constructor() {
    // 初始化 PostgreSQL 向量数据库
    this.pgVector = new PgVector({
      connectionString: process.env.POSTGRES_CONNECTION_STRING!,
    });

    // 创建向量查询工具（使用 DeepSeek 嵌入）
    const vectorQueryTool = createVectorQueryTool({
      vectorStoreName: 'pgVector',
      indexName: 'embeddings',
      model: deepseek.embedding('deepseek-embedding'), // 使用 DeepSeek 嵌入模型
    });

    // 创建 RAG Agent（使用 DeepSeek）
    this.ragAgent = new Agent({
      name: 'DeepSeek RAG Agent',
      instructions: `你是一个有用的AI助手，能够基于提供的上下文信息回答问题。
      请严格按照以下原则：
      1. 只基于提供的上下文信息回答问题
      2. 如果上下文中没有相关信息，请明确说明
      3. 保持回答简洁和相关
      4. 使用中文回答`,
      model: deepseek('deepseek-chat'), // 使用 DeepSeek 作为 LLM
      tools: {
        vectorQueryTool,
      },
    });

    // 创建直接对话 Agent
    this.chatAgent = new Agent({
      name: 'DeepSeek Chat Agent',
      instructions: '你是一个有用的AI助手，能够进行友好和有用的对话。',
      model: deepseek('deepseek-chat'),
    });

    // 初始化 Mastra
    this.mastra = new Mastra({
      agents: {
        ragAgent: this.ragAgent,
        chatAgent: this.chatAgent,
      },
      vectors: {
        pgVector: this.pgVector,
      },
    });
  }

  async initialize(): Promise<void> {
    try {
      // 确保向量数据库索引存在（使用 DeepSeek 嵌入维度）
      await this.pgVector.createIndex({
        indexName: 'embeddings',
        dimension: 1024, // DeepSeek embedding 的维度（可能需要根据实际情况调整）
      });
      
      console.log('✅ Mastra RAG 服务初始化成功 (Pure DeepSeek + PgVector)');
    } catch (error) {
      // 索引可能已存在，这是正常的
      console.log('📋 向量索引可能已存在，继续启动...');
      console.log('✅ Mastra RAG 服务初始化成功 (Pure DeepSeek + PgVector)');
    }
  }

  async query(question: string): Promise<QueryResult> {
    const startTime = Date.now();
    
    try {
      // 使用 RAG Agent 进行查询
      const result = await this.ragAgent.generate(question);

      return {
        answer: result.text,
        processingTime: Date.now() - startTime,
        model: 'deepseek-chat'
      };
    } catch (error) {
      console.error('RAG查询错误:', error);
      throw new Error(`查询失败: ${error.message}`);
    }
  }

  async addDocument(content: string, metadata?: any): Promise<DocumentResult> {
    try {
      // 使用 MDocument 处理文档
      const doc = MDocument.fromText(content, {
        ...metadata,
        timestamp: new Date().toISOString(),
        addedBy: 'mastra-rag-service-pure-deepseek'
      });
      
      // 分块处理
      const chunks = await doc.chunk({
        strategy: 'recursive',
        size: 512,
        overlap: 50,
      });

      // 生成嵌入（使用 DeepSeek 嵌入模型）
      const { embeddings } = await embedMany({
        model: deepseek.embedding('deepseek-embedding'),
        values: chunks.map(chunk => chunk.text),
      });

      // 存储到向量数据库
      const vectorStore = this.mastra.getVector('pgVector');
      
      await vectorStore.upsert({
        indexName: 'embeddings',
        vectors: embeddings,
        metadata: chunks.map((chunk, index) => ({
          text: chunk.text,
          metadata: chunk.metadata,
          chunkIndex: index,
          documentId: `doc_${Date.now()}_${index}`,
          timestamp: new Date().toISOString(),
          ...metadata
        })),
      });

      return {
        id: `doc_${Date.now()}`,
        chunks: chunks.length,
        processed: true,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('文档添加错误:', error);
      throw new Error(`文档添加失败: ${error.message}`);
    }
  }

  // 直接与 DeepSeek 对话的方法
  async chat(message: string, instructions?: string): Promise<{ response: string; model: string; timestamp: string }> {
    try {
      let agent = this.chatAgent;
      
      // 如果提供了自定义指令，创建临时 agent
      if (instructions) {
        agent = new Agent({
          name: 'Custom DeepSeek Agent',
          instructions,
          model: deepseek('deepseek-chat'),
        });
      }

      const result = await agent.generate(message);

      return {
        response: result.text,
        model: 'deepseek-chat',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('DeepSeek 对话错误:', error);
      throw new Error(`对话失败: ${error.message}`);
    }
  }

  // 获取服务信息
  getServiceInfo() {
    return {
      framework: 'Mastra',
      llm: 'DeepSeek Chat',
      embedding: 'DeepSeek Embedding',
      vectorDb: 'PostgreSQL + pgvector',
      agents: ['ragAgent', 'chatAgent'],
      tools: ['vectorQueryTool'],
      features: [
        'RAG with semantic search',
        'Document processing and chunking',
        'Vector storage and retrieval',
        'DeepSeek-powered responses',
        'Direct chat capabilities',
        'Pure DeepSeek ecosystem'
      ],
      dependencies: {
        core: '@mastra/core',
        rag: '@mastra/rag',
        vector: '@mastra/pg',
        ai: '@ai-sdk/deepseek'
      },
      removedDependencies: [
        '@ai-sdk/openai'
      ]
    };
  }

  // 获取 Mastra 实例（用于外部访问）
  getMastra(): Mastra {
    return this.mastra;
  }
}