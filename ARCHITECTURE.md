# 🏛️ ShareUpTime - Sistem Mimarisi

## 📋 Genel Bakış

ShareUpTime, modern mikroservis mimarisi ile geliştirilmiş, ölçeklenebilir sosyal medya platformudur.

## 🔧 Mikroservis Yapısı

### Frontend Uygulamaları
- **Web App**: Next.js 15 + TypeScript + Tailwind CSS (Port 3000)
- **Mobile App**: React Native + TypeScript (Android/iOS)

### Backend Mikroservisler
| Servis | Port | Teknoloji | Amaç |
|--------|------|-----------|------|
| **API Gateway** | 3000 | Express.js | Request routing, authentication |
| **Auth Service** | 3001 | Express.js + JWT | Kimlik doğrulama, oturum yönetimi |
| **User Service** | 3002 | Express.js + Neo4j | Kullanıcı profilleri, sosyal graf |
| **Post Service** | 3003 | Express.js + MongoDB | İçerik oluşturma, yönetimi |
| **Feed Service** | 3004 | Express.js + Redis | Timeline oluşturma, önbellekleme |
| **Media Service** | 3005 | Express.js + MinIO | Dosya yükleme, işleme |
| **Notification Service** | 3006 | Express.js + Kafka | Gerçek zamanlı bildirimler |

### Veritabanları & Altyapı
| Bileşen | Teknoloji | Port | Amaç |
|---------|-----------|------|------|
| **PostgreSQL** | PostgreSQL 15 | 5432 | Yapılandırılmış veri (kullanıcılar, metadata) |
| **MongoDB Atlas** | MongoDB Cloud | - | Esnek içerik depolama |
| **Neo4j** | Neo4j Community | 7474/7687 | Sosyal graf, öneriler |
| **Redis** | Redis 7 | 6379 | Önbellekleme, oturum depolama |
| **Elasticsearch** | Elasticsearch 8 | 9200 | Arama indeksleme |
| **MinIO** | MinIO | 9000/9001 | Nesne depolama (medya dosyaları) |
| **Kafka** | Apache Kafka | 9092 | Olay akışı |
| **Zookeeper** | Apache Zookeeper | 2181 | Kafka koordinasyonu |
| **Prometheus** | Prometheus | 9090 | Metrik toplama |
| **Grafana** | Grafana | 3007 | İzleme panoları |

## 🔄 Veri Akışı

### 1. Kullanıcı Kaydı/Girişi
```
Client → API Gateway → Auth Service → PostgreSQL
                    ↓
                JWT Token → Client
```

### 2. İçerik Oluşturma
```
Client → API Gateway → Post Service → MongoDB Atlas
                    ↓
                Feed Service → Redis (Cache Update)
                    ↓
                Notification Service → Kafka → Real-time Updates
```

### 3. Medya Yükleme
```
Client → API Gateway → Media Service → MinIO
                    ↓
                Post Service → MongoDB (Media Reference)
```

### 4. Sosyal Etkileşimler
```
Client → API Gateway → User Service → Neo4j
                    ↓
                Feed Service → Algorithm Update
```

## 🔐 Güvenlik Mimarisi

### Kimlik Doğrulama
- **JWT Tokens**: Stateless authentication
- **Refresh Tokens**: Secure token renewal
- **Rate Limiting**: API abuse prevention

### Veri Güvenliği
- **HTTPS**: End-to-end encryption
- **Input Validation**: SQL injection prevention
- **CORS**: Cross-origin request control

## 📊 İzleme & Logging

### Metrikler
- **Prometheus**: Sistem metrikleri
- **Grafana**: Görsel panolar
- **Health Checks**: Servis durumu kontrolü

### Logging
- **Centralized Logging**: Tüm servislerde yapılandırılmış loglar
- **Error Tracking**: Hata izleme ve raporlama
- **Performance Monitoring**: Performans metrikleri

## 🚀 Deployment Mimarisi

### Development
```
Docker Compose → Local Containers → Development Database
```

### Production
```
Kubernetes → Container Orchestration → Cloud Databases
```

## 🔧 Teknoloji Seçimleri

### Backend
- **Node.js**: Yüksek performans, async I/O
- **Express.js**: Minimal, esnek web framework
- **TypeScript**: Type safety, better development experience

### Frontend
- **Next.js**: SSR, optimized React framework
- **React Native**: Cross-platform mobile development
- **Tailwind CSS**: Utility-first CSS framework

### Databases
- **PostgreSQL**: ACID compliance, relational data
- **MongoDB**: Document storage, flexible schema
- **Neo4j**: Graph database, social connections
- **Redis**: In-memory caching, session storage

## 📈 Ölçeklenebilirlik

### Horizontal Scaling
- **Mikroservisler**: Bağımsız ölçeklendirme
- **Load Balancing**: Trafik dağıtımı
- **Database Sharding**: Veri dağıtımı

### Performance Optimization
- **Caching Strategy**: Multi-level caching
- **CDN**: Static asset delivery
- **Database Indexing**: Query optimization

## 🌐 API Gateway Detayları

### Routing Stratejisi
```javascript
// API Gateway routing konfigürasyonu
const routes = {
  '/auth/*': 'http://auth-service:3001',
  '/users/*': 'http://user-service:3002',
  '/posts/*': 'http://post-service:3003',
  '/feed/*': 'http://feed-service:3004',
  '/media/*': 'http://media-service:3005',
  '/notifications/*': 'http://notification-service:3006'
};
```

### Middleware Stack
1. **CORS Handler**: Cross-origin request yönetimi
2. **Rate Limiter**: İstek sınırlama
3. **JWT Validator**: Token doğrulama
4. **Request Logger**: İstek loglama
5. **Error Handler**: Hata yönetimi

## 🔄 Event-Driven Architecture

### Kafka Event Streams
```
User Registration → user.created → [Feed Service, Notification Service]
Post Created → post.created → [Feed Service, User Service]
Like Added → post.liked → [Notification Service, Analytics]
Follow Action → user.followed → [Feed Service, Recommendation Engine]
```

### Event Processing
- **Asynchronous Processing**: Non-blocking operations
- **Event Sourcing**: Complete audit trail
- **CQRS Pattern**: Command Query Responsibility Segregation

## 🗄️ Veri Modelleri

### PostgreSQL (Auth & User Metadata)
```sql
-- Kullanıcı tablosu
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Oturum tablosu
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### MongoDB (Content Storage)
```javascript
// Post document yapısı
{
  _id: ObjectId,
  authorId: String,
  content: String,
  mediaUrls: [String],
  tags: [String],
  location: {
    name: String,
    coordinates: [Number] // [longitude, latitude]
  },
  engagement: {
    likes: Number,
    comments: Number,
    shares: Number
  },
  createdAt: Date,
  updatedAt: Date
}

// Comment document yapısı
{
  _id: ObjectId,
  postId: String,
  authorId: String,
  content: String,
  parentCommentId: String, // For nested comments
  createdAt: Date
}
```

### Neo4j (Social Graph)
```cypher
// Kullanıcı node yapısı
CREATE (u:User {
  id: 'user_uuid',
  username: 'kullanici_adi',
  joinDate: datetime()
})

// Takip ilişkisi
CREATE (u1:User)-[:FOLLOWS {since: datetime()}]->(u2:User)

// Beğeni ilişkisi
CREATE (u:User)-[:LIKES {timestamp: datetime()}]->(p:Post)

// Arkadaşlık ilişkisi
CREATE (u1:User)-[:FRIENDS_WITH {since: datetime()}]->(u2:User)
```

### Redis (Caching & Sessions)
```javascript
// Cache key patterns
user:profile:{userId}     // Kullanıcı profil cache
feed:timeline:{userId}    // Kullanıcı timeline cache
post:engagement:{postId}  // Post engagement metrics
trending:posts:{timeframe} // Trending posts cache

// Session storage
session:{sessionId} = {
  userId: 'uuid',
  loginTime: timestamp,
  lastActivity: timestamp,
  permissions: ['read', 'write']
}
```

## 🔍 Arama Mimarisi (Elasticsearch)

### Index Yapısı
```javascript
// Posts index
{
  "mappings": {
    "properties": {
      "content": {
        "type": "text",
        "analyzer": "turkish"
      },
      "tags": {
        "type": "keyword"
      },
      "authorId": {
        "type": "keyword"
      },
      "location": {
        "type": "geo_point"
      },
      "createdAt": {
        "type": "date"
      },
      "engagement": {
        "type": "nested",
        "properties": {
          "likes": {"type": "integer"},
          "comments": {"type": "integer"}
        }
      }
    }
  }
}

// Users index
{
  "mappings": {
    "properties": {
      "username": {
        "type": "text",
        "analyzer": "standard"
      },
      "firstName": {
        "type": "text",
        "analyzer": "turkish"
      },
      "lastName": {
        "type": "text",
        "analyzer": "turkish"
      },
      "bio": {
        "type": "text",
        "analyzer": "turkish"
      }
    }
  }
}
```

## 📊 Monitoring & Observability

### Prometheus Metrics
```yaml
# Custom metrics
shareuptime_requests_total{service="api-gateway", method="GET", status="200"}
shareuptime_request_duration_seconds{service="auth-service"}
shareuptime_active_users_total
shareuptime_posts_created_total
shareuptime_database_connections{service="user-service", database="postgresql"}
```

### Grafana Dashboards
1. **System Overview**: CPU, Memory, Network
2. **API Performance**: Request rates, response times
3. **Business Metrics**: User engagement, content creation
4. **Error Tracking**: Error rates, failed requests

### Health Check Endpoints
```javascript
// Health check response format
{
  "status": "healthy" | "unhealthy",
  "service": "service-name",
  "version": "1.0.0",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": "2h 30m 15s",
  "dependencies": {
    "database": "healthy",
    "redis": "healthy",
    "external_api": "degraded"
  },
  "metrics": {
    "memory_usage": "45%",
    "cpu_usage": "12%",
    "active_connections": 150
  }
}
```

## 🔒 Güvenlik Detayları

### JWT Token Yapısı
```javascript
// JWT Payload
{
  "sub": "user_uuid",           // Subject (User ID)
  "username": "kullanici_adi",  // Username
  "email": "user@example.com",  // Email
  "roles": ["user", "premium"], // User roles
  "permissions": ["read", "write"], // Permissions
  "iat": 1640995200,           // Issued at
  "exp": 1641081600,           // Expires at
  "iss": "shareuptime-auth",   // Issuer
  "aud": "shareuptime-api"     // Audience
}
```

### Rate Limiting Strategy
```javascript
// Rate limit konfigürasyonu
const rateLimits = {
  '/auth/login': {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
    message: 'Çok fazla giriş denemesi'
  },
  '/auth/register': {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 registrations per hour per IP
    message: 'Çok fazla kayıt denemesi'
  },
  '/api/*': {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: 'Rate limit aşıldı'
  }
};
```

## 🚀 Deployment Stratejisi

### Docker Compose (Development)
```yaml
version: '3.8'
services:
  api-gateway:
    build: ./services/api-gateway
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
    depends_on:
      - auth-service
      - user-service
  
  auth-service:
    build: ./services/auth-service
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=${POSTGRES_URI}
      - REDIS_URL=${REDIS_URL}
    depends_on:
      - postgres
      - redis
```

### Kubernetes (Production)
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-gateway
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api-gateway
  template:
    metadata:
      labels:
        app: api-gateway
    spec:
      containers:
      - name: api-gateway
        image: shareuptime/api-gateway:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

## 📱 Frontend Architecture

### Next.js Web App Structure
```
shareuptime-frontend/
├── src/
│   ├── app/                 # App Router (Next.js 13+)
│   │   ├── (auth)/         # Route groups
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── feed/
│   │   ├── profile/
│   │   └── layout.tsx
│   ├── components/         # Reusable components
│   │   ├── ui/            # Base UI components
│   │   ├── forms/         # Form components
│   │   └── layout/        # Layout components
│   ├── lib/               # Utilities
│   │   ├── api.ts         # API client
│   │   ├── auth.ts        # Auth utilities
│   │   └── utils.ts       # General utilities
│   └── types/             # TypeScript types
├── public/                # Static assets
└── tailwind.config.js     # Tailwind configuration
```

### React Native Mobile App Structure
```
ShareUpTimeMobile/
├── src/
│   ├── screens/           # Screen components
│   │   ├── AuthScreens/
│   │   ├── FeedScreens/
│   │   └── ProfileScreens/
│   ├── components/        # Reusable components
│   ├── navigation/        # Navigation configuration
│   ├── services/          # API services
│   ├── hooks/            # Custom hooks
│   ├── utils/            # Utilities
│   └── types/            # TypeScript types
├── android/              # Android specific code
├── ios/                  # iOS specific code
└── package.json
```

---

Bu mimari dokümantasyonu ShareUpTime platformunun teknik altyapısını detaylı şekilde açıklamaktadır. Daha fazla bilgi için [GitHub Repository](https://github.com/ruhaverse/shareuptime-social-platform) ziyaret edebilirsiniz.
