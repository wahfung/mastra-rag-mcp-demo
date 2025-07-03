# Mastra RAG Demo with DeepSeek

一个使用 **Mastra 框架 + DeepSeek AI** 构建的 RAG (Retrieval-Augmented Generation) 演示项目，展示了如何用国产 AI 模型实现智能问答和文档管理。

## ✨ 技术亮点

**🇨🇳 国产 AI + 现代框架**

- 🤖 **DeepSeek AI** - 使用先进的国产大语言模型
- 🎯 **Pure Mastra** - 无冗余依赖，纯 Mastra 生态
- 🔧 **AI SDK 集成** - 基于 Vercel AI SDK 的统一接口
- 📦 **最小依赖** - 只包含必要的包
- 🚀 **开箱即用** - 简化配置，快速启动
- ❌ **零 MCP 依赖** - 完全移除 modelcontextprotocol

## 🚀 功能特性

- 🔍 **智能问答** - 基于文档知识库的 RAG 查询（DeepSeek 驱动）
- 📄 **文档管理** - 动态添加和索引文档  
- 💬 **直接对话** - 与 DeepSeek 模型直接交互
- 🛠️ **工具接口** - RESTful 工具调用 API
- 🌐 **Web 兼容** - 传统 HTTP 接口
- 📊 **向量搜索** - 高效的语义搜索

## 🏗️ 项目结构

```
mastra-rag-demo/
├── src/
│   ├── index.ts              # 主应用 (Mastra + DeepSeek)
│   └── setup-vectordb.ts     # 向量数据库初始化
├── package.json              # DeepSeek 依赖
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
DEEPSEEK_API_KEY=your_deepseek_api_key

# OpenAI 配置 (仅用于嵌入模型)
OPENAI_API_KEY=your_openai_api_key

# 向量数据库配置
VECTOR_DB_URL=your_vector_db_url

# 服务器配置
PORT=3000
```

### 4. 启动服务

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
  -d '{"message": "你好", "system": "友善的助手"}'
```

### 工具列表
```bash
curl http://localhost:3000/tools
```

## 🔧 核心依赖

```json
{
  "@mastra/core": "^0.1.0",
  "@mastra/rag": "^0.1.0", 
  "@mastra/vector-db": "^0.1.0",
  "@ai-sdk/deepseek": "^0.0.15",
  "ai": "^3.0.0",
  "express": "^4.18.0",
  "cors": "^2.8.0",
  "dotenv": "^16.0.0"
}
```

**注意**: 完全移除了 `@modelcontextprotocol/sdk` 依赖！

## 🆚 架构对比

### ❌ 之前的复杂方案
```
Mastra + 独立MCP服务器 + @modelcontextprotocol/sdk
= 多个服务 + 重复代码 + 额外依赖
```

### ✅ 现在的简洁方案  
```
Mastra Core + DeepSeek + Express
= 单一服务 + 零冗余 + 纯净实现
```

## 💡 最佳实践

1. **合理使用模型** - RAG 用 DeepSeek，嵌入用 OpenAI
2. **成本控制** - 设置合理的 token 限制
3. **错误处理** - 实现完善的重试机制
4. **避免冗余** - 不使用不必要的 MCP 依赖

## 🤝 贡献

欢迎提交 Issues 和 Pull Requests！

## 📄 许可证

MIT License

---

**核心理念: 用最简洁的方式实现强大的 RAG 功能！** 🇨🇳🚀