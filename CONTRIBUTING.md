# 🤝 ShareUpTime Katkıda Bulunma Rehberi

ShareUpTime projesine katkıda bulunduğunuz için teşekkürler! Bu rehber, projeye nasıl katkıda bulunabileceğinizi açıklar.

## 📋 İçindekiler

- [Geliştirme Ortamı Kurulumu](#-geliştirme-ortamı-kurulumu)
- [Kod Standartları](#-kod-standartları)
- [Commit Mesaj Formatı](#-commit-mesaj-formatı)
- [Pull Request Süreci](#-pull-request-süreci)
- [Issue Raporlama](#-issue-raporlama)
- [Güvenlik Açıkları](#-güvenlik-açıkları)

## 🚀 Geliştirme Ortamı Kurulumu

### Gereksinimler
- Node.js ≥ 18.0.0
- Docker ≥ 20.0.0
- Git

### Kurulum Adımları
```bash
# Repository'yi fork edin ve clone yapın
git clone https://github.com/yourusername/shareuptime-social-platform.git
cd shareuptime-social-platform

# Environment dosyalarını oluşturun
cp .env.example .env

# Backend servisleri başlatın
npm run dev

# Frontend geliştirme (ayrı terminal)
cd shareuptime-frontend
npm install
npm run dev

# Mobile geliştirme (ayrı terminal)
cd ShareUpTimeMobile
npm install
npx react-native start
```

## 📝 Kod Standartları

### Backend (Node.js/Express)
- **ESLint** + **Prettier** kullanın
- **TypeScript** tercih edilir
- **Jest** ile unit testler yazın
- **JSDoc** ile fonksiyonları dokümante edin

```javascript
/**
 * Kullanıcı profili günceller
 * @param {string} userId - Kullanıcı ID'si
 * @param {Object} updateData - Güncellenecek veriler
 * @returns {Promise<Object>} Güncellenmiş kullanıcı profili
 */
async function updateUserProfile(userId, updateData) {
  // Implementation
}
```

### Frontend (Next.js/React)
- **TypeScript** zorunlu
- **Tailwind CSS** için utility-first yaklaşım
- **React Hooks** kullanın
- **Custom hooks** için `use` prefix'i

```typescript
interface UserProfileProps {
  userId: string;
  onUpdate?: (user: User) => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ userId, onUpdate }) => {
  // Component implementation
};
```

### Mobile (React Native)
- **TypeScript** zorunlu
- **React Navigation** için type-safe navigation
- **AsyncStorage** için wrapper hooks kullanın

## 📨 Commit Mesaj Formatı

Conventional Commits formatını kullanın:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Commit Tipleri
- `feat`: Yeni özellik
- `fix`: Bug düzeltmesi
- `docs`: Dokümantasyon değişikliği
- `style`: Kod formatı (logic değişikliği yok)
- `refactor`: Kod refactoring
- `test`: Test ekleme/düzeltme
- `chore`: Build process, dependency güncellemeleri

### Örnekler
```bash
feat(auth): add JWT token refresh mechanism
fix(feed): resolve infinite scroll loading issue
docs(api): update authentication endpoints documentation
style(frontend): format components with prettier
refactor(backend): extract database connection logic
test(user-service): add unit tests for profile update
chore(deps): update React Native to v0.72
```

## 🔄 Pull Request Süreci

### 1. Branch Oluşturma
```bash
# Feature branch oluşturun
git checkout -b feature/amazing-feature

# Bug fix branch oluşturun
git checkout -b fix/bug-description

# Documentation branch oluşturun
git checkout -b docs/update-readme
```

### 2. Geliştirme
- Küçük, odaklanmış commit'ler yapın
- Testleri çalıştırın: `npm test`
- Linting kontrolü: `npm run lint`
- Build kontrolü: `npm run build`

### 3. Pull Request Açma
**PR Template:**
```markdown
## 📝 Açıklama
Bu PR'da neler değişti?

## 🔄 Değişiklik Tipi
- [ ] Bug fix
- [ ] Yeni özellik
- [ ] Breaking change
- [ ] Dokümantasyon güncellemesi

## ✅ Kontrol Listesi
- [ ] Kod self-review yapıldı
- [ ] Testler eklendi/güncellendi
- [ ] Dokümantasyon güncellendi
- [ ] Linting hatası yok
- [ ] Build başarılı

## 🧪 Test Edildi
- [ ] Lokal geliştirme ortamında
- [ ] Docker container'da
- [ ] Mobile cihazda (eğer mobile değişiklik varsa)

## 📸 Ekran Görüntüleri (UI değişiklikleri için)
```

### 4. Code Review
- En az 1 reviewer onayı gerekli
- Tüm CI/CD check'leri geçmeli
- Conflict'ler çözülmeli

## 🐛 Issue Raporlama

### Bug Report Template
```markdown
**Bug Açıklaması**
Kısa ve net bug açıklaması.

**Tekrar Etme Adımları**
1. '...' sayfasına git
2. '...' butonuna tıkla
3. Aşağı kaydır
4. Hatayı gör

**Beklenen Davranış**
Ne olmasını bekliyordunuz?

**Ekran Görüntüleri**
Varsa ekran görüntüleri ekleyin.

**Ortam Bilgileri:**
- OS: [e.g. Windows 11, macOS 13]
- Browser: [e.g. Chrome 120, Safari 17]
- Node.js: [e.g. 18.17.0]
- Mobile Device: [e.g. iPhone 14, Samsung Galaxy S23]

**Ek Bilgiler**
Diğer context bilgileri.
```

### Feature Request Template
```markdown
**Özellik Açıklaması**
Yeni özelliğin kısa açıklaması.

**Problem/İhtiyaç**
Bu özellik hangi problemi çözüyor?

**Önerilen Çözüm**
Nasıl implement edilmesini öneriyorsunuz?

**Alternatifler**
Başka hangi yaklaşımları düşündünüz?

**Ek Bilgiler**
Mockup'lar, referanslar, vb.
```

## 🔒 Güvenlik Açıkları

Güvenlik açıklarını **public issue olarak AÇMAYIN**. Bunun yerine:

1. **Email**: security@shareuptime.com
2. **Konu**: "Security Vulnerability Report"
3. **İçerik**: Detaylı açıklama ve tekrar etme adımları

## 🏷️ Labeling Sistemi

### Priority Labels
- `priority/critical` - Acil düzeltme gerekli
- `priority/high` - Yüksek öncelik
- `priority/medium` - Orta öncelik
- `priority/low` - Düşük öncelik

### Type Labels
- `type/bug` - Bug raporu
- `type/feature` - Yeni özellik
- `type/enhancement` - Mevcut özellik iyileştirmesi
- `type/documentation` - Dokümantasyon
- `type/question` - Soru

### Component Labels
- `component/backend` - Backend mikroservisleri
- `component/frontend` - Web frontend
- `component/mobile` - Mobile app
- `component/database` - Database işlemleri
- `component/auth` - Authentication
- `component/api` - API endpoints

## 🎯 Development Workflow

### Daily Development
```bash
# Güncel main branch'i çek
git checkout main
git pull origin main

# Yeni feature branch oluştur
git checkout -b feature/new-feature

# Geliştirme yap
# ... kod yazma ...

# Test et
npm test
npm run lint
npm run build

# Commit yap
git add .
git commit -m "feat: add new feature"

# Push et
git push origin feature/new-feature

# PR aç
```

### Release Workflow
1. **Feature Freeze**: Yeni özellik ekleme durdurulur
2. **Testing**: Kapsamlı test süreci
3. **Bug Fixes**: Kritik bug'lar düzeltilir
4. **Documentation**: Dokümantasyon güncellenir
5. **Release**: Version tag'i oluşturulur

## 📞 İletişim

- **GitHub Issues**: Teknik sorular ve bug raporları
- **GitHub Discussions**: Genel tartışmalar
- **Email**: team@shareuptime.com
- **Discord**: ShareUpTime Dev Community

## 📚 Kaynaklar

- [Next.js Documentation](https://nextjs.org/docs)
- [React Native Documentation](https://reactnative.dev/docs)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices)

---

**Katkılarınız için teşekkürler! 🙏**
