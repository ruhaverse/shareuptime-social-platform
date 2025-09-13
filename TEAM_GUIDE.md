# 👥 ShareUpTime Ekip Rehberi

## 🚀 Projeye Hızlı Başlangıç

### 📋 Önkoşullar
- Node.js 18+ 
- Docker Desktop
- Git
- VS Code (önerilen)

### 🔧 Kurulum Adımları

```bash
# 1. Projeyi klonla
git clone https://github.com/ruhaverse/shareuptime-social-platform.git
cd shareuptime-social-platform

# 2. Ana bağımlılıkları yükle
npm install

# 3. Docker servislerini başlat (veritabanları)
docker-compose up -d postgres redis mongodb neo4j

# 4. Servisleri sırayla başlat
cd services/auth-service && npm install && npm start &
cd services/user-service && npm install && npm start &
cd services/post-service && npm install && npm start &
cd services/social-service && npm install && npm start &
cd services/swagger-docs && npm install && npm start &

# 5. Frontend'i başlat
cd shareuptime-frontend && npm install && npm run dev
```

## 🌐 Erişim Noktaları

| Uygulama | URL | Açıklama |
|----------|-----|----------|
| **Frontend** | http://localhost:3000 | Ana web uygulaması |
| **API Docs** | http://localhost:3009 | Swagger dokümantasyonu |
| **Auth API** | http://localhost:3001 | Kimlik doğrulama servisi |
| **User API** | http://localhost:3002 | Kullanıcı yönetimi |
| **Post API** | http://localhost:3003 | İçerik yönetimi |
| **Social API** | http://localhost:3007 | Sosyal etkileşimler |

## 🏗️ Proje Yapısı

```
shareuptime-social-platform/
├── 🖥️ shareuptime-frontend/          # Next.js Web App
├── 🔧 services/                      # Backend Mikroservisler
│   ├── auth-service/                # ✅ JWT kimlik doğrulama
│   ├── user-service/                # ✅ Profil & sosyal graf
│   ├── post-service/                # ✅ İçerik CRUD
│   ├── social-service/              # ✅ Beğeni & yorum
│   ├── realtime-service/            # ✅ Socket.io canlı özellikler
│   ├── swagger-docs/                # ✅ API dokümantasyonu
│   └── test-suite/                  # ✅ Test paketleri
├── 🗄️ init-scripts/                  # Veritabanı şemaları
├── 🐳 docker-compose.yml            # Geliştirme ortamı
└── 📚 README.md                     # Ana dokümantasyon
```

## 🔥 Aktif Özellikler

### ✅ Tamamlanan Özellikler
- **Kullanıcı Sistemi**: Kayıt, giriş, JWT token yönetimi
- **Profil Yönetimi**: Kullanıcı profilleri, bio, avatar
- **İçerik Sistemi**: Post oluşturma, düzenleme, silme
- **Sosyal Özellikler**: Beğeni, yorum, takip sistemi
- **Real-time**: Socket.io altyapısı hazır
- **API Dokümantasyonu**: Swagger UI ile interaktif docs
- **Test Suite**: Jest ile kapsamlı testler

### 🚧 Geliştirme Devam Eden
- Kafka event streaming (opsiyonel)
- Real-time chat özellikleri
- Bildirim sistemi
- Media upload servisi

## 🛠️ Geliştirme Komutları

### Backend Servisler
```bash
# Tüm servisleri başlat
npm run dev

# Belirli bir servisi başlat
cd services/auth-service
npm run dev

# Servisleri durdur
docker-compose down
```

### Frontend
```bash
cd shareuptime-frontend
npm run dev        # Geliştirme sunucusu
npm run build      # Production build
npm run lint       # Kod kontrolü
```

### Testler
```bash
cd services/test-suite
npm test           # Tüm testleri çalıştır
npm run test:auth  # Sadece auth testleri
```

## 🗄️ Veritabanları

| Veritabanı | Port | Kullanım Alanı |
|------------|------|----------------|
| **PostgreSQL** | 5433 | Kullanıcı verileri, metadata |
| **MongoDB** | 27017 | Post içerikleri |
| **Redis** | 6379 | Cache, session |
| **Neo4j** | 7474/7687 | Sosyal graf |

### Veritabanı Bağlantıları
```javascript
// PostgreSQL
const pgPool = new Pool({
  host: 'localhost',
  port: 5433,
  database: 'shareuptime',
  user: 'postgres',
  password: 'Fy@260177'
});

// MongoDB
const mongoUri = 'mongodb://localhost:27017/shareuptime';

// Redis
const redisClient = redis.createClient({
  url: 'redis://localhost:6379'
});

// Neo4j
const neo4jDriver = neo4j.driver(
  'bolt://localhost:7687',
  neo4j.auth.basic('neo4j', 'password')
);
```

## 🔌 API Kullanımı

### Kimlik Doğrulama
```javascript
// Kayıt
POST /auth/register
{
  "email": "user@example.com",
  "password": "password123",
  "username": "username",
  "firstName": "Ad",
  "lastName": "Soyad"
}

// Giriş
POST /auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Post İşlemleri
```javascript
// Post oluştur
POST /posts
{
  "content": "Merhaba dünya!",
  "hashtags": ["teknoloji", "sosyalmedya"]
}

// Post beğen
POST /social/like
{
  "postId": "post-uuid"
}

// Yorum ekle
POST /social/comment
{
  "postId": "post-uuid",
  "content": "Harika post!"
}
```

## 🐛 Sorun Giderme

### Port Çakışması
```bash
# Port kullanımını kontrol et
netstat -ano | findstr :3001

# Süreci sonlandır
taskkill /PID [PID_NUMARASI] /F
```

### Docker Sorunları
```bash
# Container durumunu kontrol et
docker-compose ps

# Logları görüntüle
docker-compose logs [servis-adı]

# Servisleri yeniden başlat
docker-compose restart
```

### Veritabanı Bağlantı Sorunları
```bash
# PostgreSQL bağlantısını test et
docker exec -it shareuptime-postgres psql -U postgres -d shareuptime

# MongoDB bağlantısını test et
docker exec -it shareuptime-mongodb mongosh shareuptime
```

## 📝 Kod Standartları

### JavaScript/TypeScript
- ESLint + Prettier kullanın
- TypeScript için strict mode
- Async/await tercih edin
- Error handling her zaman yapın

### Git Workflow
```bash
# Feature branch oluştur
git checkout -b feature/yeni-ozellik

# Değişiklikleri commit et
git add .
git commit -m "feat: yeni özellik eklendi"

# Push ve PR oluştur
git push origin feature/yeni-ozellik
```

### Commit Mesaj Formatı
```
feat: yeni özellik eklendi
fix: bug düzeltildi
docs: dokümantasyon güncellendi
test: test eklendi
refactor: kod refactor edildi
```

## 👥 Ekip Rolleri

### Backend Developer
- Mikroservis geliştirme
- API tasarımı
- Veritabanı yönetimi
- Test yazma

### Frontend Developer
- React/Next.js geliştirme
- UI/UX implementasyonu
- API entegrasyonu
- Responsive tasarım

### DevOps Engineer
- Docker konfigürasyonu
- CI/CD pipeline
- Monitoring setup
- Deployment

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

### Docker Production
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 📞 Destek

- **GitHub Issues**: Hata raporları ve özellik istekleri
- **Team Chat**: Günlük iletişim
- **Code Review**: PR'lar için peer review
- **Documentation**: Wiki sayfaları

---

## 🎯 Sonraki Adımlar

1. **Kafka Entegrasyonu**: Event streaming için
2. **Real-time Chat**: Mesajlaşma özellikleri
3. **Push Notifications**: Mobil bildirimler
4. **Media Upload**: Resim/video yükleme
5. **Advanced Search**: Elasticsearch entegrasyonu
6. **Analytics**: Kullanıcı davranış analizi

---

**Proje durumu**: ✅ **TAM FONKSİYONEL**  
**Son güncelleme**: 13 Eylül 2025  
**Ekip**: Ruhaverse Development Team
