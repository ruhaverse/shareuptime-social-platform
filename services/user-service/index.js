const express = require('express');
const neo4j = require('neo4j-driver');
const { Pool } = require('pg');
const Joi = require('joi');
const winston = require('winston');
require('dotenv').config();

const app = express();
const PORT = process.env.USER_SERVICE_PORT || 3002;

// Logger setup
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/user.log' })
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

const neo4jDriver = neo4j.driver(
  process.env.NEO4J_URI || 'bolt://localhost:7687',
  neo4j.auth.basic(
    process.env.NEO4J_USERNAME || 'neo4j',
    process.env.NEO4J_PASSWORD || 'password'
  )
);

// Middleware
app.use(express.json());

// Validation schemas
const updateProfileSchema = Joi.object({
  firstName: Joi.string().min(1).max(50).optional(),
  lastName: Joi.string().min(1).max(50).optional(),
  bio: Joi.string().max(500).optional(),
  avatarUrl: Joi.string().uri().optional()
});

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'user-service' });
});

// Get user profile
app.get('/profile/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const requesterId = req.headers['x-user-id'];

    // Get user data from PostgreSQL
    const userResult = await pgPool.query(
      `SELECT id, email, username, first_name, last_name, bio, avatar_url, 
       is_verified, created_at FROM users WHERE id = $1 AND is_active = true`,
      [id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    // Get social stats from Neo4j
    const session = neo4jDriver.session();
    try {
      const result = await session.run(
        `MATCH (u:User {id: $userId})
         OPTIONAL MATCH (u)-[:FOLLOWS]->(following:User)
         OPTIONAL MATCH (follower:User)-[:FOLLOWS]->(u)
         OPTIONAL MATCH (u)-[:FRIENDS_WITH]-(friend:User)
         RETURN 
           count(DISTINCT following) as followingCount,
           count(DISTINCT follower) as followersCount,
           count(DISTINCT friend) as friendsCount`,
        { userId: id }
      );

      const stats = result.records[0];
      const followingCount = stats.get('followingCount').toNumber();
      const followersCount = stats.get('followersCount').toNumber();
      const friendsCount = stats.get('friendsCount').toNumber();

      // Check if requester follows this user
      let isFollowing = false;
      if (requesterId && requesterId !== id) {
        const followResult = await session.run(
          `MATCH (requester:User {id: $requesterId})-[:FOLLOWS]->(user:User {id: $userId})
           RETURN count(*) as isFollowing`,
          { requesterId, userId: id }
        );
        isFollowing = followResult.records[0].get('isFollowing').toNumber() > 0;
      }

      res.json({
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.first_name,
        lastName: user.last_name,
        bio: user.bio,
        avatarUrl: user.avatar_url,
        isVerified: user.is_verified,
        createdAt: user.created_at,
        stats: {
          followersCount,
          followingCount,
          friendsCount
        },
        isFollowing
      });
    } finally {
      await session.close();
    }
  } catch (error) {
    logger.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user profile
app.put('/profile', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }

    const { error, value } = updateProfileSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const updates = [];
    const values = [];
    let paramIndex = 1;

    Object.entries(value).forEach(([key, val]) => {
      const dbColumn = key === 'firstName' ? 'first_name' : 
                      key === 'lastName' ? 'last_name' :
                      key === 'avatarUrl' ? 'avatar_url' : key;
      updates.push(`${dbColumn} = $${paramIndex}`);
      values.push(val);
      paramIndex++;
    });

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    values.push(userId);
    const query = `UPDATE users SET ${updates.join(', ')}, updated_at = NOW() 
                   WHERE id = $${paramIndex} RETURNING *`;

    const result = await pgPool.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    logger.info('Profile updated', { userId });

    res.json({
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.first_name,
      lastName: user.last_name,
      bio: user.bio,
      avatarUrl: user.avatar_url,
      isVerified: user.is_verified
    });
  } catch (error) {
    logger.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Follow user
app.post('/follow/:id', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const { id: targetUserId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }

    if (userId === targetUserId) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }

    // Check if target user exists
    const userCheck = await pgPool.query(
      'SELECT id FROM users WHERE id = $1 AND is_active = true',
      [targetUserId]
    );

    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const session = neo4jDriver.session();
    try {
      // Create or update follow relationship
      await session.run(
        `MERGE (follower:User {id: $followerId})
         MERGE (following:User {id: $followingId})
         MERGE (follower)-[r:FOLLOWS]->(following)
         ON CREATE SET r.createdAt = datetime()
         RETURN r`,
        { followerId: userId, followingId: targetUserId }
      );

      logger.info('User followed', { followerId: userId, followingId: targetUserId });
      res.json({ message: 'User followed successfully' });
    } finally {
      await session.close();
    }
  } catch (error) {
    logger.error('Follow user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Unfollow user
app.delete('/unfollow/:id', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const { id: targetUserId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }

    const session = neo4jDriver.session();
    try {
      const result = await session.run(
        `MATCH (follower:User {id: $followerId})-[r:FOLLOWS]->(following:User {id: $followingId})
         DELETE r
         RETURN count(r) as deletedCount`,
        { followerId: userId, followingId: targetUserId }
      );

      const deletedCount = result.records[0].get('deletedCount').toNumber();
      
      if (deletedCount === 0) {
        return res.status(404).json({ error: 'Follow relationship not found' });
      }

      logger.info('User unfollowed', { followerId: userId, followingId: targetUserId });
      res.json({ message: 'User unfollowed successfully' });
    } finally {
      await session.close();
    }
  } catch (error) {
    logger.error('Unfollow user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get followers
app.get('/followers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const skip = (page - 1) * limit;
    
    const session = neo4jDriver.session();
    try {
      const result = await session.run(
        `MATCH (follower:User)-[:FOLLOWS]->(user:User {id: $userId})
         RETURN follower.id as id
         ORDER BY follower.id
         SKIP $skip LIMIT $limit`,
        { userId: id, skip: neo4j.int(skip), limit: neo4j.int(limit) }
      );

      const followerIds = result.records.map(record => record.get('id'));
      
      if (followerIds.length === 0) {
        return res.json({ followers: [], pagination: { page: parseInt(page), limit: parseInt(limit), total: 0, pages: 0 } });
      }

      // Get user details from PostgreSQL
      const placeholders = followerIds.map((_, i) => `$${i + 1}`).join(',');
      const usersResult = await pgPool.query(
        `SELECT id, username, first_name, last_name, avatar_url, is_verified 
         FROM users WHERE id IN (${placeholders}) AND is_active = true`,
        followerIds
      );

      // Get total count
      const countResult = await session.run(
        `MATCH (follower:User)-[:FOLLOWS]->(user:User {id: $userId})
         RETURN count(follower) as total`,
        { userId: id }
      );

      const total = countResult.records[0].get('total').toNumber();

      res.json({
        followers: usersResult.rows.map(user => ({
          id: user.id,
          username: user.username,
          firstName: user.first_name,
          lastName: user.last_name,
          avatarUrl: user.avatar_url,
          isVerified: user.is_verified
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } finally {
      await session.close();
    }
  } catch (error) {
    logger.error('Get followers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get following
app.get('/following/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const skip = (page - 1) * limit;
    
    const session = neo4jDriver.session();
    try {
      const result = await session.run(
        `MATCH (user:User {id: $userId})-[:FOLLOWS]->(following:User)
         RETURN following.id as id
         ORDER BY following.id
         SKIP $skip LIMIT $limit`,
        { userId: id, skip: neo4j.int(skip), limit: neo4j.int(limit) }
      );

      const followingIds = result.records.map(record => record.get('id'));
      
      if (followingIds.length === 0) {
        return res.json({ following: [], pagination: { page: parseInt(page), limit: parseInt(limit), total: 0, pages: 0 } });
      }

      // Get user details from PostgreSQL
      const placeholders = followingIds.map((_, i) => `$${i + 1}`).join(',');
      const usersResult = await pgPool.query(
        `SELECT id, username, first_name, last_name, avatar_url, is_verified 
         FROM users WHERE id IN (${placeholders}) AND is_active = true`,
        followingIds
      );

      // Get total count
      const countResult = await session.run(
        `MATCH (user:User {id: $userId})-[:FOLLOWS]->(following:User)
         RETURN count(following) as total`,
        { userId: id }
      );

      const total = countResult.records[0].get('total').toNumber();

      res.json({
        following: usersResult.rows.map(user => ({
          id: user.id,
          username: user.username,
          firstName: user.first_name,
          lastName: user.last_name,
          avatarUrl: user.avatar_url,
          isVerified: user.is_verified
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } finally {
      await session.close();
    }
  } catch (error) {
    logger.error('Get following error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user recommendations
app.get('/recommendations', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }

    const { limit = 10 } = req.query;

    const session = neo4jDriver.session();
    try {
      // Find users followed by people you follow, but not followed by you
      const result = await session.run(
        `MATCH (user:User {id: $userId})-[:FOLLOWS]->(friend:User)-[:FOLLOWS]->(recommendation:User)
         WHERE NOT (user)-[:FOLLOWS]->(recommendation) AND recommendation.id <> $userId
         WITH recommendation, count(*) as mutualConnections
         ORDER BY mutualConnections DESC
         LIMIT $limit
         RETURN recommendation.id as id, mutualConnections`,
        { userId, limit: neo4j.int(limit) }
      );

      const recommendationIds = result.records.map(record => record.get('id'));
      
      if (recommendationIds.length === 0) {
        return res.json({ recommendations: [] });
      }

      // Get user details from PostgreSQL
      const placeholders = recommendationIds.map((_, i) => `$${i + 1}`).join(',');
      const usersResult = await pgPool.query(
        `SELECT id, username, first_name, last_name, avatar_url, is_verified 
         FROM users WHERE id IN (${placeholders}) AND is_active = true`,
        recommendationIds
      );

      const recommendations = usersResult.rows.map(user => {
        const record = result.records.find(r => r.get('id') === user.id);
        return {
          id: user.id,
          username: user.username,
          firstName: user.first_name,
          lastName: user.last_name,
          avatarUrl: user.avatar_url,
          isVerified: user.is_verified,
          mutualConnections: record ? record.get('mutualConnections').toNumber() : 0
        };
      });

      res.json({ recommendations });
    } finally {
      await session.close();
    }
  } catch (error) {
    logger.error('Get recommendations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Search users
app.get('/search', async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;
    
    if (!q || q.trim().length === 0) {
      return res.status(400).json({ error: 'Search query required' });
    }

    const searchTerm = `%${q.trim()}%`;
    const offset = (page - 1) * limit;

    const result = await pgPool.query(
      `SELECT id, username, first_name, last_name, avatar_url, is_verified
       FROM users 
       WHERE (username ILIKE $1 OR first_name ILIKE $1 OR last_name ILIKE $1)
       AND is_active = true
       ORDER BY 
         CASE WHEN username ILIKE $1 THEN 1 ELSE 2 END,
         username
       LIMIT $2 OFFSET $3`,
      [searchTerm, limit, offset]
    );

    const countResult = await pgPool.query(
      `SELECT COUNT(*) as total
       FROM users 
       WHERE (username ILIKE $1 OR first_name ILIKE $1 OR last_name ILIKE $1)
       AND is_active = true`,
      [searchTerm]
    );

    const total = parseInt(countResult.rows[0].total);

    res.json({
      users: result.rows.map(user => ({
        id: user.id,
        username: user.username,
        firstName: user.first_name,
        lastName: user.last_name,
        avatarUrl: user.avatar_url,
        isVerified: user.is_verified
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Search users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Error handling
app.use((err, req, res, next) => {
  logger.error('User service error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Shutting down user service...');
  await neo4jDriver.close();
  await pgPool.end();
  process.exit(0);
});

app.listen(PORT, () => {
  logger.info(`User service running on port ${PORT}`);
});
