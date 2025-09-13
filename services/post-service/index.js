const express = require('express');
const mongoose = require('mongoose');
const { Pool } = require('pg');
const { Kafka } = require('kafkajs');
const Joi = require('joi');
const winston = require('winston');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const PORT = process.env.POST_SERVICE_PORT || 3003;

// Logger setup
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/post.log' })
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

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shareuptime')
.then(() => console.log('✅ MongoDB Atlas connected to shareuptime cluster'))
.catch(err => console.error('❌ MongoDB Atlas connection error:', err));

// Kafka setup
const kafka = new Kafka({
  clientId: 'post-service',
  brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(',')
});

const producer = kafka.producer();

// MongoDB Schema
const PostSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  content: { type: String, required: true },
  mediaUrls: [String],
  hashtags: [String],
  mentions: [String],
  location: {
    latitude: Number,
    longitude: Number,
    name: String
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Post = mongoose.model('Post', PostSchema);

// Middleware
app.use(express.json());

// Validation schemas
const createPostSchema = Joi.object({
  content: Joi.string().min(1).max(2000).required(),
  mediaUrls: Joi.array().items(Joi.string().uri()).optional(),
  hashtags: Joi.array().items(Joi.string().pattern(/^[a-zA-Z0-9_]+$/)).optional(),
  mentions: Joi.array().items(Joi.string()).optional(),
  location: Joi.object({
    latitude: Joi.number().min(-90).max(90),
    longitude: Joi.number().min(-180).max(180),
    name: Joi.string().max(100)
  }).optional()
});

const updatePostSchema = Joi.object({
  content: Joi.string().min(1).max(2000).optional(),
  hashtags: Joi.array().items(Joi.string().pattern(/^[a-zA-Z0-9_]+$/)).optional(),
  mentions: Joi.array().items(Joi.string()).optional()
});

// Helper functions
const extractHashtags = (content) => {
  const hashtags = content.match(/#[a-zA-Z0-9_]+/g);
  return hashtags ? hashtags.map(tag => tag.substring(1)) : [];
};

const extractMentions = (content) => {
  const mentions = content.match(/@[a-zA-Z0-9_]+/g);
  return mentions ? mentions.map(mention => mention.substring(1)) : [];
};

const publishEvent = async (eventType, data) => {
  try {
    await producer.send({
      topic: 'post-events',
      messages: [{
        key: data.id,
        value: JSON.stringify({
          eventType,
          timestamp: new Date().toISOString(),
          data
        })
      }]
    });
  } catch (error) {
    logger.error('Failed to publish event:', error);
  }
};

// Initialize Kafka producer
producer.connect().catch(err => logger.error('Kafka producer connection failed:', err));

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'post-service' });
});

// Create post
app.post('/', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }

    const { error, value } = createPostSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const postId = uuidv4();
    const { content, mediaUrls = [], location } = value;

    // Extract hashtags and mentions from content
    const hashtags = [...new Set([...extractHashtags(content), ...(value.hashtags || [])])];
    const mentions = [...new Set([...extractMentions(content), ...(value.mentions || [])])];

    // Save to MongoDB
    const post = new Post({
      id: postId,
      userId,
      content,
      mediaUrls,
      hashtags,
      mentions,
      location
    });

    await post.save();

    // Save metadata to PostgreSQL
    await pgPool.query(
      `INSERT INTO posts (id, user_id, content_length, media_count, hashtag_count, 
       mention_count, has_location, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
      [
        postId,
        userId,
        content.length,
        mediaUrls.length,
        hashtags.length,
        mentions.length,
        !!location
      ]
    );

    // Publish event
    await publishEvent('POST_CREATED', {
      id: postId,
      userId,
      hashtags,
      mentions,
      hasMedia: mediaUrls.length > 0
    });

    logger.info('Post created', { postId, userId });

    res.status(201).json({
      id: postId,
      userId,
      content,
      mediaUrls,
      hashtags,
      mentions,
      location,
      createdAt: post.createdAt
    });
  } catch (error) {
    logger.error('Create post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get post
app.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findOne({ id });
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Get additional metadata from PostgreSQL
    const metaResult = await pgPool.query(
      'SELECT likes_count, comments_count, shares_count FROM posts WHERE id = $1',
      [id]
    );

    const metadata = metaResult.rows[0] || {};

    res.json({
      id: post.id,
      userId: post.userId,
      content: post.content,
      mediaUrls: post.mediaUrls,
      hashtags: post.hashtags,
      mentions: post.mentions,
      location: post.location,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      likesCount: metadata.likes_count || 0,
      commentsCount: metadata.comments_count || 0,
      sharesCount: metadata.shares_count || 0
    });
  } catch (error) {
    logger.error('Get post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update post
app.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.headers['x-user-id'];

    const { error, value } = updatePostSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const post = await Post.findOne({ id });
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to update this post' });
    }

    const updateData = { ...value, updatedAt: new Date() };

    // Update hashtags and mentions if content changed
    if (value.content) {
      updateData.hashtags = [...new Set([...extractHashtags(value.content), ...(value.hashtags || [])])];
      updateData.mentions = [...new Set([...extractMentions(value.content), ...(value.mentions || [])])];
    }

    const updatedPost = await Post.findOneAndUpdate({ id }, updateData, { new: true });

    // Update PostgreSQL metadata
    if (value.content) {
      await pgPool.query(
        'UPDATE posts SET content_length = $1, updated_at = NOW() WHERE id = $2',
        [value.content.length, id]
      );
    }

    // Publish event
    await publishEvent('POST_UPDATED', {
      id,
      userId,
      changes: Object.keys(value)
    });

    logger.info('Post updated', { postId: id, userId });

    res.json({
      id: updatedPost.id,
      userId: updatedPost.userId,
      content: updatedPost.content,
      mediaUrls: updatedPost.mediaUrls,
      hashtags: updatedPost.hashtags,
      mentions: updatedPost.mentions,
      location: updatedPost.location,
      createdAt: updatedPost.createdAt,
      updatedAt: updatedPost.updatedAt
    });
  } catch (error) {
    logger.error('Update post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete post
app.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.headers['x-user-id'];

    const post = await Post.findOne({ id });
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this post' });
    }

    // Delete from MongoDB
    await Post.deleteOne({ id });

    // Delete from PostgreSQL
    await pgPool.query('DELETE FROM posts WHERE id = $1', [id]);

    // Publish event
    await publishEvent('POST_DELETED', {
      id,
      userId
    });

    logger.info('Post deleted', { postId: id, userId });

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    logger.error('Delete post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user posts
app.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const skip = (page - 1) * limit;
    const posts = await Post.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Post.countDocuments({ userId });

    res.json({
      posts: posts.map(post => ({
        id: post.id,
        userId: post.userId,
        content: post.content,
        mediaUrls: post.mediaUrls,
        hashtags: post.hashtags,
        mentions: post.mentions,
        location: post.location,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Get user posts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Search posts by hashtag
app.get('/hashtag/:hashtag', async (req, res) => {
  try {
    const { hashtag } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const skip = (page - 1) * limit;
    const posts = await Post.find({ hashtags: hashtag })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Post.countDocuments({ hashtags: hashtag });

    res.json({
      hashtag,
      posts: posts.map(post => ({
        id: post.id,
        userId: post.userId,
        content: post.content,
        mediaUrls: post.mediaUrls,
        hashtags: post.hashtags,
        mentions: post.mentions,
        location: post.location,
        createdAt: post.createdAt
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Search hashtag error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Error handling
app.use((err, req, res, next) => {
  logger.error('Post service error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  logger.info(`Post service running on port ${PORT}`);
});
