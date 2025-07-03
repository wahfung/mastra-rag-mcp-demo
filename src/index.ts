import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { mastra, ragAgent, chatAgent } from './mastra';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// REST API 端点
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    llm: 'deepseek-chat',
    embedding: 'deepseek-embedding',
    vectorDb: 'postgres-pgvector',
    framework: 'mastra'
  });
});

// RAG 查询端点
app.post('/query', async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ error: '问题不能为空' });
    }
    
    const agent = mastra.getAgent('ragAgent');
    const result = await agent.generate(question);
    
    res.json({
      answer: result.text,
      model: 'deepseek-chat',
      type: 'rag-query',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('RAG查询错误:', error);
    res.status(500).json({ 
      error: '查询失败',
      details: error.message 
    });
  }
});

// 直接对话端点
app.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: '消息不能为空' });
    }
    
    const agent = mastra.getAgent('chatAgent');
    const result = await agent.generate(message);
    
    res.json({
      response: result.text,
      model: 'deepseek-chat',
      type: 'direct-chat',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('对话错误:', error);
    res.status(500).json({ 
      error: '对话失败',
      details: error.message 
    });
  }
});

// 文档添加端点（需要手动实现嵌入和存储）
app.post('/documents', async (req, res) => {
  try {
    const { content, metadata } = req.body;
    if (!content) {
      return res.status(400).json({ error: '文档内容不能为空' });
    }
    
    // 这里需要手动实现文档分块、嵌入和存储
    // 由于这是一个复杂的过程，建议参考 Mastra 官方文档
    
    res.json({
      message: '文档添加功能需要实现分块和嵌入逻辑',
      suggestion: '请参考 Mastra RAG 文档实现完整的文档处理流程',
      content_length: content.length,
      metadata,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('文档添加错误:', error);
    res.status(500).json({ 
      error: '文档添加失败',
      details: error.message 
    });
  }
});

// 获取可用 agents
app.get('/agents', (req, res) => {
  res.json({
    agents: [
      {
        name: 'ragAgent',
        description: 'RAG查询代理（DeepSeek + 向量搜索）',
        model: 'deepseek-chat',
        embedding: 'deepseek-embedding',
        tools: ['vectorQueryTool']
      },
      {
        name: 'chatAgent', 
        description: '直接对话代理（DeepSeek）',
        model: 'deepseek-chat',
        tools: []
      }
    ],
    framework: 'mastra',
    vectorStore: 'postgres-pgvector'
  });
});

// 启动服务器
async function startServer() {
  try {
    console.log('🚀 启动 Mastra RAG Demo (Pure DeepSeek)...');
    
    app.listen(port, () => {
      console.log(`✅ 服务器运行在端口 ${port}`);
      console.log(`📊 健康检查: http://localhost:${port}/health`);
      console.log(`🔍 RAG 查询: POST http://localhost:${port}/query`);
      console.log(`💬 DeepSeek 对话: POST http://localhost:${port}/chat`);
      console.log(`📄 文档管理: POST http://localhost:${port}/documents`);
      console.log(`🤖 代理列表: GET http://localhost:${port}/agents`);
      
      console.log(`\n🔧 技术栈:`);
      console.log(`  - 框架: Mastra`);
      console.log(`  - LLM: DeepSeek Chat`);
      console.log(`  - 嵌入: DeepSeek Embedding`);
      console.log(`  - 向量数据库: PostgreSQL + pgvector`);
      console.log(`  - 无 OpenAI 依赖 ✅`);
      console.log(`  - Mastra CLI 兼容 ✅`);
    });
  } catch (error) {
    console.error('服务器启动失败:', error);
    process.exit(1);
  }
}

startServer();

// 导出 Mastra 实例供其他模块使用
export { mastra, ragAgent, chatAgent };