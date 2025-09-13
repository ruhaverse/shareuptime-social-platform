# 🚀 ShareUpTime - Kurulum Rehberi

## 📋 Sistem Gereksinimleri

### Minimum Gereksinimler
- **İşletim Sistemi**: Windows 10/11, macOS 10.15+, Ubuntu 18.04+
- **RAM**: 8 GB (16 GB önerilir)
- **Disk Alanı**: 5 GB boş alan
- **İnternet**: Stabil internet bağlantısı

### Gerekli Yazılımlar
- **Node.js**: v18.0.0 veya üzeri
- **npm**: v8.0.0 veya üzeri
- **Git**: v2.30.0 veya üzeri
- **Docker**: v20.0.0 veya üzeri (opsiyonel ama önerilir)
- **Docker Compose**: v2.0.0 veya üzeri

## 🔧 Ön Kurulum

### 1. Node.js Kurulumu

#### Windows
1. [Node.js resmi sitesinden](https://nodejs.org/) LTS sürümünü indirin
2. İndirilen `.msi` dosyasını çalıştırın
3. Kurulum sihirbazını takip edin
4. PowerShell'i yeniden başlatın
5. Kurulumu doğrulayın:
```powershell
node --version
npm --version
```

#### macOS
```bash
# Homebrew ile
brew install node

# Veya resmi installer kullanın
# https://nodejs.org/
```

#### Linux (Ubuntu/Debian)
```bash
# NodeSource repository ekle
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# Node.js kur
sudo apt-get install -y nodejs

# Kurulumu doğrula
node --version
npm --version
```

### 2. Git Kurulumu

#### Windows
1. [Git resmi sitesinden](https://git-scm.com/) indirin
2. Kurulum sırasında "Git from the command line and also from 3rd-party software" seçin
3. PowerShell'i yeniden başlatın

#### macOS
```bash
# Homebrew ile
brew install git

# Veya Xcode Command Line Tools
xcode-select --install
```

#### Linux
```bash
# Ubuntu/Debian
sudo apt-get install git

# CentOS/RHEL
sudo yum install git
```

### 3. Docker Kurulumu (Opsiyonel)

#### Windows
1. [Docker Desktop](https://www.docker.com/products/docker-desktop) indirin
2. Kurulumu tamamlayın
3. Docker Desktop'ı başlatın
4. WSL 2 backend'i etkinleştirin

#### macOS
1. [Docker Desktop for Mac](https://www.docker.com/products/docker-desktop) indirin
2. Kurulumu tamamlayın
3. Docker Desktop'ı başlatın

#### Linux
```bash
# Ubuntu için
sudo apt-get update
sudo apt-get install docker.io docker-compose
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER
```

## 📥 Proje Kurulumu

### 1. Projeyi Klonlama
```bash
# HTTPS ile
git clone https://github.com/ruhaverse/shareuptime-social-platform.git

# SSH ile (önerilir)
git clone git@github.com:ruhaverse/shareuptime-social-platform.git

# Proje dizinine geç
cd shareuptime-social-platform
```

### 2. Environment Konfigürasyonu
```bash
# Ana dizinde .env dosyası oluştur
cp .env.example .env

# Frontend için .env dosyası
cp shareuptime-frontend/.env.example shareuptime-frontend/.env

# Mobile app için .env dosyası
cp ShareUpTimeMobile/.env.example ShareUpTimeMobile/.env
```

### 3. Environment Variables Düzenleme

`.env` dosyasını düzenleyin:
```env
# Genel Ayarlar
NODE_ENV=development
PORT=3000

# JWT Ayarları
JWT_SECRET=super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h

# Veritabanı Bağlantıları
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=shareuptime
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password

MONGODB_URI=mongodb://localhost:27017/shareuptime
REDIS_URL=redis://localhost:6379

# Neo4j
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=password

# MinIO (Object Storage)
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin

# Elasticsearch
ELASTICSEARCH_URL=http://localhost:9200

# Kafka
KAFKA_BROKERS=localhost:9092

# External Services
FIREBASE_PROJECT_ID=your-firebase-project
FIREBASE_PRIVATE_KEY=your-firebase-private-key
FIREBASE_CLIENT_EMAIL=your-firebase-client-email
```

## 🐳 Docker ile Kurulum (Önerilen)

### 1. Tüm Servisleri Başlatma
```bash
# Tüm servisleri arka planda başlat
docker-compose up -d

# Logları takip et
docker-compose logs -f

# Belirli bir servisin loglarını takip et
docker-compose logs -f api-gateway
```

### 2. Servis Durumunu Kontrol Etme
```bash
# Çalışan servisleri listele
docker-compose ps

# Servis durumlarını kontrol et
curl http://localhost:3000/health  # API Gateway
curl http://localhost:3001/health  # Auth Service
```

### 3. Veritabanı Başlatma
```bash
# PostgreSQL tabloları oluştur
docker-compose exec postgres psql -U postgres -d shareuptime -f /docker-entrypoint-initdb.d/01-init.sql

# MongoDB koleksiyonları kontrol et
docker-compose exec mongodb mongo shareuptime --eval "show collections"
```

## 🔧 Manuel Kurulum

### 1. Backend Servisleri

#### API Gateway
```bash
cd services/api-gateway
npm install
npm start
```

#### Auth Service
```bash
cd services/auth-service
npm install

# Basit auth service (Redis olmadan)
node simple-auth.js

# Veya tam auth service (Redis gerekli)
npm start
```

#### Diğer Mikroservisler
```bash
# Her servis için ayrı terminal
cd services/user-service && npm install && npm start
cd services/post-service && npm install && npm start
cd services/feed-service && npm install && npm start
cd services/media-service && npm install && npm start
cd services/notification-service && npm install && npm start
```

### 2. Frontend Uygulamaları

#### Web Uygulaması (Next.js)
```bash
cd shareuptime-frontend
npm install
npm run dev
```

#### Basit Demo Uygulaması
```bash
# Basit HTML/JS demo
start simple-frontend/index.html  # Windows
open simple-frontend/index.html   # macOS
xdg-open simple-frontend/index.html  # Linux
```

#### Mobil Uygulama (React Native)
```bash
cd ShareUpTimeMobile
npm install

# Android için
npx react-native run-android

# iOS için (sadece macOS)
cd ios && pod install && cd ..
npx react-native run-ios
```

## 🔍 Kurulum Doğrulama

### 1. Backend Servisleri Kontrolü
```bash
# API Gateway
curl http://localhost:3000/health
# Beklenen: {"status":"healthy","service":"api-gateway"}

# Auth Service
curl http://localhost:3001/health
# Beklenen: {"status":"healthy","service":"auth-service"}

# User Service
curl http://localhost:3002/health

# Post Service
curl http://localhost:3003/health
```

### 2. Frontend Kontrolü
- **Web App**: http://localhost:3000
- **Demo App**: `simple-frontend/index.html` dosyasını browser'da açın

### 3. Veritabanı Bağlantı Kontrolü
```bash
# PostgreSQL
docker-compose exec postgres psql -U postgres -c "SELECT version();"

# MongoDB
docker-compose exec mongodb mongo --eval "db.runCommand('ping')"

# Redis
docker-compose exec redis redis-cli ping
```

## 🐛 Yaygın Sorunlar ve Çözümleri

### Node.js PATH Sorunu (Windows)
```powershell
# PowerShell'i yönetici olarak çalıştırın
$env:PATH += ";C:\Program Files\nodejs\"

# Kalıcı olarak eklemek için System Properties > Environment Variables
```

### Port Çakışması
```bash
# Port kullanan işlemi bul
netstat -tulpn | grep :3000  # Linux/macOS
netstat -ano | findstr :3000  # Windows

# İşlemi sonlandır
kill -9 <PID>  # Linux/macOS
taskkill /PID <PID> /F  # Windows
```

### Docker Servisleri Başlamıyor
```bash
# Docker daemon durumunu kontrol et
docker info

# Servisleri yeniden başlat
docker-compose down
docker-compose up -d

# Log kontrolü
docker-compose logs [service-name]
```

### npm install Hataları
```bash
# Cache temizle
npm cache clean --force

# node_modules sil ve yeniden yükle
rm -rf node_modules package-lock.json
npm install

# Windows'ta locked folder sorunu
# Klasörü manuel olarak silin veya PowerShell'i yönetici olarak çalıştırın
```

### MongoDB Bağlantı Sorunu
```bash
# MongoDB servisini kontrol et
docker-compose logs mongodb

# Bağlantı stringini kontrol et
echo $MONGODB_URI
```

### Redis Bağlantı Sorunu
```bash
# Redis servisini kontrol et
docker-compose exec redis redis-cli ping

# Basit auth service kullan (Redis olmadan)
cd services/auth-service
node simple-auth.js
```

## 🚀 Production Deployment

### 1. Environment Hazırlığı
```bash
# Production .env dosyası
cp .env.example .env.production

# Güvenlik ayarları
NODE_ENV=production
JWT_SECRET=very-secure-random-string
```

### 2. Build İşlemleri
```bash
# Frontend build
cd shareuptime-frontend
npm run build

# Docker production build
docker-compose -f docker-compose.prod.yml build
```

### 3. SSL Sertifikası
```bash
# Let's Encrypt ile
sudo certbot --nginx -d yourdomain.com
```

## 📞 Destek

### Kurulum ile ilgili sorunlar için:
1. **GitHub Issues**: [Yeni issue açın](https://github.com/ruhaverse/shareuptime-social-platform/issues)
2. **Discussions**: [Topluluk forumu](https://github.com/ruhaverse/shareuptime-social-platform/discussions)
3. **Wiki**: [Detaylı dokümantasyon](https://github.com/ruhaverse/shareuptime-social-platform/wiki)

### Hızlı Yardım Komutları
```bash
# Sistem bilgilerini topla
node --version
npm --version
docker --version
git --version

# Port kullanımını kontrol et
netstat -tulpn | grep -E ":(3000|3001|5432|6379|27017)"

# Docker servis durumları
docker-compose ps
```

---

**🎉 Kurulum tamamlandı! ShareUpTime platformunu kullanmaya başlayabilirsiniz.**
