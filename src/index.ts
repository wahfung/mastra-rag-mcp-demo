import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Mastra } from '@mastra/core';
import { RAGEngine } from '@mastra/rag';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Mastra 配置 - 统一管理 RAG 和工具
const mastra = new Mastra({
  tools: [
    {
      name: 'query_knowledge',
      description: '查询知识库',
      inputSchema: {
        type: 'object',
        properties: {
          question: { type: 'string', description: '要查询的问题' }
        },
        required: ['question']
      },
      execute: async ({ question }: { question: string }) => {
        const ragEngine = mastra.getEngine('rag') as RAGEngine;
        const result = await ragEngine.query({ 
          query: question,
          topK: 5,
          threshold: 0.7 
        });
        return {
          answer: result.answer,
          sources: result.sources,
          processingTime: Date.now()
        };
      }
    },
    {
      name: 'add_document',
      description: '添加文档到知识库',
      inputSchema: {
        type: 'object',
        properties: {
          content: { type: 'string', description: '文档内容' },
          metadata: { type: 'object', description: '文档元数据' }
        },
        required: ['content']
      },
      execute: async ({ content, metadata }: { content: string; metadata?: any }) => {
        const ragEngine = mastra.getEngine('rag') as RAGEngine;
        const result = await ragEngine.addDocument({
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
      }
    }
  ],
  engines: {
    rag: new RAGEngine({
      vectorDB: {
        provider: 'pinecone',
        config: {
          url: process.env.VECTOR_DB_URL
        }
      },
      embedder: {
        provider: 'openai',
        model: 'text-embedding-3-small'
      },
      llm: {
        provider: 'openai',
        model: 'gpt-4'
      }
    })
  }
});

// 传统 REST API 端点（用于 Web 应用）
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.post('/query', async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ error: '问题不能为空' });
    }
    
    const result = await mastra.executeTool('query_knowledge', { question });
    res.json(result);
  } catch (error) {
    console.error('查询错误:', error);
    res.status(500).json({ error: '查询失败' });
  }
});

app.post('/documents', async (req, res) => {
  try {
    const { content, metadata } = req.body;
    if (!content) {
      return res.status(400).json({ error: '文档内容不能为空' });
    }
    
    const result = await mastra.executeTool('add_document', { content, metadata });
    res.json(result);
  } catch (error) {
    console.error('文档添加错误:', error);
    res.status(500).json({ error: '文档添加失败' });
  }
});

// Mastra 自动暴露的 MCP 端点（如果支持）
if (mastra.getMCPRouter) {
  app.use('/mcp', mastra.getMCPRouter());
  console.log('🔌 Mastra MCP 端点已启用');
}

// 启动服务器
async function startServer() {
  try {
    await mastra.initialize();
    
    app.listen(port, () => {
      console.log(`🚀 Mastra RAG Demo 运行在端口 ${port}`);
      console.log(`📊 健康检查: http://localhost:${port}/health`);
      console.log(`🔍 RAG 查询: POST http://localhost:${port}/query`);
      console.log(`📄 文档上传: POST http://localhost:${port}/documents`);
      
      if (mastra.getMCPRouter) {
        console.log(`🔌 MCP 端点: http://localhost:${port}/mcp`);
      }
      
      console.log(`\n🛠️  可用工具:`);
      console.log(`  - query_knowledge: 智能问答`);
      console.log(`  - add_document: 文档管理`);
    });
  } catch (error) {
    console.error('服务器启动失败:', error);
    process.exit(1);
  }
}

startServer();