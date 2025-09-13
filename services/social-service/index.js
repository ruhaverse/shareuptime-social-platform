const express = require('express');
const { Pool } = require('pg');
const redis = require('redis');
const { Kafka } = require('kafkajs');
const Joi = require('joi');
const winston = require('winston');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const PORT = process.env.SOCIAL_SERVICE_PORT || 3007;

// Logger setup
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/social.log' })
  ]
});

// Database connections
const pgPool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: process.env.POSTGRES_PORT || 5432,
  database: process.env.POSTGRES_DB || 'shareuptime',
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'password'
});

const redisClient = redis.createClient({
  url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`
});

redisClient.on('error', (err) => logger.error('Redis Client Error', err));
redisClient.connect();

// Kafka setup (optional for now)
let producer = null;
try {
  const kafka = new Kafka({
    clientId: 'social-service',
    brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(',')
  });
  producer = kafka.producer();
} catch (error) {
  logger.warn('Kafka not available, running without event publishing');
}

// Middleware
app.use(express.json());

// Validation schemas
const likeSchema = Joi.object({
  postId: Joi.string().required()
});

const commentSchema = Joi.object({
  postId: Joi.string().required(),
  content: Joi.string().min(1).max(1000).required(),
  parentCommentId: Joi.string().optional()
});

// Helper functions
const publishEvent = async (eventType, data) => {
  if (producer) {
    try {
      await producer.send({
        topic: 'social-events',
        messages: [{
          value: JSON.stringify({
            eventType,
            data
          })
        }]
      });
    } catch (kafkaError) {
      logger.error('Kafka publish error:', kafkaError);
    }
  }
};

// Initialize Kafka producer (if available)
if (producer) {
  producer.connect().catch(err => logger.error('Kafka producer connection failed:', err));
}

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'social-service' });
});

// Like a post
app.post('/like', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }

    const { error, value } = likeSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { postId } = value;

    // Check if already liked
    const existingLike = await pgPool.query(
      'SELECT id FROM likes WHERE user_id = $1 AND post_id = $2',
      [userId, postId]
    );

    if (existingLike.rows.length > 0) {
      return res.status(409).json({ error: 'Post already liked' });
    }

    // Add like
    await pgPool.query(
      'INSERT INTO likes (user_id, post_id, created_at) VALUES ($1, $2, NOW())',
      [userId, postId]
    );

    // Update post likes count
    const result = await pgPool.query(
      'UPDATE posts SET likes_count = likes_count + 1 WHERE id = $1 RETURNING likes_count',
      [postId]
    );

    const likesCount = result.rows[0]?.likes_count || 0;

    // Cache like status
    await redisClient.setEx(`like:${userId}:${postId}`, 3600, '1');

    // Publish event
    await publishEvent('POST_LIKED', {
      postId,
      userId,
      likesCount
    });

    logger.info('Post liked', { postId, userId });

    res.json({
      message: 'Post liked successfully',
      likesCount
    });
  } catch (error) {
    logger.error('Like post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Unlike a post
app.delete('/like', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }

    const { error, value } = likeSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { postId } = value;

    // Remove like
    const deleteResult = await pgPool.query(
      'DELETE FROM likes WHERE user_id = $1 AND post_id = $2 RETURNING id',
      [userId, postId]
    );

    if (deleteResult.rows.length === 0) {
      return res.status(404).json({ error: 'Like not found' });
    }

    // Update post likes count
    const result = await pgPool.query(
      'UPDATE posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = $1 RETURNING likes_count',
      [postId]
    );

    const likesCount = result.rows[0]?.likes_count || 0;

    // Remove from cache
    await redisClient.del(`like:${userId}:${postId}`);

    // Publish event
    await publishEvent('POST_UNLIKED', {
      postId,
      userId,
      likesCount
    });

    logger.info('Post unliked', { postId, userId });

    res.json({
      message: 'Post unliked successfully',
      likesCount
    });
  } catch (error) {
    logger.error('Unlike post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get post likes
app.get('/likes/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const offset = (page - 1) * limit;

    const result = await pgPool.query(
      `SELECT l.created_at, u.id, u.username, u.first_name, u.last_name, u.avatar_url
       FROM likes l
       JOIN users u ON l.user_id = u.id
       WHERE l.post_id = $1
       ORDER BY l.created_at DESC
       LIMIT $2 OFFSET $3`,
      [postId, limit, offset]
    );

    const countResult = await pgPool.query(
      'SELECT COUNT(*) as total FROM likes WHERE post_id = $1',
      [postId]
    );

    const total = parseInt(countResult.rows[0].total);

    res.json({
      likes: result.rows.map(row => ({
        userId: row.id,
        username: row.username,
        firstName: row.first_name,
        lastName: row.last_name,
        avatarUrl: row.avatar_url,
        createdAt: row.created_at
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Get likes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add comment
app.post('/comment', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }

    const { error, value } = commentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { postId, content, parentCommentId } = value;

    // Add comment
    const result = await pgPool.query(
      `INSERT INTO comments (user_id, post_id, content, created_at, updated_at)
       VALUES ($1, $2, $3, NOW(), NOW())
       RETURNING id, created_at`,
      [userId, postId, content]
    );

    const comment = result.rows[0];

    // Update post comments count
    const countResult = await pgPool.query(
      'UPDATE posts SET comments_count = comments_count + 1 WHERE id = $1 RETURNING comments_count',
      [postId]
    );

    const commentsCount = countResult.rows[0]?.comments_count || 0;

    // Get user info for response
    const userResult = await pgPool.query(
      'SELECT username, first_name, last_name, avatar_url FROM users WHERE id = $1',
      [userId]
    );

    const user = userResult.rows[0];

    // Publish event
    await publishEvent('COMMENT_ADDED', {
      commentId: comment.id,
      postId,
      userId,
      content,
      commentsCount
    });

    logger.info('Comment added', { commentId: comment.id, postId, userId });

    res.status(201).json({
      id: comment.id,
      postId,
      userId,
      content,
      user: {
        username: user.username,
        firstName: user.first_name,
        lastName: user.last_name,
        avatarUrl: user.avatar_url
      },
      createdAt: comment.created_at,
      commentsCount
    });
  } catch (error) {
    logger.error('Add comment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get post comments
app.get('/comments/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const offset = (page - 1) * limit;

    const result = await pgPool.query(
      `SELECT c.id, c.content, c.likes_count, c.created_at, c.updated_at,
              u.id as user_id, u.username, u.first_name, u.last_name, u.avatar_url
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.post_id = $1
       ORDER BY c.created_at ASC
       LIMIT $2 OFFSET $3`,
      [postId, limit, offset]
    );

    const countResult = await pgPool.query(
      'SELECT COUNT(*) as total FROM comments WHERE post_id = $1',
      [postId]
    );

    const total = parseInt(countResult.rows[0].total);

    res.json({
      comments: result.rows.map(row => ({
        id: row.id,
        content: row.content,
        likesCount: row.likes_count,
        user: {
          id: row.user_id,
          username: row.username,
          firstName: row.first_name,
          lastName: row.last_name,
          avatarUrl: row.avatar_url
        },
        createdAt: row.created_at,
        updatedAt: row.updated_at
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Get comments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete comment
app.delete('/comment/:commentId', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const { commentId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }

    // Check if comment exists and belongs to user
    const commentResult = await pgPool.query(
      'SELECT post_id FROM comments WHERE id = $1 AND user_id = $2',
      [commentId, userId]
    );

    if (commentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Comment not found or not authorized' });
    }

    const postId = commentResult.rows[0].post_id;

    // Delete comment
    await pgPool.query('DELETE FROM comments WHERE id = $1', [commentId]);

    // Update post comments count
    const countResult = await pgPool.query(
      'UPDATE posts SET comments_count = GREATEST(comments_count - 1, 0) WHERE id = $1 RETURNING comments_count',
      [postId]
    );

    const commentsCount = countResult.rows[0]?.comments_count || 0;

    // Publish event
    await publishEvent('COMMENT_DELETED', {
      commentId,
      postId,
      userId,
      commentsCount
    });

    logger.info('Comment deleted', { commentId, postId, userId });

    res.json({
      message: 'Comment deleted successfully',
      commentsCount
    });
  } catch (error) {
    logger.error('Delete comment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Check if user liked a post
app.get('/like-status/:postId', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const { postId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }

    // Check cache first
    const cached = await redisClient.get(`like:${userId}:${postId}`);
    if (cached) {
      return res.json({ liked: true });
    }

    // Check database
    const result = await pgPool.query(
      'SELECT id FROM likes WHERE user_id = $1 AND post_id = $2',
      [userId, postId]
    );

    const liked = result.rows.length > 0;

    // Cache result
    if (liked) {
      await redisClient.setEx(`like:${userId}:${postId}`, 3600, '1');
    }

    res.json({ liked });
  } catch (error) {
    logger.error('Check like status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Error handling
app.use((err, req, res, next) => {
  logger.error('Social service error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Shutting down social service...');
  await producer.disconnect();
  await redisClient.quit();
  await pgPool.end();
  process.exit(0);
});

app.listen(PORT, () => {
  logger.info(`Social service running on port ${PORT}`);
});
