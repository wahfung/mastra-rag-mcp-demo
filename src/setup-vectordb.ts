import { VectorDB } from '@mastra/vector-db';
import dotenv from 'dotenv';

dotenv.config();

async function setupVectorDB() {
  console.log('🔧 设置向量数据库...');
  
  try {
    const vectorDB = new VectorDB({
      provider: 'pinecone',
      config: {
        url: process.env.VECTOR_DB_URL
      }
    });

    await vectorDB.initialize();
    
    // 创建索引
    await vectorDB.createIndex({
      name: 'mastra-rag-demo',
      dimension: 1536, // OpenAI embeddings 维度
      metric: 'cosine'
    });

    console.log('✅ 向量数据库设置完成');
  } catch (error) {
    console.error('❌ 向量数据库设置失败:', error);
    process.exit(1);
  }
}

setupVectorDB();