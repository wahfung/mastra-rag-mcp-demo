import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { Router } from 'express';
import { MastraRAGService } from '../services/rag-service';

export class MCPServer {
  private server: Server;
  private ragService: MastraRAGService;

  constructor(ragService: MastraRAGService) {
    this.ragService = ragService;
    this.server = new Server(
      {
        name: 'mastra-rag-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
          resources: {},
        },
      }
    );
  }

  async initialize(): Promise<void> {
    // 注册 RAG 查询工具
    this.server.setRequestHandler('tools/call', async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case 'rag_query':
          return this.handleRAGQuery(args);
        case 'add_document':
          return this.handleAddDocument(args);
        default:
          throw new Error(`未知工具: ${name}`);
      }
    });

    // 注册工具列表
    this.server.setRequestHandler('tools/list', async () => {
      return {
        tools: [
          {
            name: 'rag_query',
            description: '使用RAG系统查询问题',
            inputSchema: {
              type: 'object',
              properties: {
                question: {
                  type: 'string',
                  description: '要查询的问题'
                }
              },
              required: ['question']
            }
          },
          {
            name: 'add_document',
            description: '添加文档到RAG系统',
            inputSchema: {
              type: 'object',
              properties: {
                content: {
                  type: 'string',
                  description: '文档内容'
                },
                metadata: {
                  type: 'object',
                  description: '文档元数据'
                }
              },
              required: ['content']
            }
          }
        ]
      };
    });

    console.log('✅ MCP 服务器初始化成功');
  }

  private async handleRAGQuery(args: any) {
    try {
      const { question } = args;
      const result = await this.ragService.query(question);
      
      return {
        content: [
          {
            type: 'text',
            text: `回答: ${result.answer}\n\n处理时间: ${result.processingTime}ms\n\n相关来源: ${result.sources.length}个`
          }
        ]
      };
    } catch (error) {
      throw new Error(`RAG查询失败: ${error.message}`);
    }
  }

  private async handleAddDocument(args: any) {
    try {
      const { content, metadata } = args;
      const result = await this.ragService.addDocument(content, metadata);
      
      return {
        content: [
          {
            type: 'text',
            text: `文档添加成功\nID: ${result.id}\n分块数: ${result.chunks}`
          }
        ]
      };
    } catch (error) {
      throw new Error(`文档添加失败: ${error.message}`);
    }
  }

  getRouter(): Router {
    const router = Router();

    // WebSocket 或 HTTP 端点用于 MCP 通信
    router.post('/call', async (req, res) => {
      try {
        const { method, params } = req.body;
        // 这里可以添加更多 MCP 协议处理逻辑
        res.json({ success: true, method, params });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    return router;
  }
}