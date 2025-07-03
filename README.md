# Mastra RAG Demo with DeepSeek

一个使用 **Mastra 框架 + DeepSeek AI** 构建的 RAG (Retrieval-Augmented Generation) 演示项目，展示了如何用国产 AI 模型实现智能问答和文档管理。

## ✨ 技术亮点

**🇨🇳 国产 AI + 现代框架**

- 🤖 **DeepSeek AI** - 使用先进的国产大语言模型
- 🎯 **Pure Mastra** - 无冗余依赖，纯 Mastra 生态
- 🔧 **AI SDK 集成** - 基于 Vercel AI SDK 的统一接口
- 📦 **最小依赖** - 只包含必要的包
- 🚀 **开箱即用** - 简化配置，快速启动

## 🚀 功能特性

- 🔍 **智能问答** - 基于文档知识库的 RAG 查询（DeepSeek 驱动）
- 📄 **文档管理** - 动态添加和索引文档  
- 💬 **直接对话** - 与 DeepSeek 模型直接交互
- 🛠️ **工具接口** - RESTful 工具调用 API
- 🌐 **Web 兼容** - 传统 HTTP 接口
- 📊 **向量搜索** - 高效的语义搜索

## 🏗️ 架构设计

```
              前端应用/工具
                   │
                   ▼
            ┌─────────────────┐
            │   Express API   │
            │  ┌───────────┐  │
            │  │   /query  │  │ ◄─── RAG 查询
            │  │ /documents│  │ ◄─── 文档管理
            │  │   /chat   │  │ ◄─── 直接对话
            │  │  /tools   │  │ ◄─── 工具接口
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
            │  │ RAG引擎   │  │ ◄─── DeepSeek LLM
            │  └───────────┘  │      OpenAI Embeddings
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
# DeepSeek AI 配置
DEEPSEEK_API_KEY=your_deepseek_api_key

# OpenAI 配置 (仅用于嵌入模型)
OPENAI_API_KEY=your_openai_api_key

# 向量数据库配置
VECTOR_DB_URL=your_vector_db_url

# 服务器配置
PORT=3000
```

### 4. 获取 API 密钥

**DeepSeek API:**
1. 访问 [DeepSeek 开放平台](https://platform.deepseek.com/)
2. 注册账号并获取 API Key
3. 配置到 `DEEPSEEK_API_KEY`

**OpenAI API (仅用于嵌入):**
1. 访问 [OpenAI Platform](https://platform.openai.com/)
2. 获取 API Key 用于文本嵌入
3. 配置到 `OPENAI_API_KEY`

### 5. 启动服务

```bash
npm run dev
```

## 📡 API 使用指南

### 基础端点

#### 健康检查
```bash
curl http://localhost:3000/health
```

响应：
```json
{
  "status": "healthy",
  "timestamp": "2025-07-03T03:00:00.000Z",
  "model": "deepseek-chat",
  "version": "1.0.0"
}
```

#### 智能问答 (RAG)
```bash
curl -X POST http://localhost:3000/query \
  -H "Content-Type: application/json" \
  -d '{"question": "什么是人工智能?"}'
```

响应：
```json
{
  "answer": "基于提供的上下文，人工智能是...",
  "sources": [...],
  "processingTime": 1500,
  "model": "deepseek-chat"
}
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

#### DeepSeek 直接对话
```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "你好，请介绍一下你自己",
    "system": "你是一个友善的AI助手"
  }'
```

### 工具接口 (类 MCP)

#### 获取可用工具
```bash
curl http://localhost:3000/tools
```

响应：
```json
{
  "tools": [
    {
      "name": "query_knowledge",
      "description": "查询知识库",
      "inputSchema": {...}
    },
    {
      "name": "add_document", 
      "description": "添加文档到知识库",
      "inputSchema": {...}
    },
    {
      "name": "chat_with_deepseek",
      "description": "直接与 DeepSeek 模型对话",
      "inputSchema": {...}
    }
  ],
  "model": "deepseek-chat",
  "provider": "@ai-sdk/deepseek"
}
```

#### 调用具体工具
```bash
curl -X POST http://localhost:3000/tools/chat_with_deepseek \
  -H "Content-Type: application/json" \
  -d '{
    "message": "解释一下量子计算的原理",
    "system": "你是一个物理学专家"
  }'
```

## 🔧 核心配置

### DeepSeek 模型集成

```typescript
import { deepseek } from '@ai-sdk/deepseek';
import { generateText } from 'ai';

// 初始化模型
const llmModel = deepseek('deepseek-chat');

// 生成文本
const { text } = await generateText({
  model: llmModel,
  system: '你是一个有用的AI助手',
  prompt: '用户的问题',
  temperature: 0.7,
  maxTokens: 1000,
});
```

### Mastra RAG 配置

```typescript
const mastra = new Mastra({
  engines: {
    rag: new RAGEngine({
      vectorDB: {
        provider: 'pinecone',
        config: { url: process.env.VECTOR_DB_URL }
      },
      embedder: {
        provider: 'openai', // 用于嵌入
        model: 'text-embedding-3-small',
        apiKey: process.env.OPENAI_API_KEY
      },
      llm: {
        provider: 'custom', // 自定义 DeepSeek
        model: 'deepseek-chat',
        generateFn: async (prompt, options) => {
          // DeepSeek 生成逻辑
        }
      }
    })
  }
});
```

## 📁 项目结构

```
mastra-rag-demo/
├── src/
│   ├── index.ts              # 主应用 (Mastra + DeepSeek)
│   └── setup-vectordb.ts     # 向量数据库初始化
├── package.json              # DeepSeek 依赖
├── tsconfig.json            # TypeScript 配置
├── .env.example             # 环境变量 (含 DeepSeek)
└── README.md               # 项目文档
```

## 🔧 核心依赖

```json
{
  "dependencies": {
    "@mastra/core": "^0.1.0",
    "@mastra/rag": "^0.1.0", 
    "@mastra/vector-db": "^0.1.0",
    "@ai-sdk/deepseek": "^0.0.15",
    "ai": "^3.0.0",
    "express": "^4.18.0",
    "cors": "^2.8.0",
    "dotenv": "^16.0.0"
  }
}
```

## 🆚 模型对比

### ✅ DeepSeek 优势
- 🇨🇳 **国产自主** - 支持国产 AI 发展
- 💰 **成本优势** - 相比 GPT-4 更经济
- 🔒 **数据安全** - 符合国内数据合规要求
- 🚀 **性能优秀** - 在多项评测中表现出色

### 🔄 混合方案
```
DeepSeek (LLM) + OpenAI (Embeddings)
= 最佳性价比 + 成熟嵌入模型
```

## 🛠️ 高级配置

### 自定义 DeepSeek 参数
```typescript
const { text } = await generateText({
  model: deepseek('deepseek-chat'),
  temperature: 0.1,      // 更保守的输出
  maxTokens: 2000,       // 更长的回答
  topP: 0.9,            // 核采样参数
  frequencyPenalty: 0.1  // 减少重复
});
```

### 多模型支持
```typescript
// 可以同时支持多个模型
const models = {
  deepseek: deepseek('deepseek-chat'),
  coder: deepseek('deepseek-coder'), // 代码专用模型
};
```

## 📊 性能优化

### 1. 缓存策略
- 向量搜索结果缓存
- DeepSeek 响应缓存
- 文档嵌入缓存

### 2. 并发处理
- 异步向量搜索
- 并行文档处理
- 请求队列管理

### 3. 错误处理
- API 限流重试
- 回退机制
- 优雅降级

## 🔮 扩展方向

- [ ] 支持 DeepSeek Coder 模型
- [ ] 集成更多国产 AI 模型
- [ ] 实现模型路由和负载均衡
- [ ] 添加对话记忆功能
- [ ] 支持多模态输入

## 💡 最佳实践

1. **合理使用模型** - RAG 用 DeepSeek，嵌入用 OpenAI
2. **成本控制** - 设置合理的 token 限制
3. **错误处理** - 实现完善的重试机制
4. **监控日志** - 记录模型调用和性能指标

## 🤝 贡献

欢迎提交 Issues 和 Pull Requests！

特别欢迎：
- 更多国产 AI 模型集成
- 性能优化建议
- 使用案例分享

## 📄 许可证

MIT License

---

**核心理念: 用国产 AI + 现代框架构建下一代智能应用！** 🇨🇳🚀