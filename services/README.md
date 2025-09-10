# 🔧 Backend Microservices

This directory contains all backend microservices for the ShareUpTime platform. Each service is independently deployable and follows microservices architecture principles.

## 🏗️ Services Overview

| Service | Port | Status | Dependencies | Purpose |
|---------|------|--------|--------------|---------|
| [API Gateway](./api-gateway/) | 3000 | ✅ Active | All Services | Request routing, authentication |
| [Auth Service](./auth-service/) | 3001 | ✅ Active | PostgreSQL, Redis | JWT authentication, sessions |
| [User Service](./user-service/) | 3002 | ✅ Active | Neo4j, PostgreSQL | User profiles, social graph |
| [Post Service](./post-service/) | 3003 | ✅ Active | MongoDB Atlas, PostgreSQL | Content management |
| [Feed Service](./feed-service/) | 3004 | ✅ Active | MongoDB Atlas, Redis | Timeline generation |
| [Media Service](./media-service/) | 3005 | ✅ Active | MinIO, PostgreSQL | File upload/processing |
| [Notification Service](./notification-service/) | 3006 | ✅ Active | Kafka, Redis | Real-time notifications |

## 🚀 Quick Commands

```bash
# Start all services
docker-compose up -d --build

# Start specific service
docker-compose up [service-name]

# View logs
docker-compose logs -f [service-name]

# Restart service
docker-compose restart [service-name]

# Stop all services
docker-compose down
```

## 🔍 Service Health Checks

```bash
# Check all services
curl http://localhost:3000/health  # API Gateway
curl http://localhost:3001/health  # Auth Service
curl http://localhost:3002/health  # User Service
curl http://localhost:3003/health  # Post Service
curl http://localhost:3004/health  # Feed Service
curl http://localhost:3005/health  # Media Service
curl http://localhost:3006/health  # Notification Service
```

## 🐛 Common Issues & Solutions

### 🔴 MongoDB Connection Issues
**Problem**: Services can't connect to MongoDB Atlas
```bash
# Check connection string in docker-compose.yml
grep MONGODB_URI docker-compose.yml

# Should show Atlas connection, not localhost:27017
MONGODB_URI=mongodb+srv://shareuptime:shareuptime@shareuptime.mongodb.net/shareuptime
```

### 🔴 Redis Connection Issues
**Problem**: Redis client using old v3 syntax
```bash
# Check Redis client code
grep -r "createClient" services/

# Fix: Use URL format instead of host/port
const client = redis.createClient({ url: 'redis://redis:6379' });
```

### 🔴 Service Discovery Issues
**Problem**: Services can't find each other
```bash
# Check Docker network
docker network ls
docker network inspect shareuptime-social-platform_shareuptime-network

# Verify service names in docker-compose.yml match connection strings
```

## 📊 Service Dependencies

```mermaid
graph TD
    A[API Gateway :3000] --> B[Auth Service :3001]
    A --> C[User Service :3002]
    A --> D[Post Service :3003]
    A --> E[Feed Service :3004]
    A --> F[Media Service :3005]
    A --> G[Notification Service :3006]
    
    B --> H[PostgreSQL :5432]
    B --> I[Redis :6379]
    
    C --> J[Neo4j :7687]
    C --> H
    
    D --> K[MongoDB Atlas]
    D --> H
    D --> L[Kafka :9092]
    
    E --> K
    E --> I
    E --> L
    
    F --> M[MinIO :9000]
    F --> H
    
    G --> L
    G --> I
```

## 🔧 Development Workflow

### Adding New Service
1. Create service directory: `services/new-service/`
2. Add `Dockerfile` and `package.json`
3. Update `docker-compose.yml`
4. Add service to API Gateway routes
5. Update this README

### Service Structure
```
service-name/
├── Dockerfile          # Container configuration
├── package.json        # Dependencies and scripts
├── index.js           # Main application file
├── routes/            # API route handlers
├── models/            # Data models
├── middleware/        # Custom middleware
├── config/            # Configuration files
└── tests/             # Unit and integration tests
```

## 🧪 Testing

```bash
# Run all service tests
npm test

# Test specific service
cd services/auth-service
npm test

# Integration tests
npm run test:integration
```

## 📈 Monitoring

- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3007 (admin/admin)
- **Service Logs**: `docker-compose logs -f [service-name]`

## 🔐 Environment Variables

Each service uses environment variables for configuration:

```env
# Database connections
POSTGRES_HOST=postgres
MONGODB_URI=mongodb+srv://...
NEO4J_URI=bolt://neo4j:7687
REDIS_HOST=redis

# External services
KAFKA_BROKERS=kafka:9092
MINIO_ENDPOINT=minio

# Application settings
NODE_ENV=development
JWT_SECRET=your-secret-key
```

## 📚 API Documentation

Each service exposes its own API documentation:
- Swagger UI available at `http://localhost:[port]/docs`
- OpenAPI specs in each service's `/docs` directory

## 🤝 Contributing

1. Follow the existing service structure
2. Add proper error handling and logging
3. Include unit tests for new features
4. Update API documentation
5. Test with Docker Compose before submitting PR

---

For service-specific documentation, check the README in each service directory.
