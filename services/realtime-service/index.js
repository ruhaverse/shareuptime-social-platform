const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const redis = require('redis');
const { Pool } = require('pg');
const { Kafka } = require('kafkajs');
const jwt = require('jsonwebtoken');
const winston = require('winston');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = createServer(app);
const PORT = process.env.REALTIME_SERVICE_PORT || 3008;

// Logger setup
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/realtime.log' })
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
  clientId: 'realtime-service',
  brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(',')
});

const consumer = kafka.consumer({ groupId: 'realtime-group' });

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3002'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Socket authentication middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'shareuptime-super-secret-jwt-key-2024');
    socket.userId = decoded.id;
    socket.userEmail = decoded.email;
    
    logger.info('User connected', { userId: decoded.id, socketId: socket.id });
    next();
  } catch (err) {
    logger.error('Socket authentication failed:', err);
    next(new Error('Authentication error'));
  }
});

// Active users tracking
const activeUsers = new Map();

// Socket connection handling
io.on('connection', (socket) => {
  const userId = socket.userId;
  
  // Add user to active users
  activeUsers.set(userId, {
    socketId: socket.id,
    lastSeen: new Date(),
    status: 'online'
  });

  // Join user to their personal room
  socket.join(`user:${userId}`);

  // Broadcast user online status
  socket.broadcast.emit('user:online', { userId });

  // Handle joining post rooms for real-time comments/likes
  socket.on('join:post', (postId) => {
    socket.join(`post:${postId}`);
    logger.info('User joined post room', { userId, postId });
  });

  // Handle leaving post rooms
  socket.on('leave:post', (postId) => {
    socket.leave(`post:${postId}`);
    logger.info('User left post room', { userId, postId });
  });

  // Handle typing indicators
  socket.on('typing:start', (data) => {
    socket.to(`post:${data.postId}`).emit('typing:start', {
      userId,
      postId: data.postId
    });
  });

  socket.on('typing:stop', (data) => {
    socket.to(`post:${data.postId}`).emit('typing:stop', {
      userId,
      postId: data.postId
    });
  });

  // Handle direct messages
  socket.on('message:send', async (data) => {
    try {
      const { recipientId, content, type = 'text' } = data;

      // Save message to database
      const result = await pgPool.query(
        `INSERT INTO messages (sender_id, recipient_id, content, message_type, created_at)
         VALUES ($1, $2, $3, $4, NOW())
         RETURNING id, created_at`,
        [userId, recipientId, content, type]
      );

      const message = {
        id: result.rows[0].id,
        senderId: userId,
        recipientId,
        content,
        type,
        createdAt: result.rows[0].created_at
      };

      // Send to recipient if online
      socket.to(`user:${recipientId}`).emit('message:receive', message);
      
      // Send confirmation to sender
      socket.emit('message:sent', message);

      logger.info('Message sent', { senderId: userId, recipientId, messageId: message.id });
    } catch (error) {
      logger.error('Send message error:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Handle user status updates
  socket.on('status:update', (status) => {
    if (activeUsers.has(userId)) {
      activeUsers.get(userId).status = status;
      socket.broadcast.emit('user:status', { userId, status });
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    activeUsers.delete(userId);
    socket.broadcast.emit('user:offline', { userId });
    logger.info('User disconnected', { userId, socketId: socket.id });
  });
});

// Kafka consumer for real-time events
const setupKafkaConsumer = async () => {
  try {
    await consumer.connect();
    await consumer.subscribe({ topics: ['post-events', 'social-events', 'notification-events'] });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const event = JSON.parse(message.value.toString());
          
          switch (event.eventType) {
            case 'POST_CREATED':
              // Notify followers about new post
              io.emit('post:created', event.data);
              break;

            case 'POST_LIKED':
              // Real-time like update
              io.to(`post:${event.data.postId}`).emit('post:liked', event.data);
              break;

            case 'POST_UNLIKED':
              // Real-time unlike update
              io.to(`post:${event.data.postId}`).emit('post:unliked', event.data);
              break;

            case 'COMMENT_ADDED':
              // Real-time comment update
              io.to(`post:${event.data.postId}`).emit('comment:added', event.data);
              break;

            case 'COMMENT_DELETED':
              // Real-time comment deletion
              io.to(`post:${event.data.postId}`).emit('comment:deleted', event.data);
              break;

            case 'NOTIFICATION_CREATED':
              // Send notification to specific user
              io.to(`user:${event.data.userId}`).emit('notification:new', event.data);
              break;

            default:
              logger.warn('Unknown event type:', event.eventType);
          }
        } catch (error) {
          logger.error('Kafka message processing error:', error);
        }
      },
    });

    logger.info('Kafka consumer started successfully');
  } catch (error) {
    logger.error('Kafka consumer setup failed:', error);
  }
};

// REST API endpoints
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'realtime-service',
    activeUsers: activeUsers.size
  });
});

// Get online users
app.get('/users/online', (req, res) => {
  const onlineUsers = Array.from(activeUsers.entries()).map(([userId, data]) => ({
    userId,
    status: data.status,
    lastSeen: data.lastSeen
  }));

  res.json({ onlineUsers });
});

// Send notification to user
app.post('/notify/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { title, message, type = 'info', data = {} } = req.body;

    // Save notification to database
    const result = await pgPool.query(
      `INSERT INTO notifications (user_id, type, title, message, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING id, created_at`,
      [userId, type, title, message]
    );

    const notification = {
      id: result.rows[0].id,
      userId,
      type,
      title,
      message,
      data,
      createdAt: result.rows[0].created_at
    };

    // Send real-time notification
    io.to(`user:${userId}`).emit('notification:new', notification);

    res.json({ success: true, notification });
  } catch (error) {
    logger.error('Send notification error:', error);
    res.status(500).json({ error: 'Failed to send notification' });
  }
});

// Broadcast message to all users
app.post('/broadcast', (req, res) => {
  try {
    const { message, type = 'announcement' } = req.body;
    
    io.emit('broadcast', { message, type, timestamp: new Date() });
    
    res.json({ success: true, message: 'Broadcast sent' });
  } catch (error) {
    logger.error('Broadcast error:', error);
    res.status(500).json({ error: 'Failed to broadcast message' });
  }
});

// Error handling
app.use((err, req, res, next) => {
  logger.error('Realtime service error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Shutting down realtime service...');
  await consumer.disconnect();
  await redisClient.quit();
  await pgPool.end();
  server.close();
  process.exit(0);
});

// Start server and Kafka consumer
server.listen(PORT, () => {
  logger.info(`Realtime service running on port ${PORT}`);
  setupKafkaConsumer();
});
