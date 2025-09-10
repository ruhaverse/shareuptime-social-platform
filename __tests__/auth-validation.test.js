const Joi = require('joi');

// Test validation schemas used in auth service
describe('Auth Service Validation', () => {
  describe('Register Schema', () => {
    const registerSchema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(8).required(),
      username: Joi.string().alphanum().min(3).max(30).required(),
      firstName: Joi.string().min(1).max(50).required(),
      lastName: Joi.string().min(1).max(50).required()
    });

    test('should validate correct registration data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User'
      };
      
      const { error } = registerSchema.validate(validData);
      expect(error).toBeUndefined();
    });

    test('should reject invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'password123',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User'
      };
      
      const { error } = registerSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain('email');
    });

    test('should reject short password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'short',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User'
      };
      
      const { error } = registerSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain('password');
    });

    test('should reject invalid username', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'password123',
        username: 'ab', // too short
        firstName: 'Test',
        lastName: 'User'
      };
      
      const { error } = registerSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain('username');
    });
  });

  describe('Login Schema', () => {
    const loginSchema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required()
    });

    test('should validate correct login data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123'
      };
      
      const { error } = loginSchema.validate(validData);
      expect(error).toBeUndefined();
    });

    test('should reject missing fields', () => {
      const invalidData = {
        email: 'test@example.com'
        // password missing
      };
      
      const { error } = loginSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain('password');
    });
  });
});