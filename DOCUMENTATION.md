# 📚 ShareUpTime - Proje Dokümantasyonu

## 🎯 Proje Genel Bakış

ShareUpTime, modern mikroservis mimarisi ile geliştirilmiş yeni nesil sosyal medya platformudur. Kullanıcıların anılarını paylaşabileceği, arkadaşlarıyla bağlantıda kalabileceği ve gerçek zamanlı etkileşimde bulunabileceği kapsamlı bir platform sunar.

## 🏗️ Teknik Mimari

### Backend Mikroservisleri
```
📦 services/
├── 🌐 api-gateway/          # Ana API Gateway (Port 3000)
├── 🔐 auth-service/         # Kimlik Doğrulama (Port 3001)
├── 👤 user-service/         # Kullanıcı Yönetimi (Port 3002)
├── 📝 post-service/         # İçerik Yönetimi (Port 3003)
├── 📰 feed-service/         # Ana Akış (Port 3004)
├── 📁 media-service/        # Medya İşleme (Port 3005)
└── 🔔 notification-service/ # Bildirimler (Port 3006)
```

### Frontend Uygulamaları
```
📦 Frontend/
├── 🖥️ shareuptime-frontend/  # Next.js Web Uygulaması
├── 📱 ShareUpTimeMobile/     # React Native Mobil App
└── 🌐 simple-frontend/       # Demo HTML/JS Uygulaması
```

### Veritabanları ve Altyapı
| Teknoloji | Port | Kullanım Alanı |
|-----------|------|----------------|
| PostgreSQL | 5432 | Yapısal veriler (kullanıcılar, metadata) |
| MongoDB Atlas | Cloud | Esnek içerik depolama |
| Neo4j | 7474/7687 | Sosyal graf, öneriler |
| Redis | 6379 | Önbellekleme, oturum depolama |
| Elasticsearch | 9200 | Arama indeksleme |
| MinIO | 9000/9001 | Nesne depolama (medya dosyaları) |
| Kafka | 9092 | Event streaming |
| Prometheus | 9090 | Metrik toplama |
| Grafana | 3007 | Monitoring dashboard |

## 🚀 Kurulum Rehberi

### Ön Gereksinimler
- **Node.js** ≥ 18.0.0
- **Docker** ≥ 20.0.0
- **Docker Compose** ≥ 2.0.0
- **Git**

### 1️⃣ Projeyi Klonlama
```bash
git clone https://github.com/ruhaverse/shareuptime-social-platform.git
cd shareuptime-social-platform
```

### 2️⃣ Environment Konfigürasyonu
```bash
cp .env.example .env
# .env dosyasını düzenleyin
```

### 3️⃣ Backend Servislerini Başlatma

#### Docker ile (Önerilen)
```bash
# Tüm servisleri başlat
docker-compose up -d

# Logları görüntüle
docker-compose logs -f

# Servisleri durdur
docker-compose down
```

#### Manuel Kurulum
```bash
# API Gateway
cd services/api-gateway
npm install
npm start

# Auth Service
cd ../auth-service
npm install
node simple-auth.js
```

### 4️⃣ Frontend Uygulamalarını Başlatma

#### Web Uygulaması (Next.js)
```bash
cd shareuptime-frontend
npm install
npm run dev
# Erişim: http://localhost:3000
```

#### Demo Uygulaması
```bash
# Basit HTML/JS demo
start simple-frontend/index.html
```

#### Mobil Uygulama (React Native)
```bash
cd ShareUpTimeMobile
npm install
npx react-native start
npx react-native run-android  # Android için
npx react-native run-ios      # iOS için (macOS gerekli)
```

## 🔌 API Endpoints

### Kimlik Doğrulama
```http
POST /auth/register    # Kullanıcı kaydı
POST /auth/login       # Kullanıcı girişi
POST /auth/logout      # Çıkış
GET  /auth/health      # Servis durumu
```

### Kullanıcı Yönetimi
```http
GET    /users/profile/:id    # Kullanıcı profili
PUT    /users/profile        # Profil güncelleme
POST   /users/follow/:id     # Takip et
DELETE /users/unfollow/:id   # Takibi bırak
```

### İçerik Yönetimi
```http
POST   /posts              # Gönderi oluştur
GET    /posts/:id          # Gönderi getir
PUT    /posts/:id          # Gönderi güncelle
DELETE /posts/:id          # Gönderi sil
POST   /posts/:id/like     # Beğen
POST   /posts/:id/comment  # Yorum yap
```

### Ana Akış
```http
GET /feed                 # Kişiselleştirilmiş akış
GET /feed/trending        # Trend gönderiler
GET /feed/explore         # Keşfet
```

## 🔧 Geliştirme

### Kod Standartları
- **ESLint** - Kod linting
- **Prettier** - Kod formatlama
- **TypeScript** - Tip güvenliği
- **Jest** - Test framework

### Geliştirme Komutları
```bash
# Backend
npm run dev          # Tüm servisleri geliştirme modunda başlat
npm run logs         # Servis loglarını görüntüle
npm run test         # Testleri çalıştır

# Frontend Web
npm run dev          # Geliştirme sunucusu
npm run build        # Production build
npm run lint         # Kod kontrolü

# Mobil App
npm run android      # Android geliştirme
npm run ios          # iOS geliştirme
```

## 🐛 Sorun Giderme

### Yaygın Sorunlar

#### MongoDB Bağlantı Sorunu
```bash
# MongoDB Atlas bağlantı stringini kontrol edin
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/shareuptime
```

#### Redis Bağlantı Sorunu
```bash
# Redis client konfigürasyonunu kontrol edin
const client = redis.createClient({ url: 'redis://redis:6379' });
```

#### Port Çakışması
```bash
# Port kullanımını kontrol edin
netstat -tulpn | grep :3000

# Portu kullanan işlemi sonlandırın
kill -9 $(lsof -t -i:3000)
```

#### Docker Container Sorunları
```bash
# Container durumunu kontrol edin
docker-compose ps

# Servisleri yeniden başlatın
docker-compose restart [service-name]

# Temiz rebuild
docker-compose down
docker-compose up --build
```

## 📊 Monitoring ve Logging

### Health Check Endpoints
```bash
curl http://localhost:3000/health         # API Gateway
curl http://localhost:3001/health         # Auth Service
curl http://localhost:3002/health         # User Service
```

### Monitoring Dashboard
- **Grafana**: http://localhost:3007
  - Kullanıcı: admin
  - Şifre: admin

### Log Dosyaları
```bash
# Servis logları
tail -f services/api-gateway/logs/gateway.log
tail -f services/auth-service/logs/auth.log

# Docker logları
docker-compose logs -f [service-name]
```

## 🔒 Güvenlik

### JWT Token Yönetimi
- Token süresi: 24 saat
- Refresh token desteği
- Güvenli HTTP-only cookies

### API Rate Limiting
- 15 dakikada 100 istek (genel)
- 15 dakikada 5 istek (auth endpoints)

### Veri Şifreleme
- Şifreler bcrypt ile hashlenir
- HTTPS zorunlu (production)
- Environment variables ile hassas bilgi yönetimi

## 🚀 Deployment

### Production Ortamı
```bash
# Production build
npm run build

# Docker production
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Variables
```env
NODE_ENV=production
JWT_SECRET=your-super-secret-key
MONGODB_URI=your-mongodb-connection
POSTGRES_URI=your-postgres-connection
REDIS_URL=your-redis-connection
```

## 🤝 Katkıda Bulunma

### Geliştirme Süreci
1. Repository'yi fork edin
2. Feature branch oluşturun: `git checkout -b feature/amazing-feature`
3. Değişikliklerinizi commit edin: `git commit -m 'Add amazing feature'`
4. Branch'inizi push edin: `git push origin feature/amazing-feature`
5. Pull Request açın

### Kod İnceleme Süreci
- Tüm testler geçmeli
- Code coverage %80'in üzerinde olmalı
- ESLint kurallarına uygun olmalı
- Dokümantasyon güncellenmiş olmalı

## 📞 Destek

### İletişim Kanalları
- **Issues**: [GitHub Issues](https://github.com/ruhaverse/shareuptime-social-platform/issues)
- **Discussions**: [GitHub Discussions](https://github.com/ruhaverse/shareuptime-social-platform/discussions)
- **Wiki**: [Project Wiki](https://github.com/ruhaverse/shareuptime-social-platform/wiki)

### Proje Maintainers
- **Backend Services**: Mikroservis mimarisi geliştirme
- **Frontend Web**: Next.js uygulama geliştirme
- **Mobile App**: React Native cross-platform geliştirme
- **DevOps**: Docker, monitoring, deployment

---

**ShareUpTime** - Anılarınızı paylaşın, bağlantılarınızı güçlendirin! 🚀
