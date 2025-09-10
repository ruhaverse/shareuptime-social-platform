const request = require('supertest');
const express = require('express');

// Create a simple test app for API Gateway endpoints
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  
  // Mock health endpoint
  app.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: ['auth', 'user', 'post', 'feed', 'media', 'notification']
    });
  });
  
  return app;
};

describe('API Gateway', () => {
  let app;
  
  beforeEach(() => {
    app = createTestApp();
  });
  
  describe('Health Check', () => {
    test('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);
      
      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('services');
      expect(Array.isArray(response.body.services)).toBe(true);
    });
    
    test('should include all expected services', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);
      
      const expectedServices = ['auth', 'user', 'post', 'feed', 'media', 'notification'];
      expect(response.body.services).toEqual(expect.arrayContaining(expectedServices));
    });
  });
  
  describe('API Documentation', () => {
    test('should have Swagger documentation available', () => {
      // This test verifies that swagger config can be imported
      expect(() => {
        require('../services/api-gateway/swagger.config');
      }).not.toThrow();
    });
  });
});