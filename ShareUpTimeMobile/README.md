# ShareUpTimeMobile – React Native Kurulum ve Kullanım Kılavuzu

Bu klasör, ShareUpTime sosyal platformunun mobil uygulamasıdır. React Native ile geliştirilmiştir.

---

## 🚀 Hızlı Başlatma

### 1. Gereksinimler

- Node.js ve npm/yarn kurulu olmalı
- Android Studio (Android için)
- Xcode (iOS için, sadece Mac)
- [React Native ortam kurulumu](https://reactnative.dev/docs/environment-setup) tamamlanmalı

### 2. Bağımlılıkları Yükle

Klasöre gir:
```sh
cd ShareUpTimeMobile
npm install
# veya
yarn install
```

### 3. Metro Sunucusunu Başlat

```sh
npm start
# veya
yarn start
```

### 4. Uygulamayı Çalıştır

#### Android:
```sh
npm run android
# veya
yarn android
```

#### iOS:
Önce CocoaPods yükle (sadece ilk kurulumda veya native bağımlılık değişirse):
```sh
bundle install
bundle exec pod install
```
Sonra:
```sh
npm run ios
# veya
yarn ios
```

### 5. Ortam Değişkenleri (.env)

`ShareUpTimeMobile/.env.example` dosyasını `.env` olarak kopyala ve düzenle.

---

## 🛠️ Geliştirme

- Ana dosya: `App.tsx`
- Kodda değişiklik yaptıktan sonra uygulama otomatik güncellenir (Fast Refresh)
- Sorun yaşarsan [React Native Troubleshooting](https://reactnative.dev/docs/troubleshooting) kısmına bakabilirsin.

---

## ℹ️ Diğer

- [React Native Belgeleri](https://reactnative.dev/docs/getting-started)
- [Mobil API ayarları için backend .env dosyanı da unutma!]

---

Hazır! Uygulamanı çalıştırabilir ve geliştirmeye başlayabilirsin.