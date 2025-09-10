const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const winston = require('winston');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./swagger.config');
require('dotenv').config();

const app = express();
const PORT = process.env.API_GATEWAY_PORT || 3000;

// Logger setup
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/gateway.log' })
  ]
});

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});
app.use(limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  next();
});

// JWT Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Service endpoints
const services = {
  auth: `http://auth-service:${process.env.AUTH_SERVICE_PORT || 3001}`,
  user: `http://user-service:${process.env.USER_SERVICE_PORT || 3002}`,
  post: `http://post-service:${process.env.POST_SERVICE_PORT || 3003}`,
  feed: `http://feed-service:${process.env.FEED_SERVICE_PORT || 3004}`,
  media: `http://media-service:${process.env.MEDIA_SERVICE_PORT || 3005}`,
  notification: `http://notification-service:${process.env.NOTIFICATION_SERVICE_PORT || 3006}`
};

// Health check
/**
 * @swagger
 * /health:
 *   get:
 *     summary: API Gateway health check
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: healthy
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 services:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["auth", "user", "post", "feed", "media", "notification"]
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: Object.keys(services)
  });
});

// API Documentation
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'ShareUpTime API Documentation'
}));

// Public routes (no authentication required)
/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - username
 *               - firstName
 *               - lastName
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 example: securepassword123
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 30
 *                 example: johndoe
 *               firstName:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 50
 *                 example: John
 *               lastName:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 50
 *                 example: Doe
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     username:
 *                       type: string
 *                     firstName:
 *                       type: string
 *                     lastName:
 *                       type: string
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       409:
 *         description: User already exists
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 * 
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: securepassword123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     username:
 *                       type: string
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         description: Invalid credentials
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 */
app.use('/auth', createProxyMiddleware({
  target: services.auth,
  changeOrigin: true,
  pathRewrite: { '^/auth': '' }
}));

// Protected routes (authentication required)
/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 * 
 * /posts:
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 2000
 *                 example: "This is my first post!"
 *               mediaUrls:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uri
 *               hashtags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["tech", "social"]
 *               mentions:
 *                 type: array
 *                 items:
 *                   type: string
 *               location:
 *                 type: object
 *                 properties:
 *                   latitude:
 *                     type: number
 *                   longitude:
 *                     type: number
 *                   name:
 *                     type: string
 *     responses:
 *       201:
 *         description: Post created successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 * 
 * /feed:
 *   get:
 *     summary: Get user timeline
 *     tags: [Feed]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of posts to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of posts to skip
 *     responses:
 *       200:
 *         description: Timeline retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
app.use('/users', authenticateToken, createProxyMiddleware({
  target: services.user,
  changeOrigin: true,
  pathRewrite: { '^/users': '' },
  onProxyReq: (proxyReq, req) => {
    // Add user info to headers for downstream services
    proxyReq.setHeader('x-user-id', req.user.id);
    proxyReq.setHeader('x-user-email', req.user.email);
  }
}));

app.use('/posts', authenticateToken, createProxyMiddleware({
  target: services.post,
  changeOrigin: true,
  pathRewrite: { '^/posts': '' },
  onProxyReq: (proxyReq, req) => {
    proxyReq.setHeader('x-user-id', req.user.id);
  }
}));

app.use('/feed', authenticateToken, createProxyMiddleware({
  target: services.feed,
  changeOrigin: true,
  pathRewrite: { '^/feed': '' },
  onProxyReq: (proxyReq, req) => {
    proxyReq.setHeader('x-user-id', req.user.id);
  }
}));

app.use('/media', authenticateToken, createProxyMiddleware({
  target: services.media,
  changeOrigin: true,
  pathRewrite: { '^/media': '' },
  onProxyReq: (proxyReq, req) => {
    proxyReq.setHeader('x-user-id', req.user.id);
  }
}));

app.use('/notifications', authenticateToken, createProxyMiddleware({
  target: services.notification,
  changeOrigin: true,
  pathRewrite: { '^/notifications': '' },
  onProxyReq: (proxyReq, req) => {
    proxyReq.setHeader('x-user-id', req.user.id);
  }
}));

// Error handling
app.use((err, req, res, next) => {
  logger.error('Gateway error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  logger.info(`API Gateway running on port ${PORT}`);
  logger.info('Available services:', services);
});
