# ShareUpTime - Next-Generation Social Media Platform

[![CI Pipeline](https://github.com/ruhaverse/shareuptime-social-platform/actions/workflows/ci.yml/badge.svg)](https://github.com/ruhaverse/shareuptime-social-platform/actions/workflows/ci.yml)
[![Test Coverage](https://codecov.io/gh/ruhaverse/shareuptime-social-platform/branch/main/graph/badge.svg)](https://codecov.io/gh/ruhaverse/shareuptime-social-platform)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Docker and Docker Compose
- Git

### 🏃‍♂️ Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/ruhaverse/shareuptime-social-platform.git
   cd shareuptime-social-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment**
   ```bash
   npm run setup
   # This copies .env.example to .env and initializes databases
   ```

4. **Start all services**
   ```bash
   npm run dev
   # Starts all microservices with Docker Compose
   ```

5. **Verify the setup**
   ```bash
   curl http://localhost:3000/health
   ```

### 📋 Available Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start all services in production mode |
| `npm run dev` | Start all services in development mode with live reload |
| `npm run stop` | Stop all running services |
| `npm run logs` | View logs from all services |
| `npm test` | Run all tests |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run test:watch` | Run tests in watch mode |

## 🏗️ Architecture Overview

ShareUpTime is a microservices-based social media platform designed for scalability and real-time interactions.

### 🔧 Services

- **API Gateway** (Port 3000) - Request routing, authentication, and rate limiting
- **Auth Service** (Port 3001) - JWT authentication and user sessions
- **User Service** (Port 3002) - User profiles and social graph (Neo4j)
- **Post Service** (Port 3003) - Content creation and management (MongoDB + PostgreSQL)
- **Feed Service** (Port 3004) - Timeline generation and caching (Redis)
- **Media Service** (Port 3005) - File upload and processing (MinIO)
- **Notification Service** (Port 3006) - Real-time notifications (Kafka)

### 🗄️ Databases

- **PostgreSQL** - Structured data (users, posts metadata)
- **MongoDB** - Flexible content storage (post content, comments)
- **Neo4j** - Social graph (follows, connections, recommendations)
- **Redis** - Caching and session storage
- **Elasticsearch** - Search indexing
- **MinIO** - Object storage (images, videos)

### 🛠️ Infrastructure

- **Kafka + Zookeeper** - Event streaming and messaging
- **Docker Compose** - Local development environment
- **Prometheus + Grafana** - Monitoring and metrics
- **ELK Stack** - Logging and analytics

## 📚 API Documentation

### 🌐 Swagger Documentation

Interactive API documentation is available at:
- **API Gateway**: http://localhost:3000/docs
- **Auth Service**: http://localhost:3001/docs

### 🔐 Authentication

The platform uses JWT-based authentication with access and refresh tokens.

#### Register a new user
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123",
    "username": "newuser",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

#### Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123"
  }'
```

### 📝 API Usage Examples

#### Create a post
```bash
curl -X POST http://localhost:3000/posts \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Hello ShareUpTime! 🚀",
    "hashtags": ["socialmedia", "tech"],
    "location": {
      "latitude": 40.7128,
      "longitude": -74.0060,
      "name": "New York, NY"
    }
  }'
```

#### Get user timeline
```bash
curl -X GET "http://localhost:3000/feed?limit=20&offset=0" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### Upload media
```bash
curl -X POST http://localhost:3000/media/upload \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "file=@image.jpg" \
  -F "type=image"
```

### 🚦 Rate Limiting

The API implements intelligent rate limiting:

- **General API**: 100 requests per 15 minutes
- **Authentication**: 5 attempts per 15 minutes
- **Read operations**: 200 requests per 5 minutes  
- **Write operations**: 30 requests per 10 minutes
- **Media uploads**: 10 uploads per hour

### 📨 Postman Collection

Import the provided Postman collection for easy API testing:
- Collection: `postman/ShareUpTime-API-Collection.json`
- Environment: `postman/ShareUpTime-Environment.json`

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run specific test file
npx jest __tests__/auth-validation.test.js
```

### Test Coverage

Current test coverage is tracked and reported in CI/CD pipeline. Coverage reports are available at:
- Local: `coverage/lcov-report/index.html`
- Online: [Codecov Dashboard](https://codecov.io/gh/ruhaverse/shareuptime-social-platform)

## 📊 Monitoring & Logging

### 📈 Centralized Logging

The platform implements structured logging across all services:

```javascript
// Example logging usage
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/app.log' })
  ]
});

// Usage
logger.info('User logged in', { userId: '123', email: 'user@example.com' });
logger.error('Database connection failed', { error: error.message });
```

### 🔐 Secrets Management

#### Environment Variables

Use environment variables for all sensitive configuration:

```bash
# .env file (never commit to version control)
JWT_SECRET=your-super-secure-jwt-secret-key
POSTGRES_PASSWORD=secure-database-password
REDIS_PASSWORD=secure-redis-password
```

#### Production Secrets

For production deployments, use secure secret management:

- **Docker Swarm**: Docker secrets
- **Kubernetes**: Kubernetes secrets or external providers (HashiCorp Vault)
- **Cloud**: AWS Secrets Manager, Azure Key Vault, GCP Secret Manager

```yaml
# Example Kubernetes secret
apiVersion: v1
kind: Secret
metadata:
  name: shareuptime-secrets
type: Opaque
data:
  jwt-secret: <base64-encoded-secret>
  postgres-password: <base64-encoded-password>
```

#### Security Best Practices

1. **Never commit secrets** to version control
2. **Rotate secrets regularly** (especially in production)
3. **Use least privilege access** for service accounts
4. **Monitor secret access** and usage
5. **Encrypt secrets at rest** and in transit

### 🔍 Health Monitoring

All services expose health check endpoints:

```bash
# API Gateway health
curl http://localhost:3000/health

# Individual service health
curl http://localhost:3001/health  # Auth Service
curl http://localhost:3002/health  # User Service
```

### 📊 Metrics

Prometheus metrics are available at `/metrics` endpoints:

```bash
curl http://localhost:3001/metrics
```

## 🔧 Input Validation

The platform implements comprehensive input validation:

### Joi Validation (Preferred)
```javascript
const schema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required()
});
```

### Express Validator
```javascript
const { body } = require('express-validator');

const validateUser = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
];
```

## 🚀 Deployment

### Development
```bash
docker-compose up -d --build
```

### Production
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### CI/CD Pipeline

The project includes GitHub Actions workflow for:
- ✅ Automated testing
- 📊 Code coverage reporting
- 🔍 Security scanning
- 🐳 Docker image building
- 🚀 Deployment automation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Ensure tests pass: `npm test`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📧 Email: dev@shareuptime.com
- 🐛 Issues: [GitHub Issues](https://github.com/ruhaverse/shareuptime-social-platform/issues)
- 📖 Documentation: [API Docs](http://localhost:3000/docs)
- 💬 Community: [Discussions](https://github.com/ruhaverse/shareuptime-social-platform/discussions)
