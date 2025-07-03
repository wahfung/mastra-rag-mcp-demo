# Mastra RAG MCP Demo

这是一个使用 Mastra 框架结合 RAG (Retrieval-Augmented Generation) 和 MCP (Model Context Protocol) 的演示项目。

## 功能特性

- 🔍 **RAG 查询**: 基于文档知识库的智能问答
- 📄 **文档管理**: 动态添加和管理文档
- 🔌 **MCP 集成**: 支持 Model Context Protocol
- 🚀 **RESTful API**: 提供完整的 HTTP 接口
- 📊 **向量搜索**: 高效的语义搜索能力

## 快速开始

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

复制 `.env.example` 到 `.env` 并配置：

```env
OPENAI_API_KEY=your_openai_api_key
VECTOR_DB_URL=your_vector_db_url
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

## API 使用

### 健康检查

```bash
curl http://localhost:3000/health
```

### 查询知识库

```bash
curl -X POST http://localhost:3000/query \
  -H "Content-Type: application/json" \
  -d '{"question": "什么是人工智能?"}'
```

### 添加文档

```bash
curl -X POST http://localhost:3000/documents \
  -H "Content-Type: application/json" \
  -d '{
    "content": "人工智能是计算机科学的一个分支...",
    "metadata": {"title": "AI介绍", "author": "Demo"}
  }'
```

## MCP 集成

该项目实现了 MCP 协议，支持：

- `rag_query`: RAG 查询工具
- `add_document`: 文档添加工具

## 架构说明

- **Mastra Core**: 核心框架
- **RAG Engine**: 检索增强生成引擎
- **Vector DB**: 向量数据库接口
- **MCP Server**: Model Context Protocol 服务器

## 扩展功能

- 支持多种文档格式
- 批量文档处理
- 实时索引更新
- 查询结果缓存
- 权限控制

## 许可证

MIT License