# Mastra RAG Demo

这是一个使用 Mastra 框架构建的 RAG (Retrieval-Augmented Generation) 演示项目，展示了如何轻松集成智能问答和文档管理功能。

## ✨ 为什么选择 Mastra？

- 🎯 **统一框架** - 一个框架解决 RAG + MCP + 工具管理
- 🔌 **内置 MCP 支持** - 无需单独实现 MCP 服务器
- 🛠️ **工具生态** - 丰富的预构建工具和集成
- 📦 **开箱即用** - 简化配置，快速启动

## 🚀 功能特性

- 🔍 **智能问答** - 基于文档知识库的 RAG 查询
- 📄 **文档管理** - 动态添加和索引文档
- 🔌 **MCP 集成** - Mastra 自动暴露 MCP 兼容接口
- 🌐 **RESTful API** - 传统 Web 应用接口
- 📊 **向量搜索** - 高效的语义搜索

## 🏗️ 架构设计

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web 应用      │    │   AI 工具       │    │   CLI 工具      │
│   (REST API)    │    │   (MCP)         │    │   (直接调用)    │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────▼─────────────┐
                    │        Mastra Core        │
                    │  ┌─────────────────────┐  │
                    │  │    工具管理器       │  │
                    │  │ • query_knowledge   │  │
                    │  │ • add_document      │  │
                    │  └─────────────────────┘  │
                    │  ┌─────────────────────┐  │
                    │  │     RAG 引擎        │  │
                    │  │ • 向量数据库        │  │
                    │  │ • 嵌入模型          │  │
                    │  │ • 语言模型          │  │
                    │  └─────────────────────┘  │
                    └───────────────────────────┘
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
VECTOR_DB_URL=your_vector_db_url
PORT=3000
```

### 4. 初始化向量数据库

```bash
npm run vector-setup
```

### 5. 启动服务

```bash
npm run dev
```

## 📡 API 使用

### REST API 端点

#### 健康检查
```bash
curl http://localhost:3000/health
```

#### 智能问答
```bash
curl -X POST http://localhost:3000/query \
  -H "Content-Type: application/json" \
  -d '{"question": "什么是人工智能?"}'
```

#### 添加文档
```bash
curl -X POST http://localhost:3000/documents \
  -H "Content-Type: application/json" \
  -d '{
    "content": "人工智能是计算机科学的一个分支，致力于创建能够执行通常需要人类智能的任务的系统。",
    "metadata": {"title": "AI基础", "author": "Demo"}
  }'
```

### MCP 工具调用

如果 Mastra 支持自动 MCP 暴露，你可以通过 MCP 客户端调用：

```javascript
// 通过 MCP 客户端
const result = await mcpClient.callTool('query_knowledge', {
  question: '机器学习和深度学习的区别是什么？'
});
```

## 🔧 配置说明

### Mastra 工具配置

项目中定义了两个主要工具：

1. **query_knowledge** - 智能问答
   - 输入：`question` (string)
   - 输出：答案、相关来源、处理时间

2. **add_document** - 文档添加
   - 输入：`content` (string), `metadata` (object)
   - 输出：文档ID、分块信息

### 向量数据库支持

- **Pinecone** (默认) - 云端向量数据库
- **Chroma** - 开源向量数据库
- **Weaviate** - 向量搜索引擎
- **Qdrant** - 高性能向量数据库

### LLM 模型支持

- **OpenAI** - GPT-4, GPT-3.5-turbo
- **Claude** - Anthropic 模型
- **Gemini** - Google 模型

## 🆚 架构对比

### ❌ 传统方案（复杂）
```
RAG 服务 + 独立 MCP 服务器 + API 服务器
= 3个服务 + 重复代码 + 复杂部署
```

### ✅ Mastra 方案（简洁）
```
Mastra 核心
= 1个服务 + 统一管理 + 自动 MCP
```

## 🛠️ 开发指南

### 添加新工具

```typescript
// 在 src/index.ts 中添加
const newTool = {
  name: 'custom_tool',
  description: '自定义工具描述',
  inputSchema: { /* JSON Schema */ },
  execute: async (params) => {
    // 工具逻辑
    return result;
  }
};

mastra.tools.push(newTool);
```

### 自定义 RAG 配置

```typescript
const customRAGEngine = new RAGEngine({
  vectorDB: {
    provider: 'chroma',
    config: { host: 'localhost', port: 8000 }
  },
  embedder: {
    provider: 'huggingface',
    model: 'sentence-transformers/all-MiniLM-L6-v2'
  },
  llm: {
    provider: 'claude',
    model: 'claude-3-sonnet'
  }
});
```

## 📁 项目结构

```
mastra-rag-mcp-demo/
├── src/
│   ├── index.ts              # 主应用（Mastra + API）
│   └── setup-vectordb.ts     # 向量数据库初始化
├── package.json              # 简化的依赖
├── tsconfig.json            # TypeScript 配置
├── .env.example             # 环境变量模板
└── README.md               # 项目文档
```

## 🔍 故障排除

### 常见问题

**Q: Mastra 没有自动暴露 MCP 端点？**
A: 检查 Mastra 版本，或者手动添加：
```typescript
if (!mastra.getMCPRouter) {
  console.log('当前 Mastra 版本不支持自动 MCP，请手动实现');
}
```

**Q: 向量数据库连接失败？**
A: 检查 `VECTOR_DB_URL` 配置和网络连接

**Q: 工具调用失败？**
A: 检查工具名称和参数格式是否正确

## 🔮 未来规划

- [ ] 支持更多向量数据库
- [ ] 增加文档格式支持（PDF、Word）
- [ ] 实现查询缓存机制
- [ ] 添加用户权限管理
- [ ] 集成更多 AI 模型

## 🤝 贡献

欢迎提交 Issues 和 Pull Requests！

## 📄 许可证

MIT License

---

**关键优势：使用 Mastra 让 RAG + MCP 集成变得简单而强大！** 🚀