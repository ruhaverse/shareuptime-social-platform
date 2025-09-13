# ShareUpTime - Deployment Guide

## 🚀 GitHub'a Yükleme ve Çalıştırma Rehberi

### 1. GitHub Repository Oluşturma

#### GitHub'da yeni repository oluştur:
1. GitHub.com'a git
2. "New repository" butonuna tıkla
3. Repository adı: `shareuptime-social-platform`
4. Description: `Next-generation social media platform with microservices architecture`
5. Public/Private seç
6. **README.md ekleme** (zaten var)
7. "Create repository" tıkla

### 2. Projeyi GitHub'a Yükleme

```bash
# 1. Proje klasörüne git
cd "c:\Users\daaml\Downloads\DataBase stuff\project"

# 2. Git repository'yi initialize et
git init

# 3. Tüm dosyaları stage'e ekle
git add .

# 4. İlk commit'i yap
git commit -m "Initial commit: ShareUpTime microservices architecture"

# 5. GitHub repository'yi remote olarak ekle (kendi repo URL'ini kullan)
git remote add origin https://github.com/KULLANICI_ADIN/shareuptime-social-platform.git

# 6. Main branch'i oluştur ve push et
git branch -M main
git push -u origin main
```

### 3. Lokal Geliştirme Ortamı Kurulumu

#### Gereksinimler:
- **Docker Desktop** (Windows için)
- **Node.js** (v18 veya üzeri)
- **Git**

#### Kurulum Adımları:

```bash
# 1. Repository'yi clone et
git clone https://github.com/KULLANICI_ADIN/shareuptime-social-platform.git
cd shareuptime-social-platform

# 2. Environment dosyasını kopyala
copy .env.example .env

# 3. Docker Desktop'ı başlat

# 4. Tüm servisleri başlat
docker-compose up -d --build

# 5. Veritabanlarını initialize et
cd scripts
npm install
npm run init
cd ..

# 6. Health check'leri çalıştır (Git Bash'te)
bash ./acceptance-tests/smoke-tests.sh
```

### 4. Windows PowerShell Komutları

```powershell
# Environment dosyasını kopyala
Copy-Item .env.example .env

# Docker servisleri başlat
docker-compose up -d --build

# Servislerin durumunu kontrol et
docker-compose ps

# Logları izle
docker-compose logs -f

# Servisleri durdur
docker-compose down

# Verileri temizle (dikkat: tüm data silinir!)
docker-compose down -v
```

### 5. Servis URL'leri

Tüm servisler başladıktan sonra:

- **API Gateway**: http://localhost:3000
- **Auth Service**: http://localhost:3001
- **User Service**: http://localhost:3002
- **Post Service**: http://localhost:3003
- **Feed Service**: http://localhost:3004
- **Media Service**: http://localhost:3005
- **Notification Service**: http://localhost:3006
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3007
- **MinIO Console**: http://localhost:9001

### 6. API Test Örnekleri

#### Kullanıcı Kaydı:
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "username": "testuser",
    "firstName": "Test",
    "lastName": "User"
  }'
```

#### Giriş Yapma:
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

#### Post Oluşturma (token gerekli):
```bash
curl -X POST http://localhost:3000/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "content": "Merhaba ShareUpTime! 🚀 #ilkpost",
    "hashtags": ["ilkpost", "shareuptime"]
  }'
```

### 7. Geliştirme Komutları

```bash
# Tüm servisleri yeniden başlat
docker-compose restart

# Sadece bir servisi yeniden başlat
docker-compose restart api-gateway

# Bir servisin loglarını izle
docker-compose logs -f post-service

# Container'a bağlan
docker-compose exec api-gateway sh

# Veritabanlarını temizle ve yeniden başlat
docker-compose down -v
docker-compose up -d --build
npm run init:db
```

### 8. Production Deployment

#### Docker Hub'a Push:
```bash
# Image'ları build et ve tag'le
docker build -t shareuptime/api-gateway ./services/api-gateway
docker build -t shareuptime/auth-service ./services/auth-service
# ... diğer servisler

# Docker Hub'a push et
docker push shareuptime/api-gateway
docker push shareuptime/auth-service
# ... diğer servisler
```

#### Cloud Deployment (AWS/GCP/Azure):
1. Kubernetes cluster oluştur
2. Docker images'ları registry'ye push et
3. Kubernetes manifests oluştur
4. Database'leri cloud'da kur
5. Environment variables'ları ayarla

### 9. Troubleshooting

#### Yaygın Sorunlar:

**Port çakışması:**
```bash
# Kullanılan portları kontrol et
netstat -an | findstr :3000

# Docker container'ları durdur
docker-compose down
```

**Veritabanı bağlantı sorunu:**
```bash
# Veritabanlarının durumunu kontrol et
docker-compose ps
docker-compose logs postgres
docker-compose logs mongodb
```

**Memory sorunu:**
```bash
# Docker Desktop'ta memory'yi artır (Settings > Resources)
# Minimum 8GB RAM önerilir
```

### 10. Monitoring ve Logs

#### Prometheus Metrics:
- http://localhost:9090

#### Grafana Dashboard:
- http://localhost:3007
- Username: admin
- Password: admin

#### Centralized Logging:
```bash
# Tüm servislerin logları
docker-compose logs -f

# Sadece error logları
docker-compose logs | grep ERROR
```

## 🎯 Hızlı Başlangıç

En hızlı şekilde başlamak için:

```bash
git clone https://github.com/KULLANICI_ADIN/shareuptime-social-platform.git
cd shareuptime-social-platform
copy .env.example .env
docker-compose up -d --build
```

5-10 dakika sonra tüm servisler hazır olacak! 🚀
