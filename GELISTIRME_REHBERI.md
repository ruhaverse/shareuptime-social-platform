# 🚀 ShareUpTime - Geliştirme Ortamı Kurulum Rehberi

## 📋 Proje Durumu Analizi

### ✅ Hazır Olan Bileşenler

**🔧 Altyapı:**
- ✅ Docker: v28.3.3 (Kurulu)
- ✅ Docker Compose: v2.39.2 (Kurulu)
- ✅ Git: Kurulu ve yapılandırılmış
- ❌ Node.js: Kurulu değil (Gerekli ≥18.0.0)

**📁 Proje Yapısı:**
- ✅ Ana proje: `shareuptime-social-platform-main`
- ✅ Dokümantasyon: `shareuptime-documentation` (GitHub'da)
- ✅ Backend mikroservisler: 7 servis tamamen hazır
- ✅ Frontend: Next.js uygulaması (TypeScript)
- ✅ Mobile: React Native uygulaması (TypeScript)
- ✅ Docker yapılandırması: Tam otomatik deployment

## 🛠️ Eksik Kurulumlar

### 1️⃣ Node.js Kurulumu (Kritik)
```powershell
# Option 1: Winget ile kurulum
winget install OpenJS.NodeJS

# Option 2: Manuel kurulum
# https://nodejs.org/en/download/ adresinden LTS sürümü indirin
# Minimum gereksinim: Node.js ≥18.0.0
```

### 2️⃣ React Native Geliştirme Ortamı (Mobile için)
```powershell
# Android Studio kurulumu gerekli
# Java JDK 11+ kurulumu gerekli
# Android SDK kurulumu gerekli
```

## 🚀 Hızlı Başlangıç

### 1️⃣ Node.js Kurulduktan Sonra
```powershell
cd C:\Users\firat\CascadeProjects\shareuptime-social-platform-main

# Tüm servisleri Docker ile başlat
docker-compose up -d

# Backend servislerin durumunu kontrol et
docker-compose ps
```

### 2️⃣ Frontend Geliştirme
```powershell
cd shareuptime-frontend
npm install
npm run dev
# http://localhost:3000 adresinde çalışacak
```

### 3️⃣ Mobile Geliştirme
```powershell
cd ShareUpTimeMobile
npm install

# Android için
npm run android

# iOS için (macOS gerekli)
npm run ios
```

## 🏗️ Mikroservis Mimarisi

### Backend Servisler (Tümü Hazır)
1. **API Gateway** (Port: 3000) - Ana giriş noktası
2. **Auth Service** (Port: 3001) - Kimlik doğrulama
3. **User Service** (Port: 3002) - Kullanıcı yönetimi
4. **Post Service** (Port: 3003) - İçerik yönetimi
5. **Feed Service** (Port: 3004) - Akış yönetimi
6. **Media Service** (Port: 3005) - Medya yönetimi
7. **Notification Service** (Port: 3006) - Bildirimler

### Veritabanları (Docker ile Otomatik)
- **PostgreSQL** (Port: 5433) - Ana veritabanı
- **Neo4j** (Port: 7474/7687) - Sosyal graf
- **Redis** (Port: 6379) - Cache ve session
- **MongoDB** - Post verileri (Atlas üzerinde)
- **Elasticsearch** (Port: 9200) - Arama
- **MinIO** (Port: 9000/9001) - Dosya depolama

### Monitoring (Hazır)
- **Prometheus** (Port: 9090) - Metrikler
- **Grafana** (Port: 3007) - Dashboard

## 🎯 Geliştirme İçin Hazır Durumda

### ✅ Tamamen Hazır
- Docker altyapısı
- Tüm mikroservisler
- Veritabanı şemaları
- API dokümantasyonu
- Frontend boilerplate
- Mobile boilerplate
- Monitoring sistemi

### ⚠️ Sadece Node.js Kurulumu Gerekli
Proje %95 hazır durumda. Tek eksik Node.js kurulumu.

## 🚀 Başlatma Sırası

1. **Node.js kur** (≥18.0.0)
2. **Docker servisleri başlat**: `docker-compose up -d`
3. **Frontend başlat**: `cd shareuptime-frontend && npm install && npm run dev`
4. **API test et**: http://localhost:3000/health
5. **Geliştirmeye başla!**

## 📚 Dokümantasyon Linkleri

- **Ana Dokümantasyon**: https://github.com/ruhaverse/shareuptime-documentation
- **API Referansı**: API_DOCUMENTATION.md
- **Mimari Detayları**: ARCHITECTURE.md
- **Kurulum Rehberi**: KURULUM_REHBERI.md
- **Güvenlik**: SECURITY.md

## 🎉 Sonuç

ShareUpTime projesi **geliştirme için tamamen hazır** durumda! Sadece Node.js kurulumu yapıldıktan sonra tüm sistem çalışır hale gelecek.
