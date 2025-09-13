const request = require('supertest');
const axios = require('axios');

const AUTH_SERVICE_URL = 'http://localhost:3001';
const API_GATEWAY_URL = 'http://localhost:3000';

describe('Authentication Service', () => {
  let testUser = {
    email: 'test@shareuptime.com',
    password: 'testpassword123',
    username: 'testuser',
    firstName: 'Test',
    lastName: 'User'
  };

  let authToken = '';

  beforeAll(async () => {
    // Wait for services to be ready
    await new Promise(resolve => setTimeout(resolve, 2000));
  });

  describe('POST /register', () => {
    it('should register a new user successfully', async () => {
      const response = await axios.post(`${AUTH_SERVICE_URL}/register`, testUser);
      
      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('user');
      expect(response.data).toHaveProperty('accessToken');
      expect(response.data.user.email).toBe(testUser.email);
      expect(response.data.user.username).toBe(testUser.username);
      
      authToken = response.data.accessToken;
    });

    it('should not register user with duplicate email', async () => {
      try {
        await axios.post(`${AUTH_SERVICE_URL}/register`, testUser);
      } catch (error) {
        expect(error.response.status).toBe(409);
        expect(error.response.data).toHaveProperty('error');
      }
    });

    it('should validate required fields', async () => {
      try {
        await axios.post(`${AUTH_SERVICE_URL}/register`, {
          email: 'invalid-email',
          password: '123' // too short
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });
  });

  describe('POST /login', () => {
    it('should login with valid credentials', async () => {
      const response = await axios.post(`${AUTH_SERVICE_URL}/login`, {
        email: testUser.email,
        password: testUser.password
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('user');
      expect(response.data).toHaveProperty('accessToken');
      expect(response.data.user.email).toBe(testUser.email);
    });

    it('should reject invalid credentials', async () => {
      try {
        await axios.post(`${AUTH_SERVICE_URL}/login`, {
          email: testUser.email,
          password: 'wrongpassword'
        });
      } catch (error) {
        expect(error.response.status).toBe(401);
      }
    });

    it('should reject non-existent user', async () => {
      try {
        await axios.post(`${AUTH_SERVICE_URL}/login`, {
          email: 'nonexistent@example.com',
          password: 'password123'
        });
      } catch (error) {
        expect(error.response.status).toBe(401);
      }
    });
  });

  describe('POST /verify', () => {
    it('should verify valid token', async () => {
      const response = await axios.post(`${AUTH_SERVICE_URL}/verify`, {
        token: authToken
      });

      expect(response.status).toBe(200);
      expect(response.data.valid).toBe(true);
      expect(response.data).toHaveProperty('user');
    });

    it('should reject invalid token', async () => {
      try {
        await axios.post(`${AUTH_SERVICE_URL}/verify`, {
          token: 'invalid-token'
        });
      } catch (error) {
        expect(error.response.status).toBe(401);
        expect(error.response.data.valid).toBe(false);
      }
    });
  });

  describe('POST /logout', () => {
    it('should logout successfully', async () => {
      const response = await axios.post(`${AUTH_SERVICE_URL}/logout`, {}, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('message');
    });
  });

  describe('Health Check', () => {
    it('should return healthy status', async () => {
      const response = await axios.get(`${AUTH_SERVICE_URL}/health`);
      
      expect(response.status).toBe(200);
      expect(response.data.status).toBe('healthy');
      expect(response.data.service).toBe('auth-service');
    });
  });
});
