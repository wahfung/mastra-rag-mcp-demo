# Mastra RAG Demo

一个使用 **纯 Mastra 框架** 构建的 RAG (Retrieval-Augmented Generation) 演示项目，展示了如何用单一框架实现智能问答和文档管理。

## ✨ 设计理念

**简洁 > 复杂** - 避免重复实现，充分利用 Mastra 的内置功能

- 🎯 **Pure Mastra** - 无冗余依赖，纯 Mastra 生态
- 🔧 **零配置 MCP** - 通过 REST API 提供类 MCP 功能
- 📦 **最小依赖** - 只包含必要的包
- 🚀 **开箱即用** - 简化配置，快速启动

## 🚀 功能特性

- 🔍 **智能问答** - 基于文档知识库的 RAG 查询
- 📄 **文档管理** - 动态添加和索引文档  
- 🛠️ **工具接口** - RESTful 工具调用 API
- 🌐 **Web 兼容** - 传统 HTTP 接口
- 📊 **向量搜索** - 高效的语义搜索

## 🏗️ 简化架构

```
              前端应用/工具
                   │
                   ▼
            ┌─────────────────┐
            │   Express API   │
            │  ┌───────────┐  │
            │  │   /query  │  │ ◄─── REST API
            │  │ /documents│  │
            │  │  /tools   │  │ ◄─── 工具接口 (类 MCP)
            │  └───────────┘  │
            └─────────┬───────┘
                      │
                      ▼
            ┌─────────────────┐
            │  Mastra Core    │
            │  ┌───────────┐  │
            │  │工具管理器 │  │
            │  └───────────┘  │
            │  ┌───────────┐  │
            │  │ RAG引擎   │  │
            │  └───────────┘  │
            └─────────────────┘
```

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/wahfung/mastra-rag-mcp-demo.git
cd mastra-rag-mcp-demo
```

### 2. 安装依赖

```bash
npm install
```

### 3. 环境配置

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
OPENAI_API_KEY=your_openai_api_key
VECTOR_DB_URL=your_vector_db_url  # 可选，如果 Mastra 内置向量数据库
PORT=3000
```

### 4. 启动服务

```bash
npm run dev
```

## 📡 API 使用指南

### 基础端点

#### 健康检查
```bash
curl http://localhost:3000/health
```

#### 智能问答
```bash
curl -X POST http://localhost:3000/query \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\"question\": \"什么是人工智能?\"}'
```

#### 添加文档
```bash
curl -X POST http://localhost:3000/documents \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\n    \"content\": \"人工智能是计算机科学的一个分支...\",\n    \"metadata\": {\"title\": \"AI基础\", \"author\": \"Demo\"}\n  }'
```

### 工具接口 (类 MCP)

#### 获取可用工具
```bash
curl http://localhost:3000/tools
```

响应：
```json
{
  \"tools\": [
    {
      \"name\": \"query_knowledge\",
      \"description\": \"查询知识库\",
      \"inputSchema\": { ... }
    },
    {
      \"name\": \"add_document\", 
      \"description\": \"添加文档到知识库\",
      \"inputSchema\": { ... }
    }
  ]
}
```

#### 调用工具
```bash
curl -X POST http://localhost:3000/tools/query_knowledge \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\"question\": \"机器学习是什么?\"}'
```

## 🔧 核心配置

### Mastra 工具定义

```typescript
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
      execute: async ({ question }) => {
        // RAG 查询逻辑
      }
    }
  ],
  engines: {
    rag: new RAGEngine({
      // RAG 配置
    })
  }
});
```

## 📁 项目结构

```
mastra-rag-demo/
├── src/
│   ├── index.ts              # 主应用 (纯 Mastra + Express)
│   └── setup-vectordb.ts     # 向量数据库初始化 (可选)
├── package.json              # 最小化依赖
├── tsconfig.json            # TypeScript 配置
├── .env.example             # 环境变量
└── README.md               # 项目文档
```

## 🆚 架构对比

### ❌ 之前的复杂方案
```
Mastra + 独立MCP服务器 + RAG服务 + Express
= 多个服务 + 重复代码 + @modelcontextprotocol/sdk 依赖
```

### ✅ 现在的简洁方案  
```
Mastra Core + Express 包装
= 单一服务 + 零冗余 + 纯 Mastra 生态
```

## 🛠️ 核心依赖

```json
{
  \"dependencies\": {
    \"@mastra/core\": \"^0.1.0\",
    \"@mastra/rag\": \"^0.1.0\", 
    \"@mastra/vector-db\": \"^0.1.0\",
    \"openai\": \"^4.0.0\",
    \"express\": \"^4.18.0\",
    \"cors\": \"^2.8.0\",
    \"dotenv\": \"^16.0.0\"
  }
}
```

**注意**: 完全移除了 `@modelcontextprotocol/sdk` 依赖！

## 🔮 扩展方向

- [ ] 支持更多 LLM 模型
- [ ] 文件上传和解析 (PDF/Word)
- [ ] 批量文档处理
- [ ] 查询结果缓存
- [ ] WebSocket 实时通信

## 💡 最佳实践

1. **充分利用 Mastra 生态** - 避免重复造轮子
2. **简化依赖树** - 只添加必要的包
3. **统一工具管理** - 通过 Mastra 工具系统管理所有功能
4. **RESTful 设计** - 提供清晰的 API 接口

## 🤝 贡献

欢迎提交 Issues 和 Pull Requests！

## 📄 许可证

MIT License

---

**核心理念: Less is More - 用 Mastra 实现更简洁的 RAG 应用！** 🚀