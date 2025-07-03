import { Mastra } from '@mastra/core';
import { Agent } from '@mastra/core/agent';
import { createVectorQueryTool } from '@mastra/rag';
import { PgVector } from '@mastra/pg';
import { deepseek } from '@ai-sdk/deepseek';

// 环境变量检查
const connectionString = process.env.POSTGRES_CONNECTION_STRING || 'postgresql://localhost:5432/mastra';
const deepseekApiKey = process.env.DEEPSEEK_API_KEY;

if (!deepseekApiKey) {
  console.warn('警告: DEEPSEEK_API_KEY 环境变量未设置');
}

// 设置向量数据库
const pgVector = new PgVector({
  connectionString
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

// 创建并导出 Mastra 实例
const mastra = new Mastra({
  agents: {
    ragAgent,
    chatAgent,
  },
  vectors: {
    pgVector,
  },
});

// CommonJS 兼容的导出
module.exports = mastra;
module.exports.mastra = mastra;
module.exports.ragAgent = ragAgent;
module.exports.chatAgent = chatAgent;
module.exports.pgVector = pgVector;
module.exports.default = mastra;

// ES6 模块导出
export { ragAgent, chatAgent, pgVector };
export default mastra;
export const exportedMastra = mastra;