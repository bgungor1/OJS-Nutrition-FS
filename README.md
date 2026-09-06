# 🥤 OJS Nutrition — Full-Stack E-Ticaret Projesi

[English](./README_EN.md) | **Türkçe**

OJS Nutrition, modern web standartlarına ve temiz kod prensiplerine uygun olarak geliştirilmiş; supplement (besin takviyesi) odaklı **Full-Stack (React + NestJS + PostgreSQL)** bir e-ticaret platformudur.

Proje, istemci tarafında **React 19 + Vite** ile zengin bir kullanıcı deneyimi sunarken; sunucu tarafında **NestJS 11 + Prisma ORM + PostgreSQL** ile tip güvenli, modüler ve yüksek performanslı bir RESTful API mimarisine sahiptir.

---

## 📑 İçindekiler

- [Teknoloji Yığını](#-teknoloji-yığını)
- [Mimari ve Özellikler](#-mimari-ve-özellikler)
- [Proje Klasör Yapısı](#-proje-klasör-yapısı)
- [Sayfa ve Modül Haritası](#-sayfa-ve-modül-haritası)
- [API Dokümantasyonu ve Endpointler](#-api-dokümantasyonu-ve-endpointler)
- [Kurulum ve Çalıştırma](#-kurulum-ve-çalıştırma)
- [Ortam Değişkenleri (.env)](#-ortam-değişkenleri-env)
- [Mühendislik Standartları](#-mühendislik-standartları)
- [Lisans](#-lisans)

---

## 🚀 Teknoloji Yığını

### 🖥️ Frontend (İstemci)

| Katman | Araç / Kütüphane | Sürüm | Açıklama |
|---|---|---|---|
| **Framework & Build** | **React** + **Vite** | `^19.1.0` / `^7.0.4` | Yüksek hızlı derleme ve React 19 bileşen ekosistemi |
| **Dil** | **TypeScript** | `~5.8.3` | Uçtan uca tip güvenliği |
| **Yönlendirme (Router)** | **React Router** | `^7.7.1` | Veri loader'ları ve korumalı rota mimarisi |
| **Stil & Tasarım** | **TailwindCSS v4**, **Shadcn UI** | `^4.1.11` | Modern, responsive ve tema destekli (Light/Dark) tasarım |
| **State Yönetimi** | **Zustand** | `^5.0.8` | Sepet ve istemci tarafı durum yönetimi |
| **Form & Validasyon** | **React Hook Form** + **Zod** | `^7.62.0` / `^4.1.5` | Şema tabanlı, performanslı form doğrulama |
| **Animasyon & UI** | **Motion (Framer Motion)**, **Radix UI** | `^12.23.26` / `^1.2.x` | Erişilebilir UI primitives ve akıcı mikro animasyonlar |
| **İkon Seti** | **Lucide React** | `^0.536.0` | Modern SVG ikon kütüphanesi |
| **Yapay Zeka** | **@google/generative-ai** | `^0.24.1` | Gemini destekli akıllı müşteri asistanı (Chatbot) |

### ⚙️ Backend (Sunucu & API)

| Katman | Araç / Kütüphane | Sürüm | Açıklama |
|---|---|---|---|
| **Framework** | **NestJS** | `^11.0.1` | Modüler, genişletilebilir kurumsal Node.js mimarisi |
| **ORM** | **Prisma** | `^6.2.1` | Tip güvenli veritabanı sorguları ve migration yönetimi |
| **Veritabanı** | **PostgreSQL** | `15+` | İlişkisel veri, JSON alanlar ve indeks optimizasyonu |
| **Auth & Güvenlik** | **Passport JWT**, **Bcrypt** | `^4.0.1` / `^5.1.1` | Whitelist auth guard (`JwtAuthGuard`), refresh token rotasyonu |
| **Yetkilendirme** | **RolesGuard** (`@Roles('admin')`) | Custom | Müşteri (`customer`) ve Yönetici (`admin`) rol kontrolü |
| **Validasyon & Serialization** | **class-validator**, **class-transformer** | `^0.14.1` / `^0.5.1` | Katı DTO doğrulaması ve fail-fast env yönetimi |
| **API Dokümantasyonu** | **@nestjs/swagger** | `^11.0.0` | Canlı Swagger/OpenAPI dokümantasyonu (`/docs`) |
| **Güvenlik & Performans** | **Throttler**, **Compression**, **Cookie-Parser** | `^6.4.0` / `^1.7.5` | Rate limiting, Gzip/Brotli sıkıştırma, güvenli cookie auth |
| **Test** | **Jest**, **Supertest** | `^29.7.0` / `^7.0.0` | Birim (Unit) ve uçtan uca (E2E) test altyapısı |

---

## 🏛️ Mimari ve Özellikler

- **Merkezi Response Zarfı (`ResponseInterceptor`):** Tüm başarılı API yanıtları standart `{ status: 'success', data: ... }` formatında döndürülür. Controller katmanında elle zarf oluşturulmaz.
- **Standart Hata Yönetimi (`AllExceptionsFilter`):** Validation ve sunucu hataları tek tip `{ status: 'error', reason: {...} }` veya `{ status: 'error', message: "..." }` olarak yüzeye çıkarılır.
- **Fail-Fast Konfigürasyon:** Uygulama başlarken zorunlu ortam değişkenleri (`DATABASE_URL`, `JWT_ACCESS_SECRET` vb.) `class-validator` ile kontrol edilir, eksik konfigürasyonda sunucu başlatılmaz.
- **Çift Katmanlı Sepet Yönetimi:** Giriş yapmış kullanıcılar için veritabanı senkronizasyonlu sepet; misafir kullanıcılar için `guest_cart_id` cookie'si ile sunucu taraflı oturum desteği ve girişte sepet birleştirme (`/cart/merge`).
- **Eşzamanlı Stok Kontrolü:** Sipariş anında atomik SQL update (`WHERE stockQuantity >= pieces`) ve transaction ile yarış koşulları (race condition) ve aşırı satış engellenir.
- **Akıllı Asistan:** Google Gemini API entegrasyonuyla ürün önerileri ve supplement kullanım tavsiyesi veren canlı chatbot.

---

## 📁 Proje Klasör Yapısı

```bash
ojs-nutrition-fullstack/
├── apps/
│   └── api/                    # NestJS Backend API
│       ├── prisma/
│       │   ├── schema.prisma   # Veritabanı modelleri (User, Product, Order, Cart vb.)
│       │   └── seed.ts         # Mock verileri DB'ye aktaran seed script
│       ├── src/
│       │   ├── common/         # Interceptor, Filter, Guard, Decorator'lar
│       │   ├── config/         # Tipli config ve fail-fast env doğrulama
│       │   ├── prisma/         # Global PrismaService
│       │   ├── auth/           # Login, register, refresh token, JWT stratejisi
│       │   ├── users/          # Profil ve kullanıcı yönetimi
│       │   ├── addresses/      # Adres CRUD işlemleri
│       │   ├── locations/      # Ülke / İl / İlçe lookup servisleri
│       │   ├── products/       # Ürünler, varyantlar, kategoriler, çok satanlar
│       │   ├── cart/           # Misafir + Kullanıcı sunucu taraflı sepet
│       │   ├── orders/         # Sipariş oluşturma, kargo hesaplama, checkout
│       │   ├── payments/       # Ödeme sağlayıcı (iyzico tokenization) entegrasyonu
│       │   ├── reviews/        # Ürün yorumları ve yıldız agregasyonları
│       │   ├── faq/            # SSS yönetimi
│       │   ├── contact/        # İletişim mesajları
│       │   ├── media/          # Statik medya sunumu (/media)
│       │   └── admin/          # Dashboard istatistikleri ve admin uçları
│       └── test/               # E2E test dosyaları
├── src/                        # React Frontend SPA
│   ├── assets/                 # Statik görseller ve logolar
│   ├── components/             # Yeniden kullanılabilir UI bileşenleri
│   │   ├── common/             # Navbar, Footer, ProductCard vb.
│   │   ├── modals/             # Adres ekleme, sepet drawer vb. modallar
│   │   ├── payment/            # Adım adım ödeme ve checkout bileşenleri
│   │   ├── product-detail/     # Varyant seçici, aroma seçici, akordeonlar
│   │   └── ui/                 # Shadcn UI primitives (Button, Dialog, Accordion vb.)
│   ├── data/                   # Mock API ve statik içerik verileri
│   ├── hooks/                  # Özel React hook'ları (Chatbot, Varyant seçimi vb.)
│   ├── routes/                 # Sayfa tanımları (Home, Products, Account, Payment vb.)
│   ├── schemas/                # Zod form doğrulama şemaları
│   ├── services/               # Axios API istemcileri ve istek servisleri
│   ├── store/                  # Zustand global state store'ları (Auth, Cart vb.)
│   ├── types/                  # TypeScript arayüz ve tip tanımları
│   └── utils/                  # Yardımcı dönüştürücüler ve görsel URL formatlayıcıları
├── BACKEND_PLAN.md             # Backend mimari ve endpoint spesifikasyonu
├── ENGINEERING_STANDARDS.md    # Temiz kod, güvenlik ve test standartları
└── FRONTEND_NEXTJS_PLAN.md     # Next.js App Router geçiş planı
```

---

## 🛍️ Sayfa ve Modül Haritası

| Sayfa / Modül | İstemci Rotası | Açıklama |
|---|---|---|
| **Ana Sayfa** | `/` | Çok satanlar, öne çıkan kategoriler, dinamik bannerlar ve arama |
| **Ürün Kataloğu** | `/products` | Kategori filtreleme, sayfalama, sıralama ve grid görünümü |
| **Kategori Detay** | `/products/protein` | Kategoriye özel dinamik ürün listesi |
| **Ürün Detay** | `/product/:id` | Varyant/Boyut/Aroma seçici, besin değerleri tablosu, yorumlar |
| **Sepet** | Drawer / Sheet | Adet güncelleme, anlık tutar hesaplama, sepet senkronizasyonu |
| **Ödeme (Checkout)** | `/payment` | Adres seçimi, kargo ücreti hesaplama, kart tokenization |
| **Sipariş Onayı** | `/payment/thank-you` | Gerçek sipariş özeti ve sipariş takip numarası |
| **Kullanıcı Hesabı** | `/account` | Profil güncelleme, sipariş geçmişi ve detay modalı |
| **Adres Yönetimi** | `/account/addresses` | Hiyerarşik Ülke/İl/İlçe seçimiyle adres ekleme, düzenleme, silme |
| **Kimlik Doğrulama** | `/login`, `/register` | JWT tabanlı giriş, kayıt olma ve şifre validasyonu |
| **İletişim & SSS** | `/contact`, `/faq` | İletişim formu ve kategorize edilmiş akordeon SSS listesi |
| **AI Asistan** | Chatbot Widget | Sayfa genelinde çalışan Gemini destekli ürün danışmanı |

---

## 🔌 API Dokümantasyonu ve Endpointler

Backend çalışırken canlı Swagger dokümantasyonuna **[http://localhost:3000/docs](http://localhost:3000/docs)** adresinden erişilebilir.

### Temel Endpoint Grupları

```
POST   /api/v1/auth/login                     # Giriş yap (access + refresh token)
POST   /api/v1/auth/register                  # Yeni kullanıcı kaydı
POST   /api/v1/auth/token/refresh             # Access token yenileme

GET    /api/v1/products                       # Ürün listesi (sayfalama & kategori filtreli)
GET    /api/v1/products/:slug                 # Ürün detayı ve varyantları
GET    /api/v1/products/best-sellers          # Çok satan ürünler
GET    /api/v1/categories                     # Kategori ve alt kategori ağacı

GET    /api/v1/cart                           # Sepeti getir (Kullanıcı / Misafir)
POST   /api/v1/cart                           # Sepete ürün/varyant ekle
DELETE /api/v1/cart                           # Sepetten ürün çıkar
POST   /api/v1/cart/merge                     # Misafir sepetini kullanıcı hesabına aktar

GET    /api/v1/users/my-account               # Profil bilgilerini getir
PUT    /api/v1/users/my-account               # Profil bilgilerini güncelle
GET    /api/v1/users/addresses                # Kullanıcı adres listesi
POST   /api/v1/users/addresses                # Yeni adres ekle

GET    /api/v1/orders                         # Kullanıcı sipariş geçmişi
POST   /api/v1/orders/complete-shopping       # Siparişi tamamla (atomik stok kontrolü)

GET    /api/v1/admin/dashboard/stats          # Admin istatistik ve gelir özeti
```

---

## ⚙️ Kurulum ve Çalıştırma

### Gereksinimler
- **Node.js**: `v20+` veya `v22+`
- **pnpm**: `v9+` (veya npm / yarn)
- **PostgreSQL**: `v15+` (Lokal veya Neon / Supabase)

### 1. Projeyi Klonlayın
```bash
git clone https://github.com/bgungor1/OJS-Nutrition-FS.git
cd OJS-Nutrition-FS
```

### 2. Backend (API) Kurulumu
```bash
cd apps/api
cp .env.example .env

# Bağımlılıkları yükleyin
pnpm install

# Prisma istemcisini üretin ve migration'ları uygulayın
pnpm prisma:generate
pnpm prisma:migrate

# Veritabanını örnek verilerle doldurun
pnpm db:seed

# Backend geliştirici sunucusunu başlatın
pnpm start:dev
```
> API `http://localhost:3000/api/v1`, Swagger dokümantasyonu `http://localhost:3000/docs` adresinde çalışacaktır.

### 3. Frontend (İstemci) Kurulumu
Yeni bir terminal sekmesinde proje kök dizinine dönün:
```bash
# Bağımlılıkları yükleyin
pnpm install

# Geliştirici sunucusunu başlatın
pnpm run dev
```
> Frontend `http://localhost:5173` adresinde çalışacaktır.

---

## 🔐 Ortam Değişkenleri (.env)

### Backend (`apps/api/.env`)
```env
# Veritabanı
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ojs_nutrition?schema=public"

# Sunucu & Port
PORT=3000
API_GLOBAL_PREFIX="api/v1"
CORS_ORIGINS="http://localhost:5173,http://localhost:3000"

# JWT Yapılandırması
JWT_ACCESS_SECRET="your-super-secret-access-key-here"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-here"
JWT_ACCESS_EXPIRES="15m"
JWT_REFRESH_EXPIRES="7d"

# Medya & Depolama
MEDIA_STORAGE_PATH="./media"
MEDIA_BASE_URL="http://localhost:3000/media"

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=100
```

### Frontend (`.env`)
```env
VITE_API_BASE_URL="http://localhost:3000/api/v1"
VITE_IMAGE_BASE_URL="http://localhost:3000/media"
VITE_GEMINI_API_KEY="your-gemini-api-key-here"
```

---

## 🧪 Test ve Kalite Kontrolleri

```bash
# Backend birim ve e2e testleri
cd apps/api
pnpm test          # Unit testler
pnpm test:e2e      # Uçtan uca testler
pnpm lint          # ESLint kontrolü ve otomatik düzeltme

# Frontend tip ve lint kontrolleri
cd ../..
pnpm lint
pnpm build
```

---

## 📐 Mühendislik Standartları

Proje genelinde uygulanan temiz kod ve mimari kurallar için [ENGINEERING_STANDARDS.md](./ENGINEERING_STANDARDS.md) dokümanını, detaylı backend API spesifikasyonu için [BACKEND_PLAN.md](./BACKEND_PLAN.md) dokümanını inceleyebilirsiniz.

---

## 📝 Lisans

Bu proje **MIT** lisansı altında geliştirilmektedir.
