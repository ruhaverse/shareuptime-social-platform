const express = require('express');
const { Server } = require('socket.io');
const http = require('http');
const { Kafka } = require('kafkajs');
const { Pool } = require('pg');
const redis = require('redis');
const Joi = require('joi');
const winston = require('winston');
const cron = require('node-cron');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.NOTIFICATION_SERVICE_PORT || 3006;

// Logger setup
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/notification.log' })
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

// Kafka setup
const kafka = new Kafka({
  clientId: 'notification-service',
  brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(',')
});

const consumer = kafka.consumer({ groupId: 'notification-service-group' });

// Middleware
app.use(express.json());

// Connected users store
const connectedUsers = new Map(); // userId -> socketId

// Socket.IO connection handling
io.on('connection', (socket) => {
  logger.info('User connected', { socketId: socket.id });

  // Authenticate user
  socket.on('authenticate', async (data) => {
    try {
      const { userId, token } = data;
      
      // Verify token with auth service (simplified for demo)
      if (userId && token) {
        connectedUsers.set(userId, socket.id);
        socket.userId = userId;
        socket.join(`user_${userId}`);
        
        logger.info('User authenticated', { userId, socketId: socket.id });
        
        // Send pending notifications
        await sendPendingNotifications(userId, socket);
        
        socket.emit('authenticated', { success: true });
      } else {
        socket.emit('authentication_error', { error: 'Invalid credentials' });
      }
    } catch (error) {
      logger.error('Authentication error:', error);
      socket.emit('authentication_error', { error: 'Authentication failed' });
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    if (socket.userId) {
      connectedUsers.delete(socket.userId);
      logger.info('User disconnected', { userId: socket.userId, socketId: socket.id });
    }
  });

  // Mark notification as read
  socket.on('mark_read', async (data) => {
    try {
      const { notificationId } = data;
      if (socket.userId) {
        await markNotificationAsRead(notificationId, socket.userId);
        socket.emit('notification_read', { notificationId });
      }
    } catch (error) {
      logger.error('Mark read error:', error);
    }
  });

  // Mark all notifications as read
  socket.on('mark_all_read', async () => {
    try {
      if (socket.userId) {
        await markAllNotificationsAsRead(socket.userId);
        socket.emit('all_notifications_read');
      }
    } catch (error) {
      logger.error('Mark all read error:', error);
    }
  });
});

// Notification types and templates
const NotificationTypes = {
  LIKE: 'like',
  COMMENT: 'comment',
  FOLLOW: 'follow',
  MENTION: 'mention',
  SHARE: 'share',
  FRIEND_REQUEST: 'friend_request'
};

const NotificationTemplates = {
  [NotificationTypes.LIKE]: {
    title: 'New Like',
    message: '{username} liked your post'
  },
  [NotificationTypes.COMMENT]: {
    title: 'New Comment',
    message: '{username} commented on your post'
  },
  [NotificationTypes.FOLLOW]: {
    title: 'New Follower',
    message: '{username} started following you'
  },
  [NotificationTypes.MENTION]: {
    title: 'You were mentioned',
    message: '{username} mentioned you in a post'
  },
  [NotificationTypes.SHARE]: {
    title: 'Post Shared',
    message: '{username} shared your post'
  },
  [NotificationTypes.FRIEND_REQUEST]: {
    title: 'Friend Request',
    message: '{username} sent you a friend request'
  }
};

// Helper functions
const createNotification = async (userId, type, data) => {
  try {
    const template = NotificationTemplates[type];
    if (!template) {
      throw new Error(`Unknown notification type: ${type}`);
    }

    const title = template.title;
    const message = template.message.replace(/{(\w+)}/g, (match, key) => data[key] || match);

    const result = await pgPool.query(
      `INSERT INTO notifications (user_id, type, title, message, data, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING *`,
      [userId, type, title, message, JSON.stringify(data)]
    );

    return result.rows[0];
  } catch (error) {
    logger.error('Create notification error:', error);
    throw error;
  }
};

const sendNotification = async (notification) => {
  try {
    const userId = notification.user_id;
    
    // Send real-time notification if user is connected
    const socketId = connectedUsers.get(userId);
    if (socketId) {
      io.to(`user_${userId}`).emit('notification', {
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data,
        createdAt: notification.created_at,
        isRead: false
      });
      
      logger.info('Real-time notification sent', { userId, notificationId: notification.id });
    }

    // Store in Redis for offline users
    await redisClient.lPush(`notifications:${userId}`, JSON.stringify({
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      data: notification.data,
      createdAt: notification.created_at,
      isRead: false
    }));

    // Keep only last 100 notifications in Redis
    await redisClient.lTrim(`notifications:${userId}`, 0, 99);

  } catch (error) {
    logger.error('Send notification error:', error);
  }
};

const sendPendingNotifications = async (userId, socket) => {
  try {
    // Get unread notifications from database
    const result = await pgPool.query(
      `SELECT * FROM notifications 
       WHERE user_id = $1 AND is_read = false 
       ORDER BY created_at DESC 
       LIMIT 50`,
      [userId]
    );

    for (const notification of result.rows) {
      socket.emit('notification', {
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data,
        createdAt: notification.created_at,
        isRead: notification.is_read
      });
    }

    logger.info('Pending notifications sent', { userId, count: result.rows.length });
  } catch (error) {
    logger.error('Send pending notifications error:', error);
  }
};

const markNotificationAsRead = async (notificationId, userId) => {
  try {
    await pgPool.query(
      'UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2',
      [notificationId, userId]
    );

    logger.info('Notification marked as read', { notificationId, userId });
  } catch (error) {
    logger.error('Mark notification as read error:', error);
  }
};

const markAllNotificationsAsRead = async (userId) => {
  try {
    await pgPool.query(
      'UPDATE notifications SET is_read = true WHERE user_id = $1 AND is_read = false',
      [userId]
    );

    logger.info('All notifications marked as read', { userId });
  } catch (error) {
    logger.error('Mark all notifications as read error:', error);
  }
};

// Kafka event handlers
const handlePostCreated = async (event) => {
  try {
    const { userId, mentions } = event.data;

    // Send mention notifications
    if (mentions && mentions.length > 0) {
      // Get mentioned users from database
      const mentionedUsers = await pgPool.query(
        'SELECT id, username FROM users WHERE username = ANY($1)',
        [mentions]
      );

      for (const mentionedUser of mentionedUsers.rows) {
        if (mentionedUser.id !== userId) { // Don't notify self
          const notification = await createNotification(
            mentionedUser.id,
            NotificationTypes.MENTION,
            {
              username: event.data.authorUsername || 'Someone',
              postId: event.data.id
            }
          );

          await sendNotification(notification);
        }
      }
    }

    logger.info('Post created notifications processed', { postId: event.data.id });
  } catch (error) {
    logger.error('Handle post created error:', error);
  }
};

const handleUserFollowed = async (event) => {
  try {
    const { followerId, followingId, followerUsername } = event.data;

    const notification = await createNotification(
      followingId,
      NotificationTypes.FOLLOW,
      {
        username: followerUsername,
        followerId
      }
    );

    await sendNotification(notification);

    logger.info('Follow notification sent', { followerId, followingId });
  } catch (error) {
    logger.error('Handle user followed error:', error);
  }
};

const handlePostLiked = async (event) => {
  try {
    const { postId, userId, likerUsername, postAuthorId } = event.data;

    if (userId !== postAuthorId) { // Don't notify self
      const notification = await createNotification(
        postAuthorId,
        NotificationTypes.LIKE,
        {
          username: likerUsername,
          postId
        }
      );

      await sendNotification(notification);
    }

    logger.info('Like notification sent', { postId, userId, postAuthorId });
  } catch (error) {
    logger.error('Handle post liked error:', error);
  }
};

const handlePostCommented = async (event) => {
  try {
    const { postId, userId, commenterUsername, postAuthorId } = event.data;

    if (userId !== postAuthorId) { // Don't notify self
      const notification = await createNotification(
        postAuthorId,
        NotificationTypes.COMMENT,
        {
          username: commenterUsername,
          postId
        }
      );

      await sendNotification(notification);
    }

    logger.info('Comment notification sent', { postId, userId, postAuthorId });
  } catch (error) {
    logger.error('Handle post commented error:', error);
  }
};

// Start Kafka consumer
async function startKafkaConsumer() {
  try {
    await consumer.connect();
    await consumer.subscribe({ topics: ['post-events', 'user-events', 'interaction-events'] });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const event = JSON.parse(message.value.toString());
        
        switch (event.eventType) {
          case 'POST_CREATED':
            await handlePostCreated(event);
            break;
          case 'USER_FOLLOWED':
            await handleUserFollowed(event);
            break;
          case 'POST_LIKED':
            await handlePostLiked(event);
            break;
          case 'POST_COMMENTED':
            await handlePostCommented(event);
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

// REST API Routes
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'notification-service',
    connectedUsers: connectedUsers.size
  });
});

// Get user notifications
app.get('/', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }

    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE user_id = $1';
    let params = [userId];

    if (unreadOnly === 'true') {
      whereClause += ' AND is_read = false';
    }

    const result = await pgPool.query(
      `SELECT * FROM notifications ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    );

    const countResult = await pgPool.query(
      `SELECT COUNT(*) as total FROM notifications ${whereClause}`,
      params
    );

    const total = parseInt(countResult.rows[0].total);

    res.json({
      notifications: result.rows.map(notification => ({
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data,
        isRead: notification.is_read,
        createdAt: notification.created_at
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    logger.error('Get notifications error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark notification as read
app.put('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.headers['x-user-id'];

    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }

    await markNotificationAsRead(id, userId);
    res.json({ message: 'Notification marked as read' });

  } catch (error) {
    logger.error('Mark notification read error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark all notifications as read
app.put('/read-all', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];

    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }

    await markAllNotificationsAsRead(userId);
    res.json({ message: 'All notifications marked as read' });

  } catch (error) {
    logger.error('Mark all notifications read error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get notification stats
app.get('/stats', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];

    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }

    const result = await pgPool.query(
      `SELECT 
         COUNT(*) as total,
         COUNT(*) FILTER (WHERE is_read = false) as unread,
         COUNT(*) FILTER (WHERE type = 'like') as likes,
         COUNT(*) FILTER (WHERE type = 'comment') as comments,
         COUNT(*) FILTER (WHERE type = 'follow') as follows
       FROM notifications 
       WHERE user_id = $1`,
      [userId]
    );

    const stats = result.rows[0];

    res.json({
      total: parseInt(stats.total),
      unread: parseInt(stats.unread),
      breakdown: {
        likes: parseInt(stats.likes),
        comments: parseInt(stats.comments),
        follows: parseInt(stats.follows)
      }
    });

  } catch (error) {
    logger.error('Get notification stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Cleanup old notifications (run daily)
cron.schedule('0 2 * * *', async () => {
  try {
    logger.info('Cleaning up old notifications...');
    
    // Delete notifications older than 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const result = await pgPool.query(
      'DELETE FROM notifications WHERE created_at < $1',
      [thirtyDaysAgo]
    );

    logger.info(`Cleaned up ${result.rowCount} old notifications`);
  } catch (error) {
    logger.error('Cleanup error:', error);
  }
});

// Error handling
app.use((err, req, res, next) => {
  logger.error('Notification service error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Shutting down notification service...');
  await consumer.disconnect();
  await redisClient.quit();
  await pgPool.end();
  server.close();
  process.exit(0);
});

// Start services
startKafkaConsumer();

server.listen(PORT, () => {
  logger.info(`Notification service running on port ${PORT}`);
});
