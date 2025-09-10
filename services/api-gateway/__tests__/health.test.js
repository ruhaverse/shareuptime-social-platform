const request = require('supertest');
const app = require('../index'); // Express uygulamanızı export edin

describe('API Gateway Health Check', () => {
  it('should return healthy status', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('healthy');
  });
});