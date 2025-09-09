const express = require('express');
const redis = require('redis');
const { Kafka } = require('kafkajs');
const { Pool } = require('pg');
const mongoose = require('mongoose');
const winston = require('winston');
const cron = require('node-cron');
require('dotenv').config();

const app = express();
const PORT = process.env.FEED_SERVICE_PORT || 3004;

// Logger setup
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/feed.log' })
  ]
});

// Database connections
const redisClient = redis.createClient({
  url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`
});

const pgPool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: process.env.POSTGRES_PORT || 5432,
  database: process.env.POSTGRES_DB || 'shareuptime',
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'password'
});

mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://shareuptime:shareuptime@shareuptime.mongodb.net/shareuptime?retryWrites=true&w=majority&appName=shareuptime')
.then(() => console.log('✅ MongoDB Atlas connected to shareuptime cluster'))
.catch(err => console.error('❌ MongoDB Atlas connection error:', err));

// Kafka setup
const kafka = new Kafka({
  clientId: 'feed-service',
  brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(',')
});

const consumer = kafka.consumer({ groupId: 'feed-service-group' });

// MongoDB Schema for cached feeds
const FeedSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  posts: [{
    postId: String,
    userId: String,
    content: String,
    mediaUrls: [String],
    hashtags: [String],
    mentions: [String],
    likesCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
    sharesCount: { type: Number, default: 0 },
    createdAt: Date,
    score: Number // relevance score for ranking
  }],
  lastUpdated: { type: Date, default: Date.now },
  version: { type: Number, default: 1 }
});

const Feed = mongoose.model('Feed', FeedSchema);

// Connect to Redis
redisClient.on('error', (err) => logger.error('Redis Client Error', err));
redisClient.connect();

// Middleware
app.use(express.json());

// Feed generation algorithms
class FeedGenerator {
  static async generatePersonalizedFeed(userId, limit = 20) {
    try {
      // Get user's following list from cache or database
      const followingKey = `following:${userId}`;
      let following = await redisClient.sMembers(followingKey);
      
      if (following.length === 0) {
        // Fallback to database query (this would typically call user-service)
        logger.info('Following list not cached, generating basic feed', { userId });
        return await this.generateBasicFeed(userId, limit);
      }

      // Get recent posts from followed users
      const posts = await this.getPostsFromFollowing(following, limit * 2);
      
      // Apply ranking algorithm
      const rankedPosts = await this.rankPosts(posts, userId);
      
      return rankedPosts.slice(0, limit);
    } catch (error) {
      logger.error('Error generating personalized feed:', error);
      return await this.generateBasicFeed(userId, limit);
    }
  }

  static async generateBasicFeed(userId, limit = 20) {
    // Fallback: get trending posts
    const trendingKey = 'trending:posts';
    const trendingPosts = await redisClient.zRevRange(trendingKey, 0, limit - 1, {
      WITHSCORES: true
    });

    const posts = [];
    for (let i = 0; i < trendingPosts.length; i += 2) {
      const postId = trendingPosts[i];
      const score = trendingPosts[i + 1];
      
      const postData = await redisClient.hGetAll(`post:${postId}`);
      if (postData.id) {
        posts.push({
          ...postData,
          score: parseFloat(score),
          mediaUrls: postData.mediaUrls ? JSON.parse(postData.mediaUrls) : [],
          hashtags: postData.hashtags ? JSON.parse(postData.hashtags) : [],
          mentions: postData.mentions ? JSON.parse(postData.mentions) : []
        });
      }
    }

    return posts;
  }

  static async getPostsFromFollowing(following, limit) {
    const posts = [];
    
    for (const followedUserId of following) {
      const userPostsKey = `user_posts:${followedUserId}`;
      const recentPosts = await redisClient.zRevRange(userPostsKey, 0, 5, {
        WITHSCORES: true
      });

      for (let i = 0; i < recentPosts.length; i += 2) {
        const postId = recentPosts[i];
        const timestamp = recentPosts[i + 1];
        
        const postData = await redisClient.hGetAll(`post:${postId}`);
        if (postData.id) {
          posts.push({
            ...postData,
            timestamp: parseFloat(timestamp),
            mediaUrls: postData.mediaUrls ? JSON.parse(postData.mediaUrls) : [],
            hashtags: postData.hashtags ? JSON.parse(postData.hashtags) : [],
            mentions: postData.mentions ? JSON.parse(postData.mentions) : []
          });
        }
      }
    }

    return posts.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
  }

  static async rankPosts(posts, userId) {
    // Simple ranking algorithm based on:
    // - Recency (newer posts get higher scores)
    // - Engagement (likes, comments, shares)
    // - User interaction history
    
    const now = Date.now();
    const rankedPosts = posts.map(post => {
      const ageHours = (now - new Date(post.createdAt).getTime()) / (1000 * 60 * 60);
      const recencyScore = Math.max(0, 100 - ageHours); // Decay over 100 hours
      
      const engagementScore = (
        (parseInt(post.likesCount) || 0) * 3 +
        (parseInt(post.commentsCount) || 0) * 5 +
        (parseInt(post.sharesCount) || 0) * 10
      );

      const totalScore = recencyScore + engagementScore;
      
      return {
        ...post,
        score: totalScore
      };
    });

    return rankedPosts.sort((a, b) => b.score - a.score);
  }

  static async updateUserFeedCache(userId) {
    try {
      const feed = await this.generatePersonalizedFeed(userId, 50);
      
      // Store in MongoDB for persistence
      await Feed.findOneAndUpdate(
        { userId },
        {
          userId,
          posts: feed,
          lastUpdated: new Date(),
          $inc: { version: 1 }
        },
        { upsert: true, new: true }
      );

      // Store in Redis for fast access
      const feedKey = `feed:${userId}`;
      await redisClient.setEx(feedKey, 3600, JSON.stringify(feed)); // 1 hour TTL

      logger.info('Feed cache updated', { userId, postsCount: feed.length });
    } catch (error) {
      logger.error('Error updating feed cache:', error);
    }
  }
}

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'feed-service' });
});

// Metrics endpoint for Prometheus
app.get('/metrics', (req, res) => {
  res.set('Content-Type', 'text/plain');
  res.send('# HELP feed_service_health Feed service health status\n# TYPE feed_service_health gauge\nfeed_service_health 1\n');
});

// Get user feed
app.get('/', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }

    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    // Try to get from Redis cache first
    const feedKey = `feed:${userId}`;
    const cachedFeed = await redisClient.get(feedKey);
    
    let feed;
    if (cachedFeed) {
      feed = JSON.parse(cachedFeed);
      logger.info('Feed served from cache', { userId });
    } else {
      // Generate fresh feed
      feed = await FeedGenerator.generatePersonalizedFeed(userId, 50);
      
      // Cache the result
      await redisClient.setEx(feedKey, 3600, JSON.stringify(feed));
      logger.info('Feed generated and cached', { userId });
    }

    // Paginate results
    const paginatedFeed = feed.slice(offset, offset + parseInt(limit));

    res.json({
      posts: paginatedFeed,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: feed.length,
        pages: Math.ceil(feed.length / limit)
      },
      cached: !!cachedFeed
    });
  } catch (error) {
    logger.error('Get feed error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get trending posts
app.get('/trending', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const trendingKey = 'trending:posts';
    const trendingPosts = await redisClient.zRevRange(
      trendingKey, 
      offset, 
      offset + parseInt(limit) - 1,
      { WITHSCORES: true }
    );

    const posts = [];
    for (let i = 0; i < trendingPosts.length; i += 2) {
      const postId = trendingPosts[i];
      const score = trendingPosts[i + 1];
      
      const postData = await redisClient.hGetAll(`post:${postId}`);
      if (postData.id) {
        posts.push({
          ...postData,
          trendingScore: parseFloat(score),
          mediaUrls: postData.mediaUrls ? JSON.parse(postData.mediaUrls) : [],
          hashtags: postData.hashtags ? JSON.parse(postData.hashtags) : [],
          mentions: postData.mentions ? JSON.parse(postData.mentions) : []
        });
      }
    }

    const total = await redisClient.zCard(trendingKey);

    res.json({
      posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Get trending error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Refresh user feed
app.post('/refresh', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }

    await FeedGenerator.updateUserFeedCache(userId);
    res.json({ message: 'Feed refreshed successfully' });
  } catch (error) {
    logger.error('Refresh feed error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Kafka event handlers
async function handlePostCreated(event) {
  const { id: postId, userId, hashtags, mentions } = event.data;
  
  try {
    // Cache post data
    const postKey = `post:${postId}`;
    await redisClient.hSet(postKey, {
      id: postId,
      userId,
      hashtags: JSON.stringify(hashtags || []),
      mentions: JSON.stringify(mentions || []),
      likesCount: '0',
      commentsCount: '0',
      sharesCount: '0',
      createdAt: event.timestamp
    });

    // Add to user's posts timeline
    const userPostsKey = `user_posts:${userId}`;
    const timestamp = new Date(event.timestamp).getTime();
    await redisClient.zAdd(userPostsKey, { score: timestamp, value: postId });

    // Add to trending if it has hashtags
    if (hashtags && hashtags.length > 0) {
      await redisClient.zAdd('trending:posts', { score: timestamp, value: postId });
    }

    // Invalidate feeds of followers (they would need fresh content)
    // This is a simplified approach - in production, you'd be more selective
    const followersKey = `followers:${userId}`;
    const followers = await redisClient.sMembers(followersKey);
    
    for (const followerId of followers) {
      await redisClient.del(`feed:${followerId}`);
    }

    logger.info('Post created event processed', { postId, userId });
  } catch (error) {
    logger.error('Error handling post created event:', error);
  }
}

async function handlePostUpdated(event) {
  const { id: postId, userId } = event.data;
  
  try {
    // Update post cache
    const postKey = `post:${postId}`;
    await redisClient.hSet(postKey, {
      updatedAt: event.timestamp
    });

    // Invalidate related feeds
    const followersKey = `followers:${userId}`;
    const followers = await redisClient.sMembers(followersKey);
    
    for (const followerId of followers) {
      await redisClient.del(`feed:${followerId}`);
    }

    logger.info('Post updated event processed', { postId, userId });
  } catch (error) {
    logger.error('Error handling post updated event:', error);
  }
}

async function handlePostDeleted(event) {
  const { id: postId, userId } = event.data;
  
  try {
    // Remove from caches
    await redisClient.del(`post:${postId}`);
    await redisClient.zRem(`user_posts:${userId}`, postId);
    await redisClient.zRem('trending:posts', postId);

    // Invalidate related feeds
    const followersKey = `followers:${userId}`;
    const followers = await redisClient.sMembers(followersKey);
    
    for (const followerId of followers) {
      await redisClient.del(`feed:${followerId}`);
    }

    logger.info('Post deleted event processed', { postId, userId });
  } catch (error) {
    logger.error('Error handling post deleted event:', error);
  }
}

// Start Kafka consumer
async function startKafkaConsumer() {
  try {
    await consumer.connect();
    await consumer.subscribe({ topic: 'post-events' });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const event = JSON.parse(message.value.toString());
        
        switch (event.eventType) {
          case 'POST_CREATED':
            await handlePostCreated(event);
            break;
          case 'POST_UPDATED':
            await handlePostUpdated(event);
            break;
          case 'POST_DELETED':
            await handlePostDeleted(event);
            break;
          default:
            logger.warn('Unknown event type:', event.eventType);
        }
      },
    });

    logger.info('Kafka consumer started');
  } catch (error) {
    logger.error('Kafka consumer error:', error);
  }
}

// Scheduled tasks
// Update trending posts every 15 minutes
cron.schedule('*/15 * * * *', async () => {
  try {
    logger.info('Updating trending posts...');
    
    // Get posts from last 24 hours with engagement scores
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    const posts = await redisClient.zRangeByScore('trending:posts', oneDayAgo, '+inf', {
      WITHSCORES: true
    });

    // Recalculate trending scores
    for (let i = 0; i < posts.length; i += 2) {
      const postId = posts[i];
      const postData = await redisClient.hGetAll(`post:${postId}`);
      
      if (postData.id) {
        const engagementScore = (
          (parseInt(postData.likesCount) || 0) * 3 +
          (parseInt(postData.commentsCount) || 0) * 5 +
          (parseInt(postData.sharesCount) || 0) * 10
        );
        
        const ageHours = (Date.now() - new Date(postData.createdAt).getTime()) / (1000 * 60 * 60);
        const recencyScore = Math.max(0, 100 - ageHours);
        
        const trendingScore = engagementScore + recencyScore;
        
        await redisClient.zAdd('trending:posts', { score: trendingScore, value: postId });
      }
    }

    logger.info('Trending posts updated');
  } catch (error) {
    logger.error('Error updating trending posts:', error);
  }
});

// Error handling
app.use((err, req, res, next) => {
  logger.error('Feed service error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Shutting down feed service...');
  await consumer.disconnect();
  await redisClient.quit();
  await pgPool.end();
  process.exit(0);
});

// Start services
startKafkaConsumer();

app.listen(PORT, () => {
  logger.info(`Feed service running on port ${PORT}`);
});
