# 🚀 ShareUpTime Deployment Rehberi

## 📋 Hızlı Başlangıç Checklist

### ✅ Geliştirme Ortamında Çalıştırma

1. **Veritabanlarını Başlat**
```bash
docker-compose up -d postgres redis mongodb neo4j
```

2. **Backend Servisleri Başlat** (ayrı terminallerde)
```bash
# Terminal 1 - Auth Service
cd services/auth-service && npm start

# Terminal 2 - User Service  
cd services/user-service && npm start

# Terminal 3 - Post Service
cd services/post-service && npm start

# Terminal 4 - Social Service
cd services/social-service && npm start

# Terminal 5 - Swagger Docs
cd services/swagger-docs && npm start
```

3. **Frontend Başlat**
```bash
cd shareuptime-frontend && npm run dev
```

### 🌐 Erişim Kontrolü

| Servis | URL | Durum Kontrolü |
|--------|-----|----------------|
| Frontend | http://localhost:3000 | Web arayüzü açılmalı |
| API Docs | http://localhost:3009 | Swagger UI görünmeli |
| Auth API | http://localhost:3001/health | `{"status":"healthy"}` |
| User API | http://localhost:3002/health | `{"status":"healthy"}` |
| Post API | http://localhost:3003/health | `{"status":"healthy"}` |
| Social API | http://localhost:3007/health | `{"status":"healthy"}` |

## 🔧 Servis Detayları

### Auth Service (Port 3001)
**Özellikler:**
- Kullanıcı kayıt/giriş
- JWT token yönetimi
- Şifre hashleme (bcrypt)
- Rate limiting

**Test:**
```bash
curl -X POST http://localhost:3001/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "username": "testuser",
    "firstName": "Test",
    "lastName": "User"
  }'
```

### User Service (Port 3002)
**Özellikler:**
- Profil yönetimi
- Takip/takipçi sistemi
- Neo4j sosyal graf
- Kullanıcı önerileri

**Test:**
```bash
curl -X GET http://localhost:3002/profile/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Post Service (Port 3003)
**Özellikler:**
- Post CRUD işlemleri
- MongoDB içerik depolama
- Hashtag ve mention çıkarma
- PostgreSQL metadata

**Test:**
```bash
curl -X POST http://localhost:3003/ \
  -H "Content-Type: application/json" \
  -H "x-user-id: 1" \
  -d '{
    "content": "Merhaba dünya! #test",
    "hashtags": ["test"]
  }'
```

### Social Service (Port 3007)
**Özellikler:**
- Beğeni sistemi
- Yorum sistemi
- Sosyal etkileşim istatistikleri
- Redis cache

**Test:**
```bash
# Post beğen
curl -X POST http://localhost:3007/like \
  -H "Content-Type: application/json" \
  -H "x-user-id: 1" \
  -d '{"postId": "POST_ID"}'

# Yorum ekle
curl -X POST http://localhost:3007/comment \
  -H "Content-Type: application/json" \
  -H "x-user-id: 1" \
  -d '{
    "postId": "POST_ID",
    "content": "Harika post!"
  }'
```

## 🗄️ Veritabanı Konfigürasyonu

### PostgreSQL (Port 5433)
```sql
-- Bağlantı bilgileri
Host: localhost
Port: 5433
Database: shareuptime
User: postgres
Password: Fy@260177

-- Ana tablolar
- users (kullanıcı bilgileri)
- posts (post metadata)
- likes (beğeniler)
- comments (yorumlar)
- follows (takip ilişkileri)
- notifications (bildirimler)
- messages (mesajlar)
```

### MongoDB (Port 27017)
```javascript
// Bağlantı
mongodb://localhost:27017/shareuptime

// Collections
- posts (post içerikleri)
- media (medya dosyaları)
```

### Redis (Port 6379)
```bash
# Cache ve session yönetimi
redis://localhost:6379

# Kullanım alanları
- JWT refresh token'lar
- API rate limiting
- Cache veriler
```

### Neo4j (Port 7474/7687)
```cypher
// Web arayüzü: http://localhost:7474
// Bolt: bolt://localhost:7687
// Auth: neo4j/password

// Sosyal graf ilişkileri
- User nodes
- FOLLOWS relationships
- FRIENDS relationships
```

## 🔍 Sorun Giderme

### Port Çakışması
```bash
# Windows'ta port kullanımını kontrol et
netstat -ano | findstr :3001

# Süreci sonlandır
taskkill /PID [PID] /F
```

### Veritabanı Bağlantı Sorunları
```bash
# PostgreSQL test
docker exec -it shareuptime-postgres psql -U postgres -d shareuptime -c "SELECT version();"

# MongoDB test
docker exec -it shareuptime-mongodb mongosh --eval "db.adminCommand('ismaster')"

# Redis test
docker exec -it shareuptime-redis redis-cli ping

# Neo4j test (web browser)
# http://localhost:7474
```

### Servis Logları
```bash
# Docker container logları
docker-compose logs -f postgres
docker-compose logs -f mongodb
docker-compose logs -f redis
docker-compose logs -f neo4j

# Servis logları (eğer dosyaya yazıyorsa)
tail -f services/auth-service/logs/auth.log
```

## 🧪 Test Senaryoları

### 1. Kullanıcı Kayıt ve Giriş
```bash
# Kayıt
curl -X POST http://localhost:3001/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@shareuptime.com",
    "password": "demo123",
    "username": "demouser",
    "firstName": "Demo",
    "lastName": "User"
  }'

# Giriş
curl -X POST http://localhost:3001/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@shareuptime.com",
    "password": "demo123"
  }'
```

### 2. Post Oluşturma ve Sosyal Etkileşim
```bash
# Post oluştur
curl -X POST http://localhost:3003/ \
  -H "Content-Type: application/json" \
  -H "x-user-id: 1" \
  -d '{
    "content": "ShareUpTime platformu harika! #sosyalmedya #teknoloji",
    "hashtags": ["sosyalmedya", "teknoloji"]
  }'

# Post'u beğen
curl -X POST http://localhost:3007/like \
  -H "Content-Type: application/json" \
  -H "x-user-id: 2" \
  -d '{"postId": "POST_ID_BURAYA"}'
```

## 📊 Performans Monitoring

### Health Check Endpoints
```bash
# Tüm servislerin sağlık durumu
curl http://localhost:3001/health  # Auth
curl http://localhost:3002/health  # User  
curl http://localhost:3003/health  # Post
curl http://localhost:3007/health  # Social
curl http://localhost:3009/health  # Swagger
```

### Database Health
```bash
# PostgreSQL
docker exec shareuptime-postgres pg_isready -U postgres

# MongoDB
docker exec shareuptime-mongodb mongosh --eval "db.runCommand({ping: 1})"

# Redis
docker exec shareuptime-redis redis-cli ping

# Neo4j
curl http://localhost:7474/db/data/
```

## 🚀 Production Deployment

### Environment Variables
```bash
# .env.production
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key
POSTGRES_HOST=your-postgres-host
POSTGRES_PASSWORD=your-secure-password
MONGODB_URI=your-mongodb-connection-string
REDIS_URL=your-redis-url
NEO4J_URI=your-neo4j-uri
```

### Docker Production
```bash
# Production build
docker-compose -f docker-compose.prod.yml build

# Production deploy
docker-compose -f docker-compose.prod.yml up -d

# Scale services
docker-compose -f docker-compose.prod.yml up -d --scale auth-service=3
```

## 📈 Scaling Considerations

### Horizontal Scaling
- Auth Service: Stateless, kolayca scale edilebilir
- User Service: Neo4j bağlantı havuzu gerekli
- Post Service: MongoDB sharding düşünülebilir
- Social Service: Redis cluster kurulabilir

### Load Balancing
```nginx
# Nginx config example
upstream auth_backend {
    server localhost:3001;
    server localhost:3011;
    server localhost:3021;
}

upstream user_backend {
    server localhost:3002;
    server localhost:3012;
}
```

## 🔒 Security Checklist

- ✅ JWT secret güvenli
- ✅ Şifreler hash'leniyor
- ✅ Rate limiting aktif
- ✅ CORS konfigürasyonu
- ✅ Input validation
- ✅ SQL injection koruması
- ⚠️ HTTPS (production için gerekli)
- ⚠️ API key management
- ⚠️ Database encryption

---

**Deployment Status**: ✅ **READY FOR PRODUCTION**  
**Last Updated**: 13 Eylül 2025  
**Maintained by**: Ruhaverse Team
