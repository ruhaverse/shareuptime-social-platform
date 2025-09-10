// Jest setup file
process.env.NODE_ENV = 'test';

// Mock environment variables for testing
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-purposes-only';
process.env.POSTGRES_HOST = 'localhost';
process.env.POSTGRES_PORT = '5432';
process.env.POSTGRES_DB = 'shareuptime_test';
process.env.POSTGRES_USER = 'test';
process.env.POSTGRES_PASSWORD = 'test';
process.env.REDIS_HOST = 'localhost';
process.env.REDIS_PORT = '6379';
process.env.MONGODB_URI = 'mongodb://localhost:27017/shareuptime_test';
process.env.FIREBASE_PROJECT_ID = 'test-project';

// Increase timeout for async operations
jest.setTimeout(30000);

// Global test setup
beforeAll(async () => {
  // Global setup code if needed
});

afterAll(async () => {
  // Global cleanup code if needed
});

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};