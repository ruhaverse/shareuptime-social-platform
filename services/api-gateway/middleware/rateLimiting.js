const rateLimit = require('express-rate-limit');
const winston = require('winston');

// Logger for rate limiting events
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/rate-limit.log' })
  ]
});

// Custom rate limit handler
const rateLimitHandler = (req, res) => {
  logger.warn('Rate limit exceeded', {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    path: req.path,
    method: req.method
  });
  
  res.status(429).json({
    error: 'Çok fazla istek yaptınız, lütfen sonra tekrar deneyin.',
    retryAfter: Math.round(req.rateLimit.resetTime / 1000),
    limit: req.rateLimit.limit,
    remaining: req.rateLimit.remaining
  });
};

// Custom key generator for more granular rate limiting
const keyGenerator = (req) => {
  // Use user ID if authenticated, otherwise IP address
  return req.user?.id || req.ip;
};

// Rate limiting configurations for different endpoints
const rateLimiters = {
  // General API rate limiter
  general: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP/user to 100 requests per window
    message: rateLimitHandler,
    keyGenerator: keyGenerator,
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: rateLimitHandler,
    skip: (req) => {
      // Skip rate limiting for health checks and documentation
      return req.path === '/health' || req.path.startsWith('/docs');
    }
  }),

  // Strict rate limiter for authentication endpoints
  auth: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 auth attempts per window
    message: rateLimitHandler,
    keyGenerator: (req) => req.ip, // Always use IP for auth endpoints
    standardHeaders: true,
    legacyHeaders: false,
    handler: rateLimitHandler,
    skipSuccessfulRequests: true // Don't count successful requests
  }),

  // More lenient rate limiter for read operations
  read: rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 200, // Allow more read operations
    message: rateLimitHandler,
    keyGenerator: keyGenerator,
    standardHeaders: true,
    legacyHeaders: false,
    handler: rateLimitHandler
  }),

  // Strict rate limiter for write operations
  write: rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 30, // Limit write operations
    message: rateLimitHandler,
    keyGenerator: keyGenerator,
    standardHeaders: true,
    legacyHeaders: false,
    handler: rateLimitHandler
  }),

  // Very strict rate limiter for media uploads
  upload: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Limit media uploads per hour
    message: rateLimitHandler,
    keyGenerator: keyGenerator,
    standardHeaders: true,
    legacyHeaders: false,
    handler: rateLimitHandler
  }),

  // Password reset rate limiter
  passwordReset: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // Limit password reset attempts
    message: rateLimitHandler,
    keyGenerator: (req) => req.ip,
    standardHeaders: true,
    legacyHeaders: false,
    handler: rateLimitHandler
  })
};

// Middleware to apply appropriate rate limiter based on route
const applyRateLimit = (type = 'general') => {
  return (req, res, next) => {
    const limiter = rateLimiters[type] || rateLimiters.general;
    return limiter(req, res, next);
  };
};

// Dynamic rate limiter that chooses based on request characteristics
const dynamicRateLimit = (req, res, next) => {
  const path = req.path.toLowerCase();
  const method = req.method.toLowerCase();
  
  // Auth endpoints
  if (path.includes('/auth/')) {
    if (path.includes('/reset') || path.includes('/forgot')) {
      return rateLimiters.passwordReset(req, res, next);
    }
    return rateLimiters.auth(req, res, next);
  }
  
  // Media upload endpoints
  if (path.includes('/media/upload') || path.includes('/upload')) {
    return rateLimiters.upload(req, res, next);
  }
  
  // Write operations
  if (['post', 'put', 'patch', 'delete'].includes(method)) {
    return rateLimiters.write(req, res, next);
  }
  
  // Read operations
  if (method === 'get') {
    return rateLimiters.read(req, res, next);
  }
  
  // Default to general rate limiter
  return rateLimiters.general(req, res, next);
};

module.exports = {
  rateLimiters,
  applyRateLimit,
  dynamicRateLimit,
  rateLimitHandler
};