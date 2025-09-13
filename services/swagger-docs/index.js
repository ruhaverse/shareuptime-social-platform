const express = require('express');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.SWAGGER_PORT || 3009;

// Middleware
app.use(cors());
app.use(express.json());

// Swagger definition
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'ShareUpTime API Documentation',
    version: '1.0.0',
    description: 'Comprehensive API documentation for ShareUpTime social media platform',
    contact: {
      name: 'ShareUpTime Team',
      email: 'support@shareuptime.com'
    }
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development API Gateway'
    },
    {
      url: 'https://api.shareuptime.com',
      description: 'Production API Gateway'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          email: { type: 'string', format: 'email', example: 'user@example.com' },
          username: { type: 'string', example: 'johndoe' },
          firstName: { type: 'string', example: 'John' },
          lastName: { type: 'string', example: 'Doe' },
          bio: { type: 'string', example: 'Software developer and tech enthusiast' },
          avatarUrl: { type: 'string', format: 'uri', example: 'https://example.com/avatar.jpg' },
          isVerified: { type: 'boolean', example: false },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },
      Post: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'uuid-string' },
          userId: { type: 'string', example: '1' },
          content: { type: 'string', example: 'This is my first post!' },
          mediaUrls: { 
            type: 'array', 
            items: { type: 'string', format: 'uri' },
            example: ['https://example.com/image.jpg']
          },
          hashtags: {
            type: 'array',
            items: { type: 'string' },
            example: ['technology', 'coding']
          },
          mentions: {
            type: 'array',
            items: { type: 'string' },
            example: ['johndoe', 'janedoe']
          },
          likesCount: { type: 'integer', example: 42 },
          commentsCount: { type: 'integer', example: 5 },
          sharesCount: { type: 'integer', example: 3 },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      Comment: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          postId: { type: 'string', example: 'uuid-string' },
          userId: { type: 'integer', example: 1 },
          content: { type: 'string', example: 'Great post!' },
          likesCount: { type: 'integer', example: 5 },
          user: { $ref: '#/components/schemas/User' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      AuthResponse: {
        type: 'object',
        properties: {
          user: { $ref: '#/components/schemas/User' },
          accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
          refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
        }
      },
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Error message' }
        }
      }
    }
  },
  tags: [
    { name: 'Authentication', description: 'User authentication endpoints' },
    { name: 'Users', description: 'User management and profiles' },
    { name: 'Posts', description: 'Post creation and management' },
    { name: 'Social', description: 'Likes, comments, and social interactions' },
    { name: 'Real-time', description: 'WebSocket and real-time features' }
  ]
};

// API paths documentation
const apiPaths = {
  '/auth/register': {
    post: {
      tags: ['Authentication'],
      summary: 'Register a new user',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['email', 'password', 'username', 'firstName', 'lastName'],
              properties: {
                email: { type: 'string', format: 'email' },
                password: { type: 'string', minLength: 8 },
                username: { type: 'string', minLength: 3, maxLength: 30 },
                firstName: { type: 'string', minLength: 1, maxLength: 50 },
                lastName: { type: 'string', minLength: 1, maxLength: 50 }
              }
            }
          }
        }
      },
      responses: {
        201: {
          description: 'User registered successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AuthResponse' }
            }
          }
        },
        400: {
          description: 'Validation error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        409: {
          description: 'User already exists',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        }
      }
    }
  },
  '/auth/login': {
    post: {
      tags: ['Authentication'],
      summary: 'Login user',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['email', 'password'],
              properties: {
                email: { type: 'string', format: 'email' },
                password: { type: 'string' }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Login successful',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AuthResponse' }
            }
          }
        },
        401: {
          description: 'Invalid credentials',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        }
      }
    }
  },
  '/users/profile/{id}': {
    get: {
      tags: ['Users'],
      summary: 'Get user profile',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'integer' },
          description: 'User ID'
        }
      ],
      responses: {
        200: {
          description: 'User profile retrieved',
          content: {
            'application/json': {
              schema: {
                allOf: [
                  { $ref: '#/components/schemas/User' },
                  {
                    type: 'object',
                    properties: {
                      stats: {
                        type: 'object',
                        properties: {
                          followersCount: { type: 'integer' },
                          followingCount: { type: 'integer' },
                          friendsCount: { type: 'integer' }
                        }
                      },
                      isFollowing: { type: 'boolean' }
                    }
                  }
                ]
              }
            }
          }
        },
        404: {
          description: 'User not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        }
      }
    }
  },
  '/posts': {
    post: {
      tags: ['Posts'],
      summary: 'Create a new post',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['content'],
              properties: {
                content: { type: 'string', minLength: 1, maxLength: 2000 },
                mediaUrls: {
                  type: 'array',
                  items: { type: 'string', format: 'uri' }
                },
                hashtags: {
                  type: 'array',
                  items: { type: 'string' }
                },
                mentions: {
                  type: 'array',
                  items: { type: 'string' }
                },
                location: {
                  type: 'object',
                  properties: {
                    latitude: { type: 'number', minimum: -90, maximum: 90 },
                    longitude: { type: 'number', minimum: -180, maximum: 180 },
                    name: { type: 'string', maxLength: 100 }
                  }
                }
              }
            }
          }
        }
      },
      responses: {
        201: {
          description: 'Post created successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Post' }
            }
          }
        },
        400: {
          description: 'Validation error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        }
      }
    }
  },
  '/social/like': {
    post: {
      tags: ['Social'],
      summary: 'Like a post',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['postId'],
              properties: {
                postId: { type: 'string' }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Post liked successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string' },
                  likesCount: { type: 'integer' }
                }
              }
            }
          }
        },
        409: {
          description: 'Post already liked',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        }
      }
    },
    delete: {
      tags: ['Social'],
      summary: 'Unlike a post',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['postId'],
              properties: {
                postId: { type: 'string' }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Post unliked successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string' },
                  likesCount: { type: 'integer' }
                }
              }
            }
          }
        },
        404: {
          description: 'Like not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        }
      }
    }
  }
};

// Swagger options
const options = {
  definition: {
    ...swaggerDefinition,
    paths: apiPaths
  },
  apis: [] // We're defining everything inline
};

const specs = swaggerJsdoc(options);

// Serve Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'ShareUpTime API Documentation'
}));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'swagger-docs' });
});

// Redirect root to docs
app.get('/', (req, res) => {
  res.redirect('/api-docs');
});

app.listen(PORT, () => {
  console.log(`📚 API Documentation available at http://localhost:${PORT}/api-docs`);
});
