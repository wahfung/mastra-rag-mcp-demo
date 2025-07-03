import { VectorDB } from '@mastra/vector-db';
import dotenv from 'dotenv';

dotenv.config();

async function setupVectorDB() {
  console.log('🔧 设置向量数据库...');
  console.log('🤖 配置: Mastra + DeepSeek AI');
  
  try {
    const vectorDB = new VectorDB({
      provider: 'pinecone',
      config: {
        url: process.env.VECTOR_DB_URL
      }
    });

    await vectorDB.initialize();
    console.log('✅ 向量数据库连接成功');
    
    // 创建索引
    await vectorDB.createIndex({
      name: 'mastra-rag-deepseek-demo',
      dimension: 1536, // OpenAI text-embedding-3-small 维度
      metric: 'cosine',
      metadata: {
        description: 'Mastra RAG Demo with DeepSeek AI',
        created: new Date().toISOString(),
        llm: 'deepseek-chat',
        embedder: 'text-embedding-3-small'
      }
    });

    console.log('✅ 向量数据库索引创建完成');
    console.log('📊 索引名称: mastra-rag-deepseek-demo');
    console.log('📐 嵌入维度: 1536 (OpenAI)');
    console.log('🤖 LLM 模型: DeepSeek Chat');
    console.log('🎯 距离度量: cosine');
    
  } catch (error) {
    console.error('❌ 向量数据库设置失败:', error);
    console.log('\n🔍 故障排除提示:');
    console.log('1. 检查 VECTOR_DB_URL 环境变量');
    console.log('2. 确认向量数据库服务运行正常');
    console.log('3. 验证网络连接');
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  setupVectorDB();
}

export { setupVectorDB };