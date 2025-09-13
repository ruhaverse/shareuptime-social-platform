# 🔌 ShareUpTime API Dokümantasyonu

## 📋 API Genel Bakış

ShareUpTime platformu RESTful API mimarisi kullanarak mikroservisler arası iletişim sağlar. Tüm API endpoint'leri JSON formatında veri alışverişi yapar ve JWT tabanlı kimlik doğrulama kullanır.

## 🔐 Kimlik Doğrulama

### Base URL
```
http://localhost:3000/api  # API Gateway üzerinden
http://localhost:3001      # Doğrudan Auth Service
```

### Authentication Headers
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

## 🚪 Auth Service Endpoints

### POST /auth/register
Yeni kullanıcı kaydı oluşturur.

**Request Body:**
```json
{
  "username": "kullanici_adi",
  "email": "email@example.com",
  "password": "güvenli_şifre",
  "firstName": "Ad",
  "lastName": "Soyad"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Kullanıcı başarıyla oluşturuldu",
  "data": {
    "user": {
      "id": "user_id",
      "username": "kullanici_adi",
      "email": "email@example.com",
      "firstName": "Ad",
      "lastName": "Soyad",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "jwt_token_here"
  }
}
```

**Error Responses:**
```json
// 400 - Validation Error
{
  "success": false,
  "message": "Geçersiz veri",
  "errors": [
    "Email geçerli bir format olmalı",
    "Şifre en az 6 karakter olmalı"
  ]
}

// 409 - User Exists
{
  "success": false,
  "message": "Bu email adresi zaten kullanımda"
}
```

### POST /auth/login
Kullanıcı girişi yapar.

**Request Body:**
```json
{
  "email": "email@example.com",
  "password": "şifre"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Giriş başarılı",
  "data": {
    "user": {
      "id": "user_id",
      "username": "kullanici_adi",
      "email": "email@example.com",
      "firstName": "Ad",
      "lastName": "Soyad"
    },
    "token": "jwt_token_here"
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Geçersiz email veya şifre"
}
```

### POST /auth/logout
Kullanıcı oturumunu sonlandırır.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Çıkış başarılı"
}
```

### GET /auth/health
Servis durumunu kontrol eder.

**Response (200):**
```json
{
  "status": "healthy",
  "service": "auth-service",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": "2h 30m 15s"
}
```

## 👤 User Service Endpoints

### GET /users/profile/:id
Kullanıcı profil bilgilerini getirir.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "username": "kullanici_adi",
      "firstName": "Ad",
      "lastName": "Soyad",
      "bio": "Kullanıcı biyografisi",
      "avatar": "avatar_url",
      "followersCount": 150,
      "followingCount": 75,
      "postsCount": 42,
      "isFollowing": false,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### PUT /users/profile
Kullanıcı profil bilgilerini günceller.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "firstName": "Yeni Ad",
  "lastName": "Yeni Soyad",
  "bio": "Güncellenmiş biyografi",
  "avatar": "new_avatar_url"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Profil başarıyla güncellendi",
  "data": {
    "user": {
      "id": "user_id",
      "username": "kullanici_adi",
      "firstName": "Yeni Ad",
      "lastName": "Yeni Soyad",
      "bio": "Güncellenmiş biyografi",
      "avatar": "new_avatar_url"
    }
  }
}
```

### POST /users/follow/:id
Belirtilen kullanıcıyı takip eder.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Kullanıcı takip edildi",
  "data": {
    "isFollowing": true,
    "followersCount": 151
  }
}
```

### DELETE /users/unfollow/:id
Belirtilen kullanıcının takibini bırakır.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Takip bırakıldı",
  "data": {
    "isFollowing": false,
    "followersCount": 150
  }
}
```

## 📝 Post Service Endpoints

### POST /posts
Yeni gönderi oluşturur.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "content": "Gönderi içeriği",
  "mediaUrls": ["image1.jpg", "image2.jpg"],
  "tags": ["etiket1", "etiket2"],
  "location": {
    "name": "İstanbul, Türkiye",
    "coordinates": [41.0082, 28.9784]
  }
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Gönderi oluşturuldu",
  "data": {
    "post": {
      "id": "post_id",
      "content": "Gönderi içeriği",
      "mediaUrls": ["image1.jpg", "image2.jpg"],
      "tags": ["etiket1", "etiket2"],
      "location": {
        "name": "İstanbul, Türkiye",
        "coordinates": [41.0082, 28.9784]
      },
      "author": {
        "id": "user_id",
        "username": "kullanici_adi",
        "avatar": "avatar_url"
      },
      "likesCount": 0,
      "commentsCount": 0,
      "sharesCount": 0,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### GET /posts/:id
Belirtilen gönderiyi getirir.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "post": {
      "id": "post_id",
      "content": "Gönderi içeriği",
      "mediaUrls": ["image1.jpg"],
      "author": {
        "id": "user_id",
        "username": "kullanici_adi",
        "firstName": "Ad",
        "lastName": "Soyad",
        "avatar": "avatar_url"
      },
      "likesCount": 25,
      "commentsCount": 5,
      "sharesCount": 2,
      "isLiked": false,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### PUT /posts/:id
Gönderiyi günceller.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "content": "Güncellenmiş içerik",
  "tags": ["yeni_etiket"]
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Gönderi güncellendi",
  "data": {
    "post": {
      "id": "post_id",
      "content": "Güncellenmiş içerik",
      "tags": ["yeni_etiket"],
      "updatedAt": "2024-01-01T01:00:00.000Z"
    }
  }
}
```

### DELETE /posts/:id
Gönderiyi siler.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Gönderi silindi"
}
```

### POST /posts/:id/like
Gönderiyi beğenir.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Gönderi beğenildi",
  "data": {
    "isLiked": true,
    "likesCount": 26
  }
}
```

### DELETE /posts/:id/like
Gönderi beğenisini geri alır.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Beğeni geri alındı",
  "data": {
    "isLiked": false,
    "likesCount": 25
  }
}
```

### POST /posts/:id/comments
Gönderiye yorum yapar.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "content": "Yorum içeriği"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Yorum eklendi",
  "data": {
    "comment": {
      "id": "comment_id",
      "content": "Yorum içeriği",
      "author": {
        "id": "user_id",
        "username": "kullanici_adi",
        "avatar": "avatar_url"
      },
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "commentsCount": 6
  }
}
```

### GET /posts/:id/comments
Gönderi yorumlarını getirir.

**Query Parameters:**
- `page` (optional): Sayfa numarası (default: 1)
- `limit` (optional): Sayfa başına yorum sayısı (default: 20)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "comments": [
      {
        "id": "comment_id",
        "content": "Yorum içeriği",
        "author": {
          "id": "user_id",
          "username": "kullanici_adi",
          "firstName": "Ad",
          "lastName": "Soyad",
          "avatar": "avatar_url"
        },
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 6,
      "pages": 1
    }
  }
}
```

## 📰 Feed Service Endpoints

### GET /feed
Kişiselleştirilmiş ana akışı getirir.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (optional): Sayfa numarası (default: 1)
- `limit` (optional): Sayfa başına gönderi sayısı (default: 10)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": "post_id",
        "content": "Gönderi içeriği",
        "mediaUrls": ["image1.jpg"],
        "author": {
          "id": "user_id",
          "username": "kullanici_adi",
          "firstName": "Ad",
          "lastName": "Soyad",
          "avatar": "avatar_url"
        },
        "likesCount": 25,
        "commentsCount": 5,
        "isLiked": false,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "pages": 10
    }
  }
}
```

### GET /feed/trending
Trend gönderileri getirir.

**Query Parameters:**
- `timeframe` (optional): Zaman aralığı (1h, 24h, 7d, 30d) (default: 24h)
- `limit` (optional): Gönderi sayısı (default: 20)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": "post_id",
        "content": "Trend gönderi",
        "trendScore": 95.5,
        "author": {
          "id": "user_id",
          "username": "kullanici_adi",
          "avatar": "avatar_url"
        },
        "likesCount": 1250,
        "commentsCount": 89,
        "sharesCount": 45,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

### GET /feed/explore
Keşfet akışını getirir.

**Query Parameters:**
- `category` (optional): Kategori filtresi (technology, sports, art, etc.)
- `limit` (optional): Gönderi sayısı (default: 20)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": "post_id",
        "content": "Keşfet gönderisi",
        "category": "technology",
        "author": {
          "id": "user_id",
          "username": "kullanici_adi",
          "avatar": "avatar_url"
        },
        "likesCount": 45,
        "commentsCount": 12,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

## 📁 Media Service Endpoints

### POST /media/upload
Medya dosyası yükler.

**Headers:** 
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Request Body (Form Data):**
```
file: [image/video file]
type: "image" | "video"
```

**Response (201):**
```json
{
  "success": true,
  "message": "Dosya başarıyla yüklendi",
  "data": {
    "url": "https://cdn.shareuptime.com/media/abc123.jpg",
    "type": "image",
    "size": 1024000,
    "dimensions": {
      "width": 1920,
      "height": 1080
    }
  }
}
```

### DELETE /media/:id
Medya dosyasını siler.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Medya dosyası silindi"
}
```

## 🔔 Notification Service Endpoints

### GET /notifications
Kullanıcı bildirimlerini getirir.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (optional): Sayfa numarası (default: 1)
- `limit` (optional): Sayfa başına bildirim sayısı (default: 20)
- `unread` (optional): Sadece okunmamış bildirimler (true/false)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "notification_id",
        "type": "like",
        "title": "Gönderiniz beğenildi",
        "message": "kullanici_adi gönderinizi beğendi",
        "data": {
          "postId": "post_id",
          "userId": "user_id"
        },
        "isRead": false,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "pages": 3
    },
    "unreadCount": 15
  }
}
```

### PUT /notifications/:id/read
Bildirimi okundu olarak işaretler.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Bildirim okundu olarak işaretlendi"
}
```

### PUT /notifications/read-all
Tüm bildirimleri okundu olarak işaretler.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Tüm bildirimler okundu olarak işaretlendi",
  "data": {
    "readCount": 15
  }
}
```

## 🔍 Search Endpoints

### GET /search
Genel arama yapar.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `q`: Arama terimi (required)
- `type` (optional): Arama tipi (users, posts, hashtags, all) (default: all)
- `limit` (optional): Sonuç sayısı (default: 20)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "user_id",
        "username": "kullanici_adi",
        "firstName": "Ad",
        "lastName": "Soyad",
        "avatar": "avatar_url",
        "followersCount": 150
      }
    ],
    "posts": [
      {
        "id": "post_id",
        "content": "Arama sonucu gönderi",
        "author": {
          "id": "user_id",
          "username": "kullanici_adi",
          "avatar": "avatar_url"
        },
        "likesCount": 25,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "hashtags": [
      {
        "tag": "etiket1",
        "postCount": 1250
      }
    ]
  }
}
```

## ❌ Error Responses

### Genel Error Format
```json
{
  "success": false,
  "message": "Hata açıklaması",
  "error": {
    "code": "ERROR_CODE",
    "details": "Detaylı hata bilgisi"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### HTTP Status Codes
- `200` - Başarılı
- `201` - Oluşturuldu
- `400` - Geçersiz istek
- `401` - Yetkisiz erişim
- `403` - Yasaklı
- `404` - Bulunamadı
- `409` - Çakışma
- `422` - İşlenemeyen varlık
- `429` - Çok fazla istek
- `500` - Sunucu hatası

## 🔒 Rate Limiting

### Limitler
- **Genel API**: 100 istek / 15 dakika
- **Auth Endpoints**: 5 istek / 15 dakika
- **Upload Endpoints**: 10 istek / dakika
- **Search Endpoints**: 30 istek / dakika

### Rate Limit Headers
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## 📝 Request/Response Examples

### cURL Examples

**Kullanıcı Kaydı:**
```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test_user",
    "email": "test@example.com",
    "password": "secure123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

**Giriş:**
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "secure123"
  }'
```

**Gönderi Oluşturma:**
```bash
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "content": "Bu benim ilk gönderim!",
    "tags": ["ilk", "gönderi"]
  }'
```

---

Bu dokümantasyon ShareUpTime API'sinin temel kullanımını kapsar. Daha detaylı bilgi için [GitHub Repository](https://github.com/ruhaverse/shareuptime-social-platform) ziyaret edebilirsiniz.
