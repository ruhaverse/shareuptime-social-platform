# Katkıda Bulunma Rehberi

ShareUpTime sosyal platform projesine katkıda bulunduğunuz için teşekkür ederiz! Bu rehber, projeye nasıl katkıda bulunabileceğiniz konusunda size yol gösterecektir.

## 📋 İçindekiler

- [Davranış Kuralları](#davranış-kuralları)
- [Nasıl Katkıda Bulunabilirim](#nasıl-katkıda-bulunabilirim)
- [Geliştirme Ortamı Kurulumu](#geliştirme-ortamı-kurulumu)
- [Kod Standartları](#kod-standartları)
- [Commit Mesaj Formatı](#commit-mesaj-formatı)
- [Pull Request Süreci](#pull-request-süreci)
- [Test Yazma](#test-yazma)
- [Dökümantasyon](#dökümantasyon)
- [Sorun Bildirme](#sorun-bildirme)

## 🤝 Davranış Kuralları

Bu proje [Code of Conduct](CODE_OF_CONDUCT.md) kurallarına tabidir. Katılım göstererek bu kuralları takip etmeyi kabul etmiş olursunuz.

### Temel İlkeler
- Saygılı ve kapsayıcı bir dil kullanın
- Farklı görüşlere ve deneyimlere açık olun
- Yapıcı eleştiri kabul edin
- Topluluk için en iyisine odaklanın

## 🚀 Nasıl Katkıda Bulunabilirim

### Hata Raporları
- Mevcut [issues](https://github.com/ruhaverse/shareuptime-social-platform/issues) listesini kontrol edin
- Hata raporu şablonunu kullanın
- Sorunu yeniden oluşturma adımlarını detaylı şekilde açıklayın

### Özellik Önerileri
- Önerilen özelliğin projenin hedefleriyle uyumlu olduğundan emin olun
- Özellik talebi şablonunu kullanın
- Özelliğin kullanım durumlarını açıklayın

### Kod Katkıları
- Küçük değişiklikler için doğrudan pull request açabilirsiniz
- Büyük değişiklikler için önce issue açıp tartışın
- Fork yapın ve feature branch oluşturun

## ⚙️ Geliştirme Ortamı Kurulumu

### Gereksinimler
- **Node.js** v18 veya üzeri
- **Docker Desktop**
- **Git**
- **npm** veya **yarn**

### Kurulum Adımları

1. **Repository'yi fork edin ve clone yapın:**
```bash
git clone https://github.com/KULLANICI_ADINIZ/shareuptime-social-platform.git
cd shareuptime-social-platform
```

2. **Upstream remote ekleyin:**
```bash
git remote add upstream https://github.com/ruhaverse/shareuptime-social-platform.git
```

3. **Bağımlılıkları yükleyin:**
```bash
npm install
```

4. **Environment dosyasını oluşturun:**
```bash
cp .env.example .env
```

5. **Docker servislerini başlatın:**
```bash
docker-compose up -d
```

6. **Veritabanlarını initialize edin:**
```bash
npm run init:db
```

7. **Servislerin çalıştığını kontrol edin:**
```bash
npm run health-check
```

### Mobile Geliştirme Kurulumu

```bash
cd ShareUpTimeMobile
npm install

# Android için
npx react-native run-android

# iOS için (sadece macOS)
cd ios && pod install && cd ..
npx react-native run-ios
```

## 📝 Kod Standartları

### JavaScript/TypeScript
- **ESLint** ve **Prettier** kurallarına uyun
- **2 boşluk** indentation kullanın
- **Tek tırnak** kullanın
- **Trailing comma** ekleyin
- **Semicolon** kullanın

### Dosya ve Değişken İsimlendirme
- **camelCase** değişken ve fonksiyon isimleri
- **PascalCase** sınıf ve component isimleri
- **kebab-case** dosya isimleri
- **UPPER_SNAKE_CASE** sabitler

### Kod Örnekleri

```javascript
// ✅ İyi
const userService = new UserService();
const MAX_RETRY_COUNT = 3;

function getUserProfile(userId) {
  return userService.getProfile(userId);
}

// ❌ Kötü
const UserService = new UserService();
const maxRetryCount = 3;

function get_user_profile(user_id) {
  return UserService.getProfile(user_id);
}
```

### Yorum Standartları
```javascript
/**
 * Kullanıcı profilini günceller
 * @param {string} userId - Kullanıcı ID'si
 * @param {Object} updateData - Güncellenecek veriler
 * @returns {Promise<User>} Güncellenmiş kullanıcı objesi
 */
async function updateUserProfile(userId, updateData) {
  // Validation yapılır
  const validation = await validateUserData(updateData);
  
  if (!validation.isValid) {
    throw new Error(validation.errors.join(', '));
  }
  
  // Veritabanı güncellenir
  return await userRepository.update(userId, updateData);
}
```

## 📨 Commit Mesaj Formatı

### Conventional Commits kullanın:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Commit Types
- **feat**: Yeni özellik
- **fix**: Hata düzeltmesi
- **docs**: Dökümantasyon değişiklikleri
- **style**: Kod formatı (semantiği etkilemeyen)
- **refactor**: Kod refaktörü
- **test**: Test ekleme/düzeltme
- **chore**: Build process, auxiliary tools

### Örnekler
```bash
feat(auth): add OAuth2 Google authentication
fix(api): resolve user profile update validation error
docs(readme): update installation instructions
style(eslint): fix linting errors in user service
refactor(database): optimize user query performance
test(auth): add unit tests for login functionality
chore(deps): update dependencies to latest versions
```

### Commit Mesaj Kuralları
- İlk satır 50 karakterden kısa olmalı
- Mesaj Türkçe veya İngilizce olabilir
- Açıklayıcı ve anlaşılır olmalı
- İmperative mood kullanın ("add" not "added")

## 🔄 Pull Request Süreci

### 1. Branch Oluşturma
```bash
git checkout main
git pull upstream main
git checkout -b feature/amazing-new-feature
```

### 2. Değişiklikleri Yapma
- Küçük, atomik commit'ler yapın
- Test yazın
- Dökümantasyonu güncelleyin

### 3. Test Etme
```bash
# Linting
npm run lint

# Tests
npm test

# Build
npm run build

# Integration tests
npm run test:integration
```

### 4. Push ve PR Açma
```bash
git push origin feature/amazing-new-feature
```

GitHub'da Pull Request açın ve şu bilgileri ekleyin:

#### PR Template
```markdown
## 📋 Değişiklik Özeti
<!-- Ne değişti, neden değişti kısaca açıklayın -->

## 🔗 İlgili Issue
<!-- Closes #123 -->

## 🧪 Test Edilen Durumlar
- [ ] Unit testler geçiyor
- [ ] Integration testler geçiyor
- [ ] Manual test yapıldı
- [ ] Browser compatibility kontrol edildi

## 📸 Ekran Görüntüleri (UI değişiklikleri için)
<!-- Ekran görüntüleri ekleyin -->

## ✅ Checklist
- [ ] Kod review yapıldı
- [ ] Tests yazıldı/güncellendi
- [ ] Dökümantasyon güncellendi
- [ ] Breaking change var mı?
- [ ] Migration gerekli mi?
```

### 5. Code Review Süreci
- En az 1 maintainer onayı gerekli
- CI/CD pipeline'ı geçmeli
- Conflict'ler çözülmeli
- Feedback'lere yanıt verilmeli

## 🧪 Test Yazma

### Unit Tests
```javascript
// __tests__/userService.test.js
const UserService = require('../services/userService');

describe('UserService', () => {
  describe('createUser', () => {
    it('should create user with valid data', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'securepassword',
        firstName: 'Test',
        lastName: 'User'
      };
      
      const user = await UserService.createUser(userData);
      
      expect(user.id).toBeDefined();
      expect(user.email).toBe(userData.email);
      expect(user.password).not.toBe(userData.password); // hashed
    });
    
    it('should throw error with invalid email', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'securepassword'
      };
      
      await expect(UserService.createUser(userData))
        .rejects.toThrow('Invalid email format');
    });
  });
});
```

### Integration Tests
```javascript
// __tests__/integration/auth.test.js
const request = require('supertest');
const app = require('../../app');

describe('Authentication Integration', () => {
  it('should register and login user', async () => {
    // Register
    const registerResponse = await request(app)
      .post('/auth/register')
      .send({
        email: 'integration@test.com',
        password: 'testpassword',
        firstName: 'Integration',
        lastName: 'Test'
      })
      .expect(201);
    
    expect(registerResponse.body.user.email).toBe('integration@test.com');
    
    // Login
    const loginResponse = await request(app)
      .post('/auth/login')
      .send({
        email: 'integration@test.com',
        password: 'testpassword'
      })
      .expect(200);
    
    expect(loginResponse.body.token).toBeDefined();
  });
});
```

### Test Komutları
```bash
# Tüm testler
npm test

# Sadece unit testler
npm run test:unit

# Sadece integration testler
npm run test:integration

# Coverage raporu
npm run test:coverage

# Watch mode
npm run test:watch
```

## 📚 Dökümantasyon

### API Dökümantasyonu
- Swagger/OpenAPI 3.0 kullanın
- Tüm endpoint'leri dokümante edin
- Request/response örnekleri ekleyin

### Kod Dökümantasyonu
- JSDoc kullanın
- Kompleks algoritmaları açıklayın
- README dosyalarını güncel tutun

### Örnekler
```javascript
/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Kullanıcı profilini getirir
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Kullanıcı profili
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
```

## 🐛 Sorun Bildirme

### Hata Raporu Şablonu
```markdown
**Hatanın Açıklaması**
Hatayı kısa ve net bir şekilde açıklayın.

**Yeniden Oluşturma Adımları**
1. '...' sayfasına gidin
2. '...' butonuna tıklayın
3. Aşağı kaydırın
4. Hatayı görün

**Beklenen Davranış**
Ne olmasını bekliyordunuz?

**Ekran Görüntüleri**
Varsa ekran görüntüleri ekleyin.

**Ortam Bilgileri**
- OS: [örn. iOS, Windows, Linux]
- Browser: [örn. Chrome, Safari]
- Version: [örn. 22]
- Device: [örn. iPhone 12, Desktop]

**Ek Bilgiler**
Problemi daha iyi anlamamıza yardımcı olacak ek bilgiler.
```

### Feature Request Şablonu
```markdown
**Özellik Açıklaması**
İstediğiniz özelliği açıklayın.

**Çözüm Önerisi**
Bu özelliğin nasıl uygulanabileceğini düşünüyorsunuz?

**Alternatifler**
Düşündüğünüz alternatif çözümler var mı?

**Kullanım Senaryoları**
Bu özellik hangi durumlarda kullanılacak?

**Öncelik**
- [ ] Düşük
- [ ] Orta
- [ ] Yüksek
- [ ] Kritik
```

## 🎯 İlk Katkı İpuçları

### Yeni Başlayanlar İçin
- "good first issue" etiketli issue'lara bakın
- Dökümantasyon düzeltmeleri yapın
- Test coverage artırın
- Küçük bug'ları düzeltin

### Faydalı Kaynaklar
- [Git Workflow](https://guides.github.com/introduction/flow/)
- [Markdown Guide](https://guides.github.com/features/mastering-markdown/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)

## 🙋‍♀️ Yardım ve Destek

### İletişim Kanalları
- **GitHub Issues**: Hata raporları ve özellik istekleri
- **Discussions**: Genel sorular ve tartışmalar
- **Discord**: Gerçek zamanlı sohbet (link README'de)
- **Email**: maintainers@shareuptime.com

### Sık Sorulan Sorular

**S: Hangi Node.js versiyonunu kullanmalıyım?**
C: En az v18, en yeni LTS versiyonu önerilir.

**S: Docker kullanmadan geliştirme yapabilir miyim?**
C: Evet, ancak tüm servisleri manuel kurmanız gerekir.

**S: Mobile development için hangi araçlar gerekli?**
C: React Native CLI, Android Studio (Android), Xcode (iOS - sadece macOS).

**S: Deployment nasıl yapılır?**
C: [DEPLOYMENT.md](DEPLOYMENT.md) dosyasına bakın.

---

**ShareUpTime projesine katkıda bulunduğunuz için teşekkürler! 🎉**

Sorularınız için GitHub Discussions veya Issues kullanabilirsiniz.