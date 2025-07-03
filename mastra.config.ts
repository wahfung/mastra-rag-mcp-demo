import { defineConfig } from '@mastra/core';

export default defineConfig({
  name: 'mastra-deepseek-rag',
  
  // 指向我们的 Mastra 实例
  mastraDir: './src/mastra',
  
  // 环境配置
  environments: {
    development: {
      env: {
        DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY,
        POSTGRES_CONNECTION_STRING: process.env.POSTGRES_CONNECTION_STRING,
      },
    },
    production: {
      env: {
        DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY,
        POSTGRES_CONNECTION_STRING: process.env.POSTGRES_CONNECTION_STRING,
      },
    },
  },
  
  // 数据库配置
  db: {
    provider: 'postgresql',
    url: process.env.POSTGRES_CONNECTION_STRING,
  },
  
  // 日志配置
  logging: {
    level: 'info',
    destination: 'console',
  },
});