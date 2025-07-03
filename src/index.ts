import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Mastra } from '@mastra/core';
import { RAGEngine } from '@mastra/rag';
import { deepseek } from '@ai-sdk/deepseek';
import { generateText } from 'ai';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// DeepSeek 模型配置
const llmModel = deepseek('deepseek-chat');

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
        const startTime = Date.now();
        
        try {
          const ragEngine = mastra.getEngine('rag') as RAGEngine;
          const searchResults = await ragEngine.search({
            query: question,
            topK: 5,
            threshold: 0.7
          });

          const context = searchResults.map(result => result.content).join('\n\n');
          
          const { text: answer } = await generateText({
            model: llmModel,
            system: '你是一个有用的AI助手，能够基于提供的上下文信息回答问题。如果上下文中没有相关信息，请说明无法找到相关信息。',
            prompt: `基于以下上下文信息回答问题：\n\n上下文:\n${context}\n\n问题: ${question}\n\n请提供准确、有用的回答：`,
            temperature: 0.7,
            maxTokens: 1000,
          });

          return {
            answer,
            sources: searchResults.map(result => ({
              content: result.content,
              metadata: result.metadata,
              similarity: result.similarity
            })),
            processingTime: Date.now() - startTime,
            model: 'deepseek-chat'
          };
        } catch (error) {
          console.error('RAG查询错误:', error);
          throw new Error(`查询失败: ${error.message}`);
        }
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
        try {
          const ragEngine = mastra.getEngine('rag') as RAGEngine;
          const result = await ragEngine.addDocument({
            content,
            metadata: {
              ...metadata,
              timestamp: new Date().toISOString(),
              addedBy: 'mastra-rag-demo'
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
          throw new Error(`文档添加失败: ${error.message}`);
        }
      }
    },
    {
      name: 'chat_with_deepseek',
      description: '直接与 DeepSeek 模型对话',
      inputSchema: {
        type: 'object',
        properties: {
          message: { type: 'string', description: '要发送的消息' },
          system: { type: 'string', description: '系统提示（可选）' }
        },
        required: ['message']
      },
      execute: async ({ message, system }: { message: string; system?: string }) => {
        try {
          const { text: response } = await generateText({
            model: llmModel,
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
          console.error('DeepSeek对话错误:', error);
          throw new Error(`对话失败: ${error.message}`);
        }
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
        provider: 'openai', // 仅用于嵌入
        model: 'text-embedding-3-small',
        apiKey: process.env.OPENAI_API_KEY
      },
      llm: {
        provider: 'custom', // 使用 DeepSeek
        model: 'deepseek-chat',
        generateFn: async (prompt: string, options: any) => {
          const { text } = await generateText({
            model: llmModel,
            prompt,
            temperature: options.temperature || 0.7,
            maxTokens: options.maxTokens || 1000,
          });
          return text;
        }
      }
    })
  }
});

// REST API 端点
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    model: 'deepseek-chat',
    version: '1.0.0'
  });
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
    res.status(500).json({ error: '查询失败', details: error.message });
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
    res.status(500).json({ error: '文档添加失败', details: error.message });
  }
});

app.post('/chat', async (req, res) => {
  try {
    const { message, system } = req.body;
    if (!message) {
      return res.status(400).json({ error: '消息不能为空' });
    }
    
    const result = await mastra.executeTool('chat_with_deepseek', { message, system });
    res.json(result);
  } catch (error) {
    console.error('对话错误:', error);
    res.status(500).json({ error: '对话失败', details: error.message });
  }
});

// 工具接口
app.get('/tools', async (req, res) => {
  try {
    const tools = mastra.tools.map(tool => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema
    }));
    res.json({ 
      tools,
      model: 'deepseek-chat',
      provider: '@ai-sdk/deepseek'
    });
  } catch (error) {
    res.status(500).json({ error: '获取工具列表失败' });
  }
});

app.post('/tools/:toolName', async (req, res) => {
  try {
    const { toolName } = req.params;
    const args = req.body;
    
    const result = await mastra.executeTool(toolName, args);
    res.json({ result });
  } catch (error) {
    console.error('工具执行错误:', error);
    res.status(500).json({ error: '工具执行失败', details: error.message });
  }
});

// 启动服务器
async function startServer() {
  try {
    await mastra.initialize();
    
    app.listen(port, () => {
      console.log(`🚀 Mastra RAG Demo (DeepSeek) 运行在端口 ${port}`);
      console.log(`📊 健康检查: http://localhost:${port}/health`);
      console.log(`🔍 RAG 查询: POST http://localhost:${port}/query`);
      console.log(`📄 文档上传: POST http://localhost:${port}/documents`);
      console.log(`💬 DeepSeek 对话: POST http://localhost:${port}/chat`);
      console.log(`🛠️  工具列表: GET http://localhost:${port}/tools`);
      console.log(`⚡ 工具执行: POST http://localhost:${port}/tools/:toolName`);
      
      console.log(`\n🛠️  可用工具:`);
      console.log(`  - query_knowledge: 智能问答 (RAG + DeepSeek)`);
      console.log(`  - add_document: 文档管理`);
      console.log(`  - chat_with_deepseek: 直接对话`);
      
      console.log(`\n🤖 AI 模型: DeepSeek Chat`);
      console.log(`📦 提供商: @ai-sdk/deepseek`);
      console.log(`🔧 框架: Mastra + AI SDK`);
      console.log(`✨ 状态: 无 modelcontextprotocol 依赖`);
    });
  } catch (error) {
    console.error('服务器启动失败:', error);
    process.exit(1);
  }
}

startServer();