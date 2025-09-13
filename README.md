# 🚀 ShareUpTime - Next-Generation Social Media Platform

Modern, ölçeklenebilir sosyal medya platformu. Mikroservis mimarisi, gerçek zamanlı etkileşimler ve çapraz platform desteği ile geliştirilmiştir.

## 📋 İçindekiler
- [🏗️ Proje Yapısı](#️-proje-yapısı)
- [🚀 Hızlı Başlangıç](#-hızlı-başlangıç)
- [🔧 Geliştirme Ortamı](#-geliştirme-ortamı)
- [📱 Uygulamalar](#-uygulamalar)
- [🏛️ Mimari](#️-mimari)
- [🔌 API Dokümantasyonu](#-api-dokümantasyonu)
- [🐛 Sorun Giderme](#-sorun-giderme)
- [🤝 Katkıda Bulunma](#-katkıda-bulunma)

## ✨ Özellikler
- 🔐 JWT tabanlı güvenli kimlik doğrulama
- 📱 Responsive web arayüzü (Next.js 15)
- 📲 Cross-platform mobil uygulama (React Native)
- 🏗️ Mikroservis mimarisi
- 🔄 Real-time bildirimler
- 📊 Monitoring ve logging
- 🐳 Docker containerization
- 🌐 Modern Türkçe arayüz

## 📋 Table of Contents

- [🏗️ Project Structure](#️-project-structure)
- [🚀 Quick Start](#-quick-start)
- [🔧 Development Setup](#-development-setup)
- [📱 Applications](#-applications)
- [🏛️ Architecture](#️-architecture)
- [🔌 API Documentation](#-api-documentation)
- [🐛 Troubleshooting](#-troubleshooting)
- [🤝 Contributing](#-contributing)

## 🏗️ Project Structure

```
shareuptime-social-platform/
├── 🖥️  shareuptime-frontend/     # Next.js Web Application
├── 📱 ShareUpTimeMobile/         # React Native Mobile App
├── 🔧 services/                  # Backend Microservices
│   ├── api-gateway/             # Main API Gateway (Port 3000)
│   ├── auth-service/            # Authentication Service (Port 3001)
│   ├── user-service/            # User Management (Port 3002)
│   ├── post-service/            # Content Management (Port 3003)
│   ├── feed-service/            # Timeline Generation (Port 3004)
│   ├── media-service/           # File Upload/Processing (Port 3005)
│   └── notification-service/    # Real-time Notifications (Port 3006)
├── 🗄️  db/                      # Database Configurations
├── 📊 monitoring/               # Prometheus & Grafana Config
├── 🧪 acceptance-tests/         # End-to-end Tests
├── 📜 scripts/                  # Utility Scripts
└── 🐳 docker-compose.yml       # Development Environment
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** ≥ 18.0.0
- **Docker** ≥ 20.0.0
- **Docker Compose** ≥ 2.0.0
- **Git**

### 1️⃣ Clone & Setup
```bash
git clone https://github.com/ruhaverse/shareuptime-social-platform.git
cd shareuptime-social-platform
cp .env.example .env
```

### 2️⃣ Start Backend Services
```bash
# Start all microservices and databases
npm run dev

# Or start in detached mode
npm start
```

### 3️⃣ Start Frontend Applications
```bash
# Web Application (Next.js)
cd shareuptime-frontend
npm install
npm run dev
# Access: http://localhost:3000

# Mobile Application (React Native)
cd ShareUpTimeMobile
npm install
npx react-native start
npx react-native run-android  # or run-ios
```

### 4️⃣ Verify Installation
```bash
# Check backend health
curl http://localhost:3000/health

# Run tests
npm test
```

## 🔧 Development Setup

### Backend Development
```bash
# Start specific service for development
cd services/auth-service
npm run dev

# View logs
npm run logs

# Stop all services
npm run stop
```

### Frontend Development
```bash
# Web App Development
cd shareuptime-frontend
npm run dev        # Development server
npm run build      # Production build
npm run lint       # Code linting

# Mobile App Development
cd ShareUpTimeMobile
npm run android    # Android development
npm run ios        # iOS development (macOS only)
```

## 📱 Applications

### 🖥️ Web Application (Next.js)
- **Framework**: Next.js 15 + TypeScript
- **Styling**: Tailwind CSS
- **Features**: Responsive design, SSR, PWA support
- **Port**: http://localhost:3000

### 📱 Mobile Application (React Native)
- **Framework**: React Native CLI + TypeScript
- **Navigation**: React Navigation 6
- **Features**: Cross-platform, native performance
- **Platforms**: Android, iOS

## 🏛️ Architecture

### Microservices
| Service | Port | Technology | Purpose |
|---------|------|------------|---------|
| **API Gateway** | 3000 | Express.js | Request routing, authentication |
| **Auth Service** | 3001 | Express.js + JWT | User authentication, sessions |
| **User Service** | 3002 | Express.js + Neo4j | User profiles, social graph |
| **Post Service** | 3003 | Express.js + MongoDB | Content creation, management |
| **Feed Service** | 3004 | Express.js + Redis | Timeline generation, caching |
| **Media Service** | 3005 | Express.js + MinIO | File upload, processing |
| **Notification Service** | 3006 | Express.js + Kafka | Real-time notifications |

### Databases & Infrastructure
| Component | Technology | Purpose |
|-----------|------------|---------|
| **PostgreSQL** | Port 5432 | Structured data (users, metadata) |
| **MongoDB Atlas** | Cloud | Flexible content storage |
| **Neo4j** | Port 7474/7687 | Social graph, recommendations |
| **Redis** | Port 6379 | Caching, session storage |
| **Elasticsearch** | Port 9200 | Search indexing |
| **MinIO** | Port 9000/9001 | Object storage (media files) |
| **Kafka + Zookeeper** | Port 9092/2181 | Event streaming |
| **Prometheus** | Port 9090 | Metrics collection |
| **Grafana** | Port 3007 | Monitoring dashboards |

## 🔌 API Documentation

### Authentication Endpoints
```http
POST /auth/register    # User registration
POST /auth/login       # User login
POST /auth/logout      # User logout
POST /auth/refresh     # Refresh JWT token
```

### User Management
```http
GET    /users/profile/:id    # Get user profile
PUT    /users/profile        # Update profile
POST   /users/follow/:id     # Follow user
DELETE /users/unfollow/:id   # Unfollow user
GET    /users/followers/:id  # Get followers
GET    /users/following/:id  # Get following
```

### Content Management
```http
POST   /posts              # Create post
GET    /posts/:id          # Get post
PUT    /posts/:id          # Update post
DELETE /posts/:id          # Delete post
POST   /posts/:id/like     # Like post
POST   /posts/:id/comment  # Comment on post
```

### Feed & Timeline
```http
GET /feed                 # Get personalized feed
GET /feed/trending        # Get trending posts
GET /feed/explore         # Explore new content
```

### Media Upload
```http
POST /media/upload        # Upload media file
GET  /media/:id          # Get media file
DELETE /media/:id        # Delete media file
```

## 🐛 Troubleshooting

### Common Issues

#### 🔴 MongoDB Connection Issues
```bash
# Check if using correct MongoDB Atlas connection
grep -r "mongodb://" services/
# Should show Atlas connection string, not localhost

# Fix: Update connection string in services
MONGODB_URI=mongodb+srv://shareuptime:shareuptime@shareuptime.mongodb.net/shareuptime
```

#### 🔴 Redis Connection Issues
```bash
# Check Redis client configuration
grep -r "createClient" services/
# Should use URL format, not host/port

# Fix: Update Redis client initialization
const redis = require('redis');
const client = redis.createClient({ url: 'redis://redis:6379' });
```

#### 🔴 Docker Container Issues
```bash
# Check container status
docker-compose ps

# View service logs
docker-compose logs -f [service-name]

# Restart specific service
docker-compose restart [service-name]

# Clean rebuild
docker-compose down
docker-compose up --build
```

#### 🔴 Port Conflicts
```bash
# Check port usage
netstat -tulpn | grep :3000

# Kill process using port
kill -9 $(lsof -t -i:3000)
```

### Development Commands
```bash
# Backend
npm run dev          # Start all services in development
npm run logs         # View all service logs
npm run stop         # Stop all services
npm run test         # Run backend tests

# Frontend Web
cd shareuptime-frontend
npm run dev          # Development server
npm run build        # Production build

# Mobile App
cd ShareUpTimeMobile
npx react-native start                    # Start Metro bundler
npx react-native run-android             # Run on Android
npx react-native run-ios                 # Run on iOS
npx react-native log-android             # View Android logs
npx react-native log-ios                 # View iOS logs
```

### Health Checks
```bash
# Backend Services Health
curl http://localhost:3000/health         # API Gateway
curl http://localhost:3001/health         # Auth Service
curl http://localhost:3002/health         # User Service

# Database Connections
curl http://localhost:5432                # PostgreSQL
curl http://localhost:6379                # Redis
curl http://localhost:7474                # Neo4j Browser
curl http://localhost:9200                # Elasticsearch
```

## 🤝 Contributing

### Development Workflow
1. **Fork** the repository
2. **Create** feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** changes: `git commit -m 'Add amazing feature'`
4. **Push** to branch: `git push origin feature/amazing-feature`
5. **Open** Pull Request

### Code Standards
- **ESLint** for code linting
- **Prettier** for code formatting
- **TypeScript** for type safety
- **Jest** for testing

### Project Maintainers
- **Backend Services**: Focus on microservices architecture
- **Frontend Web**: Next.js application development
- **Mobile App**: React Native cross-platform development
- **DevOps**: Docker, monitoring, deployment

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/ruhaverse/shareuptime-social-platform/issues)
- **Discussions**: [GitHub Discussions](https://github.com/ruhaverse/shareuptime-social-platform/discussions)
- **Documentation**: [Wiki](https://github.com/ruhaverse/shareuptime-social-platform/wiki)

---

**Made with ❤️ by Ruhaverse Team**
