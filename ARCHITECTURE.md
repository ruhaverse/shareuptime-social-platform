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
