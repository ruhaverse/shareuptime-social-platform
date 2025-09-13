# 🔌 ShareUpTime - API Dokümantasyonu

## 📋 Genel Bakış

ShareUpTime platformu RESTful API mimarisi kullanır. Tüm API istekleri JSON formatında yapılır.

**Base URL**: `http://localhost:3000/api`

## 🔐 Kimlik Doğrulama

### JWT Token Kullanımı
```http
Authorization: Bearer <jwt_token>
```

### Auth Endpoints

#### Kullanıcı Kaydı
```http
POST /auth/register
Content-Type: application/json

{
  "username": "kullanici_adi",
  "email": "email@example.com",
  "password": "guvenli_sifre",
  "fullName": "Ad Soyad"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "username": "kullanici_adi",
      "email": "email@example.com",
      "fullName": "Ad Soyad"
    },
    "token": "jwt_token_here"
  }
}
```

#### Kullanıcı Girişi
```http
POST /auth/login
Content-Type: application/json

{
  "email": "email@example.com",
  "password": "sifre"
}
```

#### Token Yenileme
```http
POST /auth/refresh
Authorization: Bearer <refresh_token>
```

#### Çıkış
```http
POST /auth/logout
Authorization: Bearer <jwt_token>
```

## 👤 Kullanıcı Yönetimi

### Profil İşlemleri

#### Profil Görüntüleme
```http
GET /users/profile/:userId
Authorization: Bearer <jwt_token>
```

#### Profil Güncelleme
```http
PUT /users/profile
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "fullName": "Yeni Ad Soyad",
  "bio": "Profil açıklaması",
  "avatar": "avatar_url"
}
```

### Sosyal Etkileşimler

#### Kullanıcı Takip Etme
```http
POST /users/follow/:userId
Authorization: Bearer <jwt_token>
```

#### Takibi Bırakma
```http
DELETE /users/unfollow/:userId
Authorization: Bearer <jwt_token>
```

#### Takipçi Listesi
```http
GET /users/followers/:userId
Authorization: Bearer <jwt_token>
```

#### Takip Edilen Listesi
```http
GET /users/following/:userId
Authorization: Bearer <jwt_token>
```

## 📝 İçerik Yönetimi

### Post İşlemleri

#### Post Oluşturma
```http
POST /posts
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "content": "Post içeriği",
  "mediaUrls": ["media_url_1", "media_url_2"],
  "tags": ["tag1", "tag2"]
}
```

#### Post Görüntüleme
```http
GET /posts/:postId
Authorization: Bearer <jwt_token>
```

#### Post Güncelleme
```http
PUT /posts/:postId
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "content": "Güncellenmiş içerik"
}
```

#### Post Silme
```http
DELETE /posts/:postId
Authorization: Bearer <jwt_token>
```

### Etkileşimler

#### Post Beğenme
```http
POST /posts/:postId/like
Authorization: Bearer <jwt_token>
```

#### Beğeniyi Geri Alma
```http
DELETE /posts/:postId/like
Authorization: Bearer <jwt_token>
```

#### Yorum Yapma
```http
POST /posts/:postId/comment
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "content": "Yorum içeriği"
}
```

#### Yorum Silme
```http
DELETE /posts/:postId/comment/:commentId
Authorization: Bearer <jwt_token>
```

## 📰 Feed & Timeline

### Ana Akış
```http
GET /feed
Authorization: Bearer <jwt_token>
Query Parameters:
- page: Sayfa numarası (default: 1)
- limit: Sayfa başına post sayısı (default: 20)
```

### Trend Postlar
```http
GET /feed/trending
Authorization: Bearer <jwt_token>
Query Parameters:
- timeframe: hour, day, week (default: day)
```

### Keşfet
```http
GET /feed/explore
Authorization: Bearer <jwt_token>
Query Parameters:
- category: Kategori filtresi
```

## 📁 Medya Yönetimi

### Dosya Yükleme
```http
POST /media/upload
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data

Form Data:
- file: Yüklenecek dosya
- type: image, video, document
```

**Response:**
```json
{
  "success": true,
  "data": {
    "mediaId": "media_id",
    "url": "https://cdn.shareuptime.com/media/file.jpg",
    "type": "image",
    "size": 1024000
  }
}
```

### Medya Görüntüleme
```http
GET /media/:mediaId
Authorization: Bearer <jwt_token>
```

### Medya Silme
```http
DELETE /media/:mediaId
Authorization: Bearer <jwt_token>
```

## 🔍 Arama

### Genel Arama
```http
GET /search
Authorization: Bearer <jwt_token>
Query Parameters:
- q: Arama terimi
- type: users, posts, tags (default: all)
- page: Sayfa numarası
```

### Kullanıcı Arama
```http
GET /search/users
Authorization: Bearer <jwt_token>
Query Parameters:
- q: Kullanıcı adı veya tam ad
```

### Post Arama
```http
GET /search/posts
Authorization: Bearer <jwt_token>
Query Parameters:
- q: Post içeriği
- tags: Tag filtresi
```

## 🔔 Bildirimler

### Bildirim Listesi
```http
GET /notifications
Authorization: Bearer <jwt_token>
Query Parameters:
- unread: true/false (sadece okunmamış)
```

### Bildirimi Okundu Olarak İşaretle
```http
PUT /notifications/:notificationId/read
Authorization: Bearer <jwt_token>
```

### Tüm Bildirimleri Okundu İşaretle
```http
PUT /notifications/mark-all-read
Authorization: Bearer <jwt_token>
```

## 📊 Hata Kodları

| Kod | Açıklama |
|-----|----------|
| 200 | Başarılı |
| 201 | Oluşturuldu |
| 400 | Geçersiz istek |
| 401 | Yetkisiz erişim |
| 403 | Yasaklı |
| 404 | Bulunamadı |
| 409 | Çakışma |
| 422 | İşlenemeyen varlık |
| 429 | Çok fazla istek |
| 500 | Sunucu hatası |

## 📝 Response Formatı

### Başarılı Response
```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "İşlem başarılı"
}
```

### Hata Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Hata açıklaması",
    "details": {}
  }
}
```

## 🔄 Rate Limiting

- **Genel**: 1000 istek/saat
- **Auth**: 10 istek/dakika
- **Upload**: 50 istek/saat
- **Search**: 100 istek/dakika

## 📡 WebSocket Events

### Real-time Bildirimler
```javascript
// Bağlantı
const socket = io('ws://localhost:3006');

// Yeni bildirim
socket.on('notification', (data) => {
  console.log('Yeni bildirim:', data);
});

// Yeni mesaj
socket.on('message', (data) => {
  console.log('Yeni mesaj:', data);
});
```
