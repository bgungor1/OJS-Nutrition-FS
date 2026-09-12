# apps/api — OJS Nutrition Backend API

NestJS 11 + Prisma ORM + PostgreSQL mimarisi üzerine kurulu kurumsal RESTful API sunucusu.  
Mimari sözleşme: [`../../BACKEND_PLAN.md`](../../BACKEND_PLAN.md)  
Mühendislik ve kod standartları: [`../../ENGINEERING_STANDARDS.md`](../../ENGINEERING_STANDARDS.md)

---

## 📌 Genel Bakış & Özellikler

Bu servis, OJS Nutrition platformunun veri tabanını, iş mantığını ve güvenlik katmanını yöneten ana backend uygulamasıdır:

- **Merkezi Response Interceptor:** Tüm başarılı API yanıtları standart `{ status: 'success', data: ... }` formatında zarflanır.
- **Standart Hata Filtresi (`AllExceptionsFilter`):** DTO validasyon ve çalışma zamanı hataları standart `{ status: 'error', reason: {...} }` formatında döndürülür.
- **Fail-Fast Ortam Doğrulaması:** Başlangıçta zorunlu `class-validator` kontrolleri yapılır; eksik env değişkeninde sunucu başlamaz.
- **Çift Katmanlı Sepet:** Giriş yapmış kullanıcılar için veritabanı senkronizasyonlu sepet, misafir kullanıcılar için cookie tabanlı (`guest_cart_id`) oturum desteği ve girişte otomatik sepet birleştirme (`/cart/merge`).
- **Atomik Stok & Sipariş İşlemleri:** PostgreSQL transaction ve atomik SQL `WHERE stockQuantity >= pieces` korumasıyla aşırı satış (overselling) ve yarış koşulları engellenir.
- **İnteraktif API Dokümantasyonu:** Swagger/OpenAPI entegrasyonu (`/docs`).

---

## 🛠️ Kurulum ve Başlatma

```bash
cd apps/api

# 1. Ortam değişkenlerini hazırlayın
cp .env.example .env

# 2. Bağımlılıkları yükleyin
pnpm install

# 3. Prisma istemcisini üretin ve migration'ları uygulayın (PostgreSQL çalışır durumda olmalıdır)
pnpm prisma:generate
pnpm prisma:migrate

# 4. Veritabanını gerçekçi mock verilerle doldurun
pnpm db:seed

# 5. Geliştirici sunucusunu başlatın
pnpm start:dev
```

- **API Base:** `http://localhost:3000/api/v1`
- **Swagger Docs:** `http://localhost:3000/docs`
- **Statik Medya:** `http://localhost:3000/media`

---

## 💻 Komutlar

| Komut | Açıklama |
|---|---|
| `pnpm start:dev` | Dosya değişikliklerini izleyerek (watch mod) sunucuyu çalıştırır |
| `pnpm start:prod` | Üretim modunda derlenmiş `dist/main.js` dosyasını çalıştırır |
| `pnpm build` | TypeScript kodlarını derler ve `dist/` klasörünü üretir |
| `pnpm lint:check` | ESLint kurallarını kontrol eder |
| `pnpm lint` | ESLint ile otomatik düzeltilebilir hataları düzeltir |
| `pnpm test` | Jest birim (unit) testlerini çalıştırır |
| `pnpm test:watch` | İzleme modunda birim testlerini çalıştırır |
| `pnpm test:cov` | Test coverage (kapsama) raporunu üretir |
| `pnpm test:e2e` | Uçtan uca (end-to-end) API testlerini çalıştırır |
| `pnpm prisma:studio` | Veritabanını tarayıcıda yönetmek için Prisma Studio'yu açar |
| `pnpm prisma:migrate` | Yeni veritabanı migration'ları oluşturur ve uygular |
| `pnpm db:seed` | Örnek veri setlerini veritabanına aktarır |

---

## 🏗️ Modüler Klasör Yapısı

```
src/
├── common/             # Interceptor, Filter, Guard, Decorator, Type tanımları
├── config/             # Tipli yapılandırma ve fail-fast env validatörü
├── prisma/             # Global PrismaService ve veritabanı bağlantısı
├── auth/               # Giriş, kayıt, JWT token rotasyonu, Google OAuth stratejileri
├── users/              # Kullanıcı profili ve hesap yönetimi
├── addresses/          # Adres CRUD işlemleri
├── locations/          # İl ve ilçe lookup servisleri
├── products/           # Ürün kataloğu, varyantlar, filtreleme, çok satanlar
├── cart/               # Misafir ve oturum açmış kullanıcı sepeti
├── orders/             # Sipariş oluşturma, kargo hesaplama, atomik checkout
├── payments/           # Ödeme sağlayıcı entegrasyonu (iyzico tokenization)
├── reviews/            # Ürün yorumları ve yıldız değerlendirmeleri
├── faq/                # Sıkça Sorulan Sorular yönetimi
├── contact/            # Müşteri iletişim bildirimleri
├── media/              # Statik medya ve görsel sunumu
└── admin/              # Yönetici metrik ve istatistik uçları
```
