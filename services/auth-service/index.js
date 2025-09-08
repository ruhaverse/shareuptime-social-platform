const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const redis = require('redis');
const Joi = require('joi');
const winston = require('winston');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.AUTH_SERVICE_PORT || 3001;

// Logger setup
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/auth.log' })
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
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379
});

redisClient.on('error', (err) => logger.error('Redis Client Error', err));
redisClient.connect();

// Middleware
app.use(express.json());

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts'
});

// Validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  username: Joi.string().alphanum().min(3).max(30).required(),
  firstName: Joi.string().min(1).max(50).required(),
  lastName: Joi.string().min(1).max(50).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Helper functions
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
  
  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  
  return { accessToken, refreshToken };
};

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'auth-service' });
});

// Register
app.post('/register', authLimiter, async (req, res) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email, password, username, firstName, lastName } = value;

    // Check if user already exists
    const existingUser = await pgPool.query(
      'SELECT id FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const result = await pgPool.query(
      `INSERT INTO users (email, username, password_hash, first_name, last_name, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       RETURNING id, email, username, first_name, last_name, created_at`,
      [email, username, hashedPassword, firstName, lastName]
    );

    const user = result.rows[0];
    const tokens = generateTokens(user);

    // Store refresh token in Redis
    await redisClient.setEx(`refresh_token:${user.id}`, 7 * 24 * 60 * 60, tokens.refreshToken);

    logger.info('User registered successfully', { userId: user.id, email: user.email });

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.first_name,
        lastName: user.last_name
      },
      ...tokens
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login
app.post('/login', authLimiter, async (req, res) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email, password } = value;

    // Get user from database
    const result = await pgPool.query(
      'SELECT id, email, username, password_hash, first_name, last_name FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const tokens = generateTokens(user);

    // Store refresh token in Redis
    await redisClient.setEx(`refresh_token:${user.id}`, 7 * 24 * 60 * 60, tokens.refreshToken);

    // Update last login
    await pgPool.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

    logger.info('User logged in successfully', { userId: user.id, email: user.email });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.first_name,
        lastName: user.last_name
      },
      ...tokens
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Refresh token
app.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token required' });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    
    // Check if token exists in Redis
    const storedToken = await redisClient.get(`refresh_token:${decoded.id}`);
    if (storedToken !== refreshToken) {
      return res.status(403).json({ error: 'Invalid refresh token' });
    }

    // Get user data
    const result = await pgPool.query(
      'SELECT id, email, username, first_name, last_name FROM users WHERE id = $1',
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    const tokens = generateTokens(user);

    // Update refresh token in Redis
    await redisClient.setEx(`refresh_token:${user.id}`, 7 * 24 * 60 * 60, tokens.refreshToken);

    res.json(tokens);
  } catch (error) {
    logger.error('Token refresh error:', error);
    res.status(403).json({ error: 'Invalid refresh token' });
  }
});

// Logout
app.post('/logout', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // Remove refresh token from Redis
      await redisClient.del(`refresh_token:${decoded.id}`);
      logger.info('User logged out', { userId: decoded.id });
    }

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    logger.error('Logout error:', error);
    res.json({ message: 'Logged out successfully' });
  }
});

// Verify token (for other services)
app.post('/verify', (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ error: 'Token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ valid: true, user: decoded });
  } catch (error) {
    res.status(401).json({ valid: false, error: 'Invalid token' });
  }
});

// Error handling
app.use((err, req, res, next) => {
  logger.error('Auth service error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  logger.info(`Auth service running on port ${PORT}`);
});
