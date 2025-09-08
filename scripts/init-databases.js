const { Pool } = require('pg');
const mongoose = require('mongoose');
const neo4j = require('neo4j-driver');
const redis = require('redis');
const { Client } = require('minio');
require('dotenv').config();

const logger = {
  info: (msg, data) => console.log(`[INFO] ${msg}`, data || ''),
  error: (msg, error) => console.error(`[ERROR] ${msg}`, error || ''),
  warn: (msg, data) => console.warn(`[WARN] ${msg}`, data || '')
};

async function initPostgreSQL() {
  const pool = new Pool({
    host: process.env.POSTGRES_HOST || 'localhost',
    port: process.env.POSTGRES_PORT || 5432,
    database: process.env.POSTGRES_DB || 'shareuptime',
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'password'
  });

  try {
    await pool.query('SELECT NOW()');
    logger.info('PostgreSQL connection successful');
    
    // Test if tables exist
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'users'
    `);
    
    if (result.rows.length > 0) {
      logger.info('PostgreSQL tables already exist');
    } else {
      logger.warn('PostgreSQL tables not found - run init scripts manually');
    }
    
  } catch (error) {
    logger.error('PostgreSQL initialization failed:', error.message);
  } finally {
    await pool.end();
  }
}

async function initMongoDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shareuptime');
    logger.info('MongoDB connection successful');
    
    // Create indexes
    const db = mongoose.connection.db;
    
    // Posts collection indexes
    await db.collection('posts').createIndex({ userId: 1 });
    await db.collection('posts').createIndex({ createdAt: -1 });
    await db.collection('posts').createIndex({ hashtags: 1 });
    await db.collection('posts').createIndex({ mentions: 1 });
    
    // Feeds collection indexes
    await db.collection('feeds').createIndex({ userId: 1 }, { unique: true });
    await db.collection('feeds').createIndex({ lastUpdated: -1 });
    
    logger.info('MongoDB indexes created');
    
  } catch (error) {
    logger.error('MongoDB initialization failed:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

async function initNeo4j() {
  const driver = neo4j.driver(
    process.env.NEO4J_URI || 'bolt://localhost:7687',
    neo4j.auth.basic(
      process.env.NEO4J_USERNAME || 'neo4j',
      process.env.NEO4J_PASSWORD || 'password'
    )
  );

  const session = driver.session();
  
  try {
    await session.run('RETURN 1');
    logger.info('Neo4j connection successful');
    
    // Create constraints and indexes
    await session.run('CREATE CONSTRAINT user_id_unique IF NOT EXISTS FOR (u:User) REQUIRE u.id IS UNIQUE');
    await session.run('CREATE INDEX user_username IF NOT EXISTS FOR (u:User) ON (u.username)');
    await session.run('CREATE INDEX follows_created IF NOT EXISTS FOR ()-[r:FOLLOWS]-() ON (r.createdAt)');
    
    logger.info('Neo4j constraints and indexes created');
    
  } catch (error) {
    logger.error('Neo4j initialization failed:', error.message);
  } finally {
    await session.close();
    await driver.close();
  }
}

async function initRedis() {
  const client = redis.createClient({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379
  });

  try {
    await client.connect();
    await client.ping();
    logger.info('Redis connection successful');
    
    // Set some initial data
    await client.set('app:initialized', new Date().toISOString());
    
  } catch (error) {
    logger.error('Redis initialization failed:', error.message);
  } finally {
    await client.quit();
  }
}

async function initMinIO() {
  const minioClient = new Client({
    endPoint: process.env.MINIO_ENDPOINT || 'localhost',
    port: parseInt(process.env.MINIO_PORT) || 9000,
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
    secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin'
  });

  const bucketName = process.env.MINIO_BUCKET_NAME || 'shareuptime-media';

  try {
    const exists = await minioClient.bucketExists(bucketName);
    if (!exists) {
      await minioClient.makeBucket(bucketName, 'us-east-1');
      logger.info(`MinIO bucket '${bucketName}' created`);
    } else {
      logger.info(`MinIO bucket '${bucketName}' already exists`);
    }
    
    // Set bucket policy to allow public read access for media files
    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: { AWS: ['*'] },
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${bucketName}/*`]
        }
      ]
    };
    
    await minioClient.setBucketPolicy(bucketName, JSON.stringify(policy));
    logger.info('MinIO bucket policy set');
    
  } catch (error) {
    logger.error('MinIO initialization failed:', error.message);
  }
}

async function main() {
  logger.info('Starting database initialization...');
  
  await initPostgreSQL();
  await initMongoDB();
  await initNeo4j();
  await initRedis();
  await initMinIO();
  
  logger.info('Database initialization completed');
}

if (require.main === module) {
  main().catch(error => {
    logger.error('Initialization failed:', error);
    process.exit(1);
  });
}

module.exports = { main };
