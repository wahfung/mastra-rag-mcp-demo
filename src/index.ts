import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MastraRAGService } from './services/rag-service';
import { MCPServer } from './mcp/server';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());

// 初始化服务
const ragService = new MastraRAGService();
const mcpServer = new MCPServer(ragService);

// 路由
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// RAG 查询端点
app.post('/query', async (req, res) => {
  try {
    const { question } = req.body;
    
    if (!question) {
      return res.status(400).json({ error: '问题不能为空' });
    }

    const result = await ragService.query(question);
    res.json(result);
  } catch (error) {
    console.error('查询错误:', error);
    res.status(500).json({ error: '查询失败' });
  }
});

// 文档上传端点
app.post('/documents', async (req, res) => {
  try {
    const { content, metadata } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: '文档内容不能为空' });
    }

    const result = await ragService.addDocument(content, metadata);
    res.json(result);
  } catch (error) {
    console.error('文档添加错误:', error);
    res.status(500).json({ error: '文档添加失败' });
  }
});

// MCP 端点
app.use('/mcp', mcpServer.getRouter());

// 启动服务器
async function startServer() {
  try {
    await ragService.initialize();
    await mcpServer.initialize();
    
    app.listen(port, () => {
      console.log(`🚀 Mastra RAG MCP Demo 运行在端口 ${port}`);
      console.log(`📊 健康检查: http://localhost:${port}/health`);
      console.log(`🔍 RAG 查询: POST http://localhost:${port}/query`);
      console.log(`📄 文档上传: POST http://localhost:${port}/documents`);
      console.log(`🔌 MCP 端点: http://localhost:${port}/mcp`);
    });
  } catch (error) {
    console.error('服务器启动失败:', error);
    process.exit(1);
  }
}

startServer();