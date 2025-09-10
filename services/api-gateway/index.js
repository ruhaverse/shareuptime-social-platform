const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const winston = require('winston');
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
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: Object.keys(services)
  });
});

// Public routes (no authentication required)
app.use('/auth', createProxyMiddleware({
  target: services.auth,
  changeOrigin: true,
  pathRewrite: { '^/auth': '' }
}));

// Protected routes (authentication required)
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

module.exports = app;
