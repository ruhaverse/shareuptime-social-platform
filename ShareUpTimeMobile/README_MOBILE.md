# ShareUpTime Mobile App

React Native tabanlı ShareUpTime sosyal platform mobil uygulaması.

## 🚀 Kurulum

### Gereksinimler
- Node.js (v18+)
- React Native CLI
- Android Studio (Android için)
- Xcode (iOS için - sadece macOS)

### Kurulum Adımları

1. **Bağımlılıkları yükle:**
```bash
cd ShareUpTimeMobile
npm install
```

2. **Android için:**
```bash
# Metro bundler'ı başlat
npx react-native start

# Yeni terminal'de Android uygulamasını çalıştır
npx react-native run-android
```

3. **iOS için (sadece macOS):**
```bash
cd ios && pod install && cd ..
npx react-native run-ios
```

## 📱 Özellikler

### ✅ Tamamlanan
- **Kimlik Doğrulama**: Login ve Register ekranları
- **Ana Feed**: Gönderileri görüntüleme ve beğenme
- **Profil Yönetimi**: Kullanıcı profili ve ayarlar
- **Gönderi Oluşturma**: Yeni gönderi paylaşma
- **Mesajlaşma**: Chat ekranı (temel yapı)
- **Navigasyon**: Tab ve Stack navigasyon
- **API Entegrasyonu**: Backend servisleri ile iletişim

### 🔄 Geliştirme Aşamasında
- Gerçek zamanlı mesajlaşma
- Fotoğraf/video yükleme
- Push notification
- Offline destek

## 🏗️ Proje Yapısı

```
src/
├── navigation/          # Navigasyon yapılandırması
│   └── AppNavigator.tsx
├── screens/            # Uygulama ekranları
│   ├── LoginScreen.tsx
│   ├── RegisterScreen.tsx
│   ├── FeedScreen.tsx
│   ├── ProfileScreen.tsx
│   ├── CreatePostScreen.tsx
│   └── ChatScreen.tsx
└── services/           # API servisleri
    ├── ApiClient.ts
    ├── AuthService.ts
    ├── PostService.ts
    └── UserService.ts
```

## 🔧 API Konfigürasyonu

Backend API Gateway URL'ini `src/services/ApiClient.ts` dosyasında güncelleyin:

```typescript
// Development
this.baseURL = 'http://localhost:3000/api';

// Production
this.baseURL = 'https://your-api-domain.com/api';
```

## 🎨 UI/UX

- **Design System**: Modern, temiz ve kullanıcı dostu arayüz
- **Renk Paleti**: Mavi (#007AFF) ana renk
- **Typography**: Sistem fontları
- **Icons**: Material Icons

## 🔐 Güvenlik

- JWT token tabanlı kimlik doğrulama
- Secure storage (AsyncStorage)
- API request/response interceptors
- Otomatik token yenileme

## 📊 Performans

- Lazy loading
- Image optimization
- Memory management
- Network caching

## 🧪 Test

```bash
# Unit testleri çalıştır
npm test

# E2E testler (gelecekte eklenecek)
npm run e2e
```

## 🚀 Deployment

### Android
```bash
# Release APK oluştur
cd android
./gradlew assembleRelease
```

### iOS
Xcode ile Archive ve App Store'a yükle.

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun
3. Commit yapın
4. Push edin
5. Pull Request açın

## 📝 Notlar

- Backend servislerin çalışır durumda olması gerekiyor
- Android emulator veya gerçek cihaz gerekli
- iOS için macOS ve Xcode gerekli
