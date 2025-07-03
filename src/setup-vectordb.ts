import { PgVector } from '@mastra/pg';
import dotenv from 'dotenv';

dotenv.config();

async function setupVectorDB() {
  console.log('🔧 设置 PostgreSQL + pgvector 数据库...');
  console.log('🤖 配置: Mastra + DeepSeek AI + PostgreSQL');
  
  try {
    // 检查必要的环境变量
    if (!process.env.POSTGRES_CONNECTION_STRING) {
      throw new Error('POSTGRES_CONNECTION_STRING 环境变量未设置');
    }

    const pgVector = new PgVector({
      connectionString: process.env.POSTGRES_CONNECTION_STRING
    });

    console.log('✅ 正在连接到 PostgreSQL...');
    
    // 创建索引
    await pgVector.createIndex({
      indexName: 'embeddings',
      dimension: 1536, // OpenAI text-embedding-3-small 维度
    });

    console.log('✅ 向量数据库设置完成');
    console.log('📊 索引名称: embeddings');
    console.log('📐 嵌入维度: 1536 (OpenAI text-embedding-3-small)');
    console.log('🤖 LLM 模型: DeepSeek Chat');
    console.log('🗄️ 向量数据库: PostgreSQL + pgvector');
    console.log('🔧 框架: Mastra');
    
    // 断开连接
    await pgVector.disconnect();
    console.log('✅ 数据库连接已关闭');
    
  } catch (error) {
    console.error('❌ 向量数据库设置失败:', error);
    console.log('\n🔍 故障排除提示:');
    console.log('1. 检查 POSTGRES_CONNECTION_STRING 环境变量');
    console.log('   格式: postgresql://user:password@host:port/database');
    console.log('2. 确认 PostgreSQL 服务运行正常');
    console.log('3. 确认已安装 pgvector 扩展:');
    console.log('   CREATE EXTENSION IF NOT EXISTS vector;');
    console.log('4. 验证网络连接和数据库权限');
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  setupVectorDB();
}

export { setupVectorDB };