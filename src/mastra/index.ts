import { Mastra } from '@mastra/core';
import { Agent } from '@mastra/core/agent';
import { createVectorQueryTool } from '@mastra/rag';
import { PgVector } from '@mastra/pg';
import { deepseek } from '@ai-sdk/deepseek';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// 设置向量数据库
const pgVector = new PgVector({
  connectionString: process.env.POSTGRES_CONNECTION_STRING || 'postgresql://localhost:5432/mastra'
});

// 创建向量查询工具（使用 DeepSeek 嵌入）
const vectorQueryTool = createVectorQueryTool({
  vectorStoreName: 'pgVector',
  indexName: 'embeddings',
  model: deepseek.embedding('deepseek-embedding'), // 使用 DeepSeek 嵌入模型
});

// 创建 RAG Agent（使用 DeepSeek）
const ragAgent = new Agent({
  name: 'RAG Agent',
  instructions: `你是一个有用的AI助手，能够基于提供的上下文信息回答问题。
  请保持回答简洁、准确和相关。
  如果上下文中没有足够的信息来完全回答问题，请明确说明。`,
  model: deepseek('deepseek-chat'), // 使用 DeepSeek 作为主要模型
  tools: {
    vectorQueryTool,
  },
});

// 创建直接 DeepSeek 对话 Agent
const chatAgent = new Agent({
  name: 'Chat Agent',
  instructions: '你是一个友善、有用的AI助手。请用简洁、准确的方式回答问题。',
  model: deepseek('deepseek-chat'),
});

// 创建 Mastra 实例
const mastra = new Mastra({
  agents: {
    ragAgent,
    chatAgent,
  },
  vectors: {
    pgVector,
  },
});

// 导出所有需要的内容
export { mastra, ragAgent, chatAgent, pgVector };

// 默认导出 Mastra 实例（Mastra CLI 期望的格式）
export default mastra;