const request = require('supertest');
const express = require('express');

// Mock the persistence module
jest.mock('../persistence', () => ({
  pgPool: {
    connect: jest.fn().mockResolvedValue({
      release: jest.fn()
    })
  },
  mongoose: {
    connect: jest.fn().mockResolvedValue()
  },
  firestore: {
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: jest.fn().mockResolvedValue({ exists: true, data: () => ({}) })
      }))
    }))
  }
}));

// Import app after mocking
const app = require('../index');

describe('Greeting Endpoints', () => {
  describe('GET /merhaba', () => {
    it('should return Turkish greeting with platform information', async () => {
      const response = await request(app).get('/merhaba');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Merhaba');
      expect(response.body.message).toContain('hoş geldiniz');
      expect(response.body).toHaveProperty('english');
      expect(response.body.english).toContain('Hello');
      expect(response.body.english).toContain('Welcome');
      expect(response.body).toHaveProperty('platform');
      expect(response.body.platform).toContain('ShareUpTime');
      expect(response.body).toHaveProperty('features');
      expect(Array.isArray(response.body.features)).toBe(true);
      expect(response.body).toHaveProperty('status', 'online');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('GET /hello', () => {
    it('should redirect to /merhaba', async () => {
      const response = await request(app).get('/hello');
      
      expect(response.status).toBe(302);
      expect(response.headers.location).toBe('/merhaba');
    });
  });

  describe('GET /greeting', () => {
    it('should redirect to /merhaba', async () => {
      const response = await request(app).get('/greeting');
      
      expect(response.status).toBe(302);
      expect(response.headers.location).toBe('/merhaba');
    });
  });
});