const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ShareUpTime Auth Service',
      version: '1.0.0',
      description: 'Authentication service for ShareUpTime platform',
      contact: {
        name: 'ShareUpTime Team',
        email: 'dev@shareuptime.com'
      }
    },
    servers: [
      {
        url: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
        description: 'Development server'
      }
    ],
    components: {
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'User unique identifier'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address'
            },
            username: {
              type: 'string',
              description: 'Unique username'
            },
            firstName: {
              type: 'string',
              description: 'User first name'
            },
            lastName: {
              type: 'string',
              description: 'User last name'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Account creation timestamp'
            }
          }
        },
        AuthResponse: {
          type: 'object',
          properties: {
            user: {
              $ref: '#/components/schemas/User'
            },
            accessToken: {
              type: 'string',
              description: 'JWT access token (15 minutes)'
            },
            refreshToken: {
              type: 'string',
              description: 'JWT refresh token (7 days)'
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication endpoints'
      },
      {
        name: 'Health',
        description: 'Service health monitoring'
      }
    ]
  },
  apis: ['./index.js'], // Path to the API docs
};

const specs = swaggerJsdoc(options);

module.exports = specs;