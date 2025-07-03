# Mastra RAG Demo with Pure DeepSeek

一个使用 **Mastra 框架 + 纯 DeepSeek AI** 构建的 RAG (Retrieval-Augmented Generation) 演示项目，展示了如何用国产 AI 模型实现智能问答和文档管理。

## ✨ 技术亮点

**🇨🇳 国产 AI + 现代框架**

- 🤖 **Pure DeepSeek AI** - 使用先进的国产大语言模型，包括嵌入和对话
- 🎯 **Pure Mastra** - 无冗余依赖，纯 Mastra 生态
- 🔧 **AI SDK 集成** - 基于 Vercel AI SDK 的统一接口
- 📦 **最小依赖** - 只包含必要的包
- 🚀 **开箱即用** - 简化配置，快速启动
- ❌ **零 OpenAI 依赖** - 完全移除 @ai-sdk/openai
- ❌ **零 MCP 依赖** - 完全移除 modelcontextprotocol

## 🚀 功能特性

- 🔍 **智能问答** - 基于文档知识库的 RAG 查询（纯 DeepSeek 驱动）
- 📄 **文档管理** - 动态添加和索引文档  
- 💬 **直接对话** - 与 DeepSeek 模型直接交互
- 🛠️ **工具接口** - RESTful 工具调用 API
- 🌐 **Web 兼容** - 传统 HTTP 接口
- 📊 **向量搜索** - 高效的语义搜索（DeepSeek 嵌入）

## 🏗️ 项目结构

```
mastra-rag-demo/
├── src/
│   ├── index.ts              # 主应用 (Mastra + Pure DeepSeek)
│   └── setup-vectordb.ts     # 向量数据库初始化
├── package.json              # 纯 DeepSeek 依赖
├── tsconfig.json            # TypeScript 配置
├── .env.example             # 环境变量
└── README.md               # 项目文档
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
DEEPSEEK_API_KEY=your_deepseek_api_key_here

# PostgreSQL 向量数据库配置
POSTGRES_CONNECTION_STRING=postgresql://user:password@localhost:5432/vectordb

# 服务器配置
PORT=3000
```

### 4. 设置向量数据库

```bash
npm run vector-setup
```

### 5. 启动服务

```bash
npm run dev
```

## 📡 API 使用指南

### 健康检查
```bash
curl http://localhost:3000/health
```

### RAG 查询
```bash
curl -X POST http://localhost:3000/query \
  -H "Content-Type: application/json" \
  -d '{"question": "什么是人工智能?"}'
```

### DeepSeek 对话
```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "你好"}'
```

### 添加文档
```bash
curl -X POST http://localhost:3000/documents \
  -H "Content-Type: application/json" \
  -d '{"content": "人工智能是一门研究如何让机器模拟人类智能的科学。", "metadata": {"source": "ai_book"}}'
```

### 获取代理列表
```bash
curl http://localhost:3000/agents
```

## 🔧 核心依赖

```json
{
  "@mastra/core": "^0.10.8",
  "@mastra/rag": "^0.10.8", 
  "@mastra/pg": "^0.12.0",
  "@ai-sdk/deepseek": "^0.0.15",
  "ai": "^3.0.0",
  "express": "^4.18.0",
  "cors": "^2.8.0",
  "dotenv": "^16.0.0"
}
```

**重要改进**: 
- ✅ 完全移除了 `@ai-sdk/openai` 依赖
- ✅ 完全移除了 `@modelcontextprotocol/sdk` 依赖
- ✅ 使用纯 DeepSeek 生态系统

## 🆚 架构对比

### ❌ 之前的混合方案
```
Mastra + DeepSeek Chat + OpenAI Embedding + MCP
= 多个 AI 服务 + 额外依赖 + 混合成本
```

### ✅ 现在的纯净方案  
```
Mastra Core + Pure DeepSeek (Chat + Embedding)
= 单一 AI 服务 + 零冗余 + 统一成本
```

## 🎯 技术栈详情

- **框架**: Mastra Core
- **LLM**: DeepSeek Chat
- **嵌入模型**: DeepSeek Embedding  
- **向量数据库**: PostgreSQL + pgvector
- **Web 框架**: Express.js
- **无依赖**: OpenAI, MCP, 其他 AI 服务

## 💡 最佳实践

1. **统一模型源** - 全部使用 DeepSeek 生态，成本可控
2. **合理向量维度** - DeepSeek 嵌入通常使用 1024 维度
3. **错误处理** - 实现完善的重试机制
4. **避免冗余** - 不使用不必要的第三方 AI 服务

## 🔍 故障排除

### DeepSeek API 问题
- 确认 API 密钥正确
- 检查网络连接
- 验证模型名称 (deepseek-chat, deepseek-embedding)

### 向量数据库问题
- 确认 PostgreSQL 服务运行
- 检查 pgvector 扩展已安装
- 验证连接字符串格式

## 🤝 贡献

欢迎提交 Issues 和 Pull Requests！

## 📄 许可证

MIT License

---

**核心理念: 用最简洁的纯国产 AI 方式实现强大的 RAG 功能！** 🇨🇳🚀