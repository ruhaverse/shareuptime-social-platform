// Jest setup file for ShareUpTime backend tests
require('dotenv').config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';

// Default test database configuration
if (!process.env.POSTGRES_DB) {
  process.env.POSTGRES_DB = 'shareuptime_test';
}

if (!process.env.MONGO_URI) {
  process.env.MONGO_URI = 'mongodb://admin:password@localhost:27017/shareuptime_test?authSource=admin';
}

if (!process.env.REDIS_HOST) {
  process.env.REDIS_HOST = 'localhost';
}

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'test-jwt-secret-key';
}

// Increase timeout for database operations
jest.setTimeout(30000);

// Global test setup
beforeAll(async () => {
  // Setup code that runs before all tests
});

// Global test teardown
afterAll(async () => {
  // Cleanup code that runs after all tests
});

// Suppress console logs during tests unless DEBUG is set
if (!process.env.DEBUG) {
  global.console = {
    ...console,
    log: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  };
}