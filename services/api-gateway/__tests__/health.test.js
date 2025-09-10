const request = require('supertest');
const express = require('express');

// Mock the API Gateway app for testing
const createTestApp = () => {
  const app = express();
  
  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: ['auth', 'user', 'post', 'feed', 'media', 'notification']
    });
  });

  // Mock service status endpoint
  app.get('/status', (req, res) => {
    res.json({
      gateway: 'operational',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: '1.0.0'
    });
  });

  return app;
};

describe('API Gateway Health Checks', () => {
  let app;

  beforeEach(() => {
    app = createTestApp();
  });

  describe('GET /health', () => {
    it('should return healthy status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toMatchObject({
        status: 'healthy',
        services: expect.arrayContaining([
          'auth', 'user', 'post', 'feed', 'media', 'notification'
        ])
      });

      expect(response.body.timestamp).toBeDefined();
      expect(new Date(response.body.timestamp)).toBeInstanceOf(Date);
    });

    it('should have correct response format', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200)
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('services');
      expect(Array.isArray(response.body.services)).toBe(true);
    });

    it('should respond within acceptable time', async () => {
      const startTime = Date.now();
      
      await request(app)
        .get('/health')
        .expect(200);

      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(1000); // Should respond within 1 second
    });
  });

  describe('GET /status', () => {
    it('should return operational status', async () => {
      const response = await request(app)
        .get('/status')
        .expect(200);

      expect(response.body).toMatchObject({
        gateway: 'operational',
        version: '1.0.0'
      });

      expect(response.body.uptime).toBeGreaterThanOrEqual(0);
      expect(response.body.memory).toHaveProperty('rss');
      expect(response.body.memory).toHaveProperty('heapUsed');
    });

    it('should include memory usage information', async () => {
      const response = await request(app)
        .get('/status')
        .expect(200);

      const { memory } = response.body;
      expect(memory).toHaveProperty('rss');
      expect(memory).toHaveProperty('heapTotal');
      expect(memory).toHaveProperty('heapUsed');
      expect(memory).toHaveProperty('external');

      // Memory values should be positive numbers
      Object.values(memory).forEach(value => {
        expect(typeof value).toBe('number');
        expect(value).toBeGreaterThan(0);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid routes', async () => {
      await request(app)
        .get('/invalid-route')
        .expect(404);
    });

    it('should handle malformed requests gracefully', async () => {
      await request(app)
        .post('/health')
        .expect(404);
    });
  });

  describe('Headers and Security', () => {
    it('should set appropriate content-type headers', async () => {
      await request(app)
        .get('/health')
        .expect('Content-Type', /json/)
        .expect(200);
    });

    it('should respond to HEAD requests', async () => {
      await request(app)
        .head('/health')
        .expect(200);
    });
  });
});

// Integration tests for actual API Gateway (when running with real services)
describe('API Gateway Integration Tests', () => {
  // Skip if not in integration test environment
  const isIntegrationTest = process.env.NODE_ENV === 'integration';
  
  if (!isIntegrationTest) {
    it.skip('Integration tests skipped - set NODE_ENV=integration to run', () => {
      // This test is skipped in unit test mode
    });
    return;
  }

  const API_GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://localhost:3000';

  describe('Real API Gateway Health', () => {
    it('should connect to real API Gateway', async () => {
      const response = await request(API_GATEWAY_URL)
        .get('/health')
        .timeout(5000);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('healthy');
    }, 10000);

    it('should have all expected services listed', async () => {
      const response = await request(API_GATEWAY_URL)
        .get('/health')
        .timeout(5000);

      const expectedServices = ['auth', 'user', 'post', 'feed', 'media', 'notification'];
      expectedServices.forEach(service => {
        expect(response.body.services).toContain(service);
      });
    }, 10000);
  });
});

// Performance tests
describe('API Gateway Performance Tests', () => {
  let app;

  beforeEach(() => {
    app = createTestApp();
  });

  it('should handle concurrent requests', async () => {
    const concurrentRequests = 10;
    const requests = Array(concurrentRequests).fill().map(() => 
      request(app).get('/health')
    );

    const responses = await Promise.all(requests);
    
    responses.forEach(response => {
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('healthy');
    });
  });

  it('should maintain consistent response times', async () => {
    const requestCount = 5;
    const responseTimes = [];

    for (let i = 0; i < requestCount; i++) {
      const startTime = Date.now();
      await request(app).get('/health').expect(200);
      responseTimes.push(Date.now() - startTime);
    }

    const averageTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    const maxTime = Math.max(...responseTimes);
    
    expect(averageTime).toBeLessThan(100); // Average under 100ms
    expect(maxTime).toBeLessThan(500); // Max under 500ms
  });
});