# ShareUpTime - Next-Generation Social Media Platform

## Architecture Overview

ShareUpTime is a microservices-based social media platform designed for scalability and real-time interactions.

### Services
- **API Gateway** (Port 3000) - Request routing and authentication
- **Auth Service** (Port 3001) - JWT authentication and user sessions
- **User Service** (Port 3002) - User profiles and social graph (Neo4j)
- **Post Service** (Port 3003) - Content creation and management (MongoDB + PostgreSQL)
- **Feed Service** (Port 3004) - Timeline generation and caching (Redis)
- **Media Service** (Port 3005) - File upload and processing (MinIO)
- **Notification Service** (Port 3006) - Real-time notifications (Kafka)

### Databases
- **PostgreSQL** - Structured data (users, posts metadata)
- **MongoDB** - Flexible content storage (post content, comments)
- **Neo4j** - Social graph (follows, connections, recommendations)
- **Redis** - Caching and session storage
- **Elasticsearch** - Search indexing
- **MinIO** - Object storage (images, videos)

### Infrastructure
- **Kafka + Zookeeper** - Event streaming and messaging
- **Docker Compose** - Local development environment
- **Prometheus + Grafana** - Monitoring and metrics
- **ELK Stack** - Logging and analytics

## Quick Start

1. Copy environment configuration:
```bash
cp .env.example .env
```

2. Start all services:
```bash
docker-compose up -d --build
```

3. Verify services:
```bash
curl http://localhost:3000/health
```

4. Run tests:
```bash
npm test
```

## API Endpoints

### Greeting
- `GET /merhaba` - Turkish greeting with platform information
- `GET /hello` - Redirects to /merhaba  
- `GET /greeting` - Redirects to /merhaba

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/logout` - User logout

### Users
- `GET /users/profile/:id` - Get user profile
- `PUT /users/profile` - Update profile
- `POST /users/follow/:id` - Follow user
- `DELETE /users/unfollow/:id` - Unfollow user

### Posts
- `POST /posts` - Create post
- `GET /posts/:id` - Get post
- `PUT /posts/:id` - Update post
- `DELETE /posts/:id` - Delete post

### Feed
- `GET /feed` - Get user timeline
- `GET /feed/trending` - Get trending posts

### Media
- `POST /media/upload` - Upload media file
- `GET /media/:id` - Get media file

## Development

Each service is independently deployable and scalable. Services communicate via REST APIs and Kafka events for real-time updates.
