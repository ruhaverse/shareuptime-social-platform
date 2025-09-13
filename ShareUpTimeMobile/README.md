<<<<<<< HEAD
# 📱 ShareUpTime Mobile App

A cross-platform mobile application for the ShareUpTime social media platform, built with React Native CLI and TypeScript.

## 🚀 Features

- **Authentication**: Login, Register, JWT token management
- **Social Feed**: Timeline, posts, likes, comments
- **User Profiles**: Profile management, follow/unfollow
- **Real-time Chat**: Messaging system
- **Media Upload**: Photo/video sharing
- **Cross-platform**: Android & iOS support

## 🏗️ Tech Stack

- **Framework**: React Native CLI + TypeScript
- **Navigation**: React Navigation 6 (Stack + Tab)
- **State Management**: React Context + AsyncStorage
- **HTTP Client**: Axios
- **Icons**: React Native Vector Icons (Material Icons)
- **Backend API**: http://localhost:3000/api

## 📋 Prerequisites

Make sure you have completed the [React Native Environment Setup](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

### Required Tools
- **Node.js** ≥ 18.0.0
- **React Native CLI**: `npm install -g @react-native-community/cli`
- **Android Studio** (for Android development)
- **Xcode** (for iOS development - macOS only)
- **Java Development Kit (JDK)** ≥ 11
=======
# ShareUpTimeMobile – React Native Kurulum ve Kullanım Kılavuzu

Bu klasör, ShareUpTime sosyal platformunun mobil uygulamasıdır. React Native ile geliştirilmiştir.

---
>>>>>>> 660882dc751d3031f0c2d84aa45e49212b1df933

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