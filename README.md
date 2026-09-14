# 🥤 OJS Nutrition — Full-Stack Monorepo E-Ticaret Platformu

[English](./README_EN.md) | **Türkçe**

OJS Nutrition, modern web mühendisliği standartlarına, temiz kod prensiplerine ve ölçeklenebilir monorepo mimarisine uygun olarak geliştirilmiş kapsamlı bir **Full-Stack (Next.js 15 + NestJS 11 + PostgreSQL)** supplement (besin takviyesi) e-ticaret platformudur.

> 💡 **Geliştirme & Mimari Dönüşüm Hikayesi (Evolution: Vite SPA → Full-Stack Monorepo):**  
> Bu proje, yazarın modern yazılım mimarilerini ve web mühendisliği pratiklerini deneyimlemek amacıyla geliştirdiği bir **kendini geliştirme ve vitrin (showcase / portfolio)** projesidir.  
> İlk etapta istemci taraflı **React 19 + Vite SPA** olarak hayata geçirilmiş; ardından kurumsal standartlarda **Server-Side Rendering (SSR)**, **Incremental Static Regeneration (ISR)**, **Server Components**, **HTTP-only cookie tabanlı güvenli kimlik doğrulama** ve **atomik işlem garantili sipariş/stok yönetimi** kabiliyetlerini sergilemek üzere **Next.js 15 (App Router)** ve **NestJS 11 + Prisma ORM** destekli modern bir **Full-Stack Monorepo** yapısına dönüştürülmüştür. (Projenin ilk Vite SPA kodları, mimari evrimi belgelemek adına kök dizindeki `src/` klasöründe referans olarak korunmaktadır).

---

## 📑 İçindekiler

- [Mimari ve Özellikler](#-mimari-ve-özellikler)
- [Teknoloji Yığını](#-teknoloji-yığını)
- [Proje Klasör Yapısı (Monorepo)](#-proje-klasör-yapısı-monorepo)
- [Sayfa ve Modül Haritası](#-sayfa-ve-modül-haritası)
- [API Dokümantasyonu ve Endpointler](#-api-dokümantasyonu-ve-endpointler)
- [Kurulum ve Çalıştırma](#-kurulum-ve-çalıştırma)
- [Ortam Değişkenleri (.env)](#-ortam-değişkenleri-env)
- [Test ve Kalite Kontrolleri](#-test-ve-kalite-kontrolleri)
- [Mühendislik Standartları](#-mühendislik-standartları)
- [Lisans](#-lisans)

---

## 🏛️ Mimari ve Özellikler

- **Full-Stack Monorepo Mimarisi (`pnpm workspaces`):** Frontend (`apps/web`) ve Backend (`apps/api`) bağımsız olarak geliştirilebilir, test edilebilir ve ölçeklenebilir monorepo yapısında organize edilmiştir.
- **Server & Client Components Dengesi:** Next.js 15 App Router üzerinde ürün listeleri ve statik sayfalar sunucuda hızlıca render edilirken (SSR/ISR), filtreleme, sepet ve ödeme gibi etkileşimli alanlar optimize Client Component'lar ile çalışır.
- **Merkezi Response Zarfı (`ResponseInterceptor`):** Tüm başarılı API yanıtları standart `{ status: 'success', data: ... }` formatında normalize edilir. Controller katmanında elle zarf oluşturulmaz.
- **Standart Hata Yönetimi (`AllExceptionsFilter`):** DTO validasyon ve sunucu hataları tek tip `{ status: 'error', reason: {...} }` veya `{ status: 'error', message: "..." }` formatında yüzeye çıkarılır.
- **Fail-Fast Konfigürasyon:** Uygulama ayağa kalkarken zorunlu ortam değişkenleri (`DATABASE_URL`, `JWT_ACCESS_SECRET` vb.) `class-validator` ile kontrol edilir; eksik yapılandırmada sunucu derhal durdurulur.
- **Çift Katmanlı Sepet Yönetimi:** Giriş yapmış kullanıcılar için veritabanı senkronizasyonlu sepet; misafir kullanıcılar için `guest_cart_id` cookie'si ile sunucu taraflı oturum desteği ve girişte sepet birleştirme (`/cart/merge`).
- **Eşzamanlı Stok ve Yarış Koşulu Koruması:** Sipariş anında atomik SQL güncellemesi (`WHERE stockQuantity >= pieces`) ve database transaction kullanımı ile yarış koşulları (race condition) ve aşırı satış (overselling) engellenir.
- **Güvenli Kimlik Doğrulama:** Access Token (kısa ömürlü) ve Refresh Token rotasyonu, HTTP-only güvenli cookie desteği ve `RolesGuard` ile rol tabanlı yetkilendirme (`customer` vs `admin`).
- **Akıllı Asistan:** Google Gemini API entegrasyonuyla ürün önerileri ve supplement kullanım tavsiyesi veren interaktif canlı chatbot widget'ı.

---

## 🚀 Teknoloji Yığını

### 🖥️ Frontend (İstemci — `apps/web`)

| Katman | Araç / Kütüphane | Sürüm | Açıklama |
|---|---|---|---|
| **Framework** | **Next.js (App Router)** | `^15.2.1` | SSR, ISR, Server Components, Route Groups ve Metadata API |
| **Kütüphane** | **React** | `^19.0.0` | En güncel React 19 mimarisi ve component modeli |
| **Dil** | **TypeScript** | `^5.7.3` | Uçtan uca tip güvenliği ve sıkı tip denetimi |
| **Stil & Tasarım** | **TailwindCSS v4**, **PostCSS** | `^4.0.9` | Modern, utility-first stil motoru ve tema desteği |
| **UI Primitives** | **Radix UI**, **Lucide React** | `^1.1.x` / `^0.477.0` | Erişilebilir headless bileşenler ve modern ikon seti |
| **Animasyon** | **Motion (Framer Motion)** | `^12.4.7` | Akıcı mikro etkileşimler ve sayfa geçişleri |
| **State Yönetimi** | **Zustand** | `^5.0.3` | İstemci tarafı sepet ve arayüz durum yönetimi |
| **Form & Validasyon** | **React Hook Form** + **Zod** | `^7.54.2` / `^3.24.2` | Şema tabanlı, tip güvenli ve performanslı form doğrulama |
| **Test** | **Vitest**, **Testing Library**, **JSDOM** | `^5.0.0` / `^16.3.3` | Hızlı ESM-native birim ve bileşen testleri |

### ⚙️ Backend (Sunucu & API — `apps/api`)

| Katman | Araç / Kütüphane | Sürüm | Açıklama |
|---|---|---|---|
| **Framework** | **NestJS** | `^11.0.1` | Modüler, kurumsal TypeScript Node.js mimarisi |
| **ORM** | **Prisma ORM** | `^6.2.1` | Tip güvenli veritabanı sorguları ve migration yönetimi |
| **Veritabanı** | **PostgreSQL** | `15+` | İlişkisel veri modeli, JSON alanlar ve indeks optimizasyonu |
| **Auth & Güvenlik** | **Passport JWT**, **Bcrypt** | `^4.0.1` / `^5.1.1` | Whitelist auth guard (`JwtAuthGuard`), refresh token rotasyonu |
| **Yetkilendirme** | **RolesGuard** (`@Roles('admin')`) | Özel Guard | `customer` ve `admin` rolleri için rol tabanlı erişim kontrolü |
| **Validasyon & Serialization** | **class-validator**, **class-transformer** | `^0.14.1` / `^0.5.1` | Katı DTO doğrulaması ve fail-fast env yönetimi |
| **API Dokümantasyonu** | **@nestjs/swagger** | `^11.0.0` | Canlı Swagger/OpenAPI interaktif dokümantasyonu (`/docs`) |
| **Performans & Güvenlik** | **Helmet**, **Throttler**, **Compression** | `^8.3.0` / `^6.4.0` / `^1.7.5` | Güvenlik başlıkları, rate limiting, gzip/brotli sıkıştırma |
| **Test** | **Jest**, **Supertest** | `^29.7.0` / `^7.0.0` | Birim (Unit) ve uçtan uca (E2E) test altyapısı |

---

## 📁 Proje Klasör Yapısı (Monorepo)

```bash
OJS-Nutrition-FS/
├── apps/
│   ├── web/                     # Next.js 15 Frontend (App Router, Tailwind v4, Zustand)
│   │   ├── app/                 # App Router sayfaları, layout'lar ve route grupları
│   │   │   ├── (shop)/          # Vitrin rotaları (Ana Sayfa, Katalog, Ürün Detay, Hesap)
│   │   │   ├── layout.tsx       # Root layout
│   │   │   └── not-found.tsx    # 404 sayfası
│   │   ├── components/          # Modüler UI ve domain bileşenleri (account, auth, catalog, ui...)
│   │   ├── lib/                 # API istemcisi, şemalar (zod), yardımcı araçlar
│   │   ├── test/                # Vitest test dosyaları ve setup
│   │   └── vitest.config.mts    # Test konfigürasyonu
│   │
│   └── api/                     # NestJS 11 Backend API (Prisma, PostgreSQL)
│       ├── prisma/
│       │   ├── schema.prisma    # Veritabanı modelleri (User, Product, Order, Cart vb.)
│       │   └── seed.ts          # Gerçekçi örnek veri besleme scripti
│       ├── src/
│       │   ├── common/          # Interceptor, Filter, Guard ve Decorator'lar
│       │   ├── config/          # Tipli konfigürasyon ve fail-fast env doğrulama
│       │   ├── prisma/          # Global PrismaService
│       │   ├── auth/            # JWT login, register, token refresh ve OAuth stratejileri
│       │   ├── users/           # Profil ve hesap yönetimi
│       │   ├── addresses/       # Adres CRUD işlemleri
│       │   ├── locations/       # İl ve ilçe lookup servisleri
│       │   ├── products/        # Ürünler, varyantlar, kategoriler, çok satanlar
│       │   ├── cart/            # Misafir ve kullanıcı sepet mekanizması
│       │   ├── orders/          # Sipariş oluşturma, atomik stok düşümü, checkout
│       │   ├── payments/        # Ödeme sağlayıcı entegrasyonu (iyzico tokenization)
│       │   ├── reviews/         # Ürün yorumları ve puan agregasyonu
│       │   ├── faq/             # SSS yönetimi
│       │   ├── contact/         # İletişim mesajları
│       │   ├── media/           # Statik medya barındırma (/media)
│       │   └── admin/           # Yönetici paneli istatistik ve metrik uçları
│       └── test/                # Jest E2E testleri
│
├── src/                         # [V1 Referans] İlk aşamadaki Vite SPA kaynak kodları
├── pnpm-workspace.yaml          # pnpm monorepo çalışma alanı tanımı
├── BACKEND_PLAN.md              # Backend mimari ve endpoint spesifikasyonu
├── FRONTEND_NEXTJS_PLAN.md      # Next.js geçiş ve rota mimari planı
└── ENGINEERING_STANDARDS.md     # Temiz kod, N+1 önleme ve güvenlik standartları
```

---

## 🛍️ Sayfa ve Modül Haritası

| Sayfa / Modül | İstemci Rotası | Açıklama |
|---|---|---|
| **Ana Sayfa** | `/` | Çok satanlar, öne çıkan kategoriler, dinamik bannerlar ve arama |
| **Ürün Kataloğu** | `/products` | Kategori filtreleme, sayfalama, sıralama ve grid görünümü |
| **Kategori Detay** | `/products/[category]` | Dinamik kategoriye özel ürün listeleme |
| **Ürün Detay** | `/product/[slug]` | Boyut/Aroma varyant seçimi, besin değerleri tablosu, kullanıcı yorumları |
| **Sepet (Drawer)** | Drawer / Sheet | Adet güncelleme, anlık fiyat hesabı, sunucu senkronizasyonu |
| **Ödeme (Checkout)** | `/payment` | Adres seçimi, dinamik kargo hesaplama, kart tokenization |
| **Sipariş Onayı** | `/payment/thank-you` | Gerçek sipariş özeti ve sipariş takip numarası |
| **Kullanıcı Hesabı** | `/account` | Profil güncelleme, sipariş geçmişi ve detay modalı |
| **Adres Yönetimi** | `/account/addresses` | İl/İlçe seçimiyle adres ekleme, düzenleme ve silme |
| **Kimlik Doğrulama** | `/login`, `/register` | JWT ve Cookie tabanlı giriş, kayıt olma ve şifre doğrulaması |
| **İletişim & SSS** | `/contact`, `/faq` | Zod doğrulamalı iletişim formu ve akordeon SSS listesi |
| **AI Asistan** | Chatbot Widget | Sayfa genelinde çalışan Gemini destekli ürün danışmanı |

---

## 🔌 API Dokümantasyonu ve Endpointler

Backend çalışırken canlı ve etkileşimli Swagger dokümantasyonuna **[http://localhost:3000/docs](http://localhost:3000/docs)** adresinden erişilebilir.

### Temel Endpoint Grupları

```
POST   /api/v1/auth/login                     # Giriş yap (access + refresh token & cookie)
POST   /api/v1/auth/register                  # Yeni kullanıcı kaydı
POST   /api/v1/auth/token/refresh             # Access token yenileme

GET    /api/v1/products                       # Ürün listesi (sayfalama & filtreli)
GET    /api/v1/products/:slug                 # Ürün detayı ve varyantları
GET    /api/v1/products/best-sellers          # Çok satan ürünler
GET    /api/v1/categories                     # Kategori ağacı

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
- **pnpm**: `v9+` (Önerilen paket yöneticisi)
- **PostgreSQL**: `v15+` (Lokal veya Neon / Supabase)

### 1. Depoyu Klonlayın
```bash
git clone https://github.com/bgungor1/OJS-Nutrition-FS.git
cd OJS-Nutrition-FS
```

### 2. Bağımlılıkları Yükleyin
Kök dizinde monorepo bağımlılıklarını tek seferde yükleyin:
```bash
pnpm install
```

### 3. Backend (API) Yapılandırması & Başlatma
```bash
cd apps/api
cp .env.example .env

# Prisma istemcisini üretin ve veritabanı migration'larını uygulayın
pnpm prisma:generate
pnpm prisma:migrate

# Veritabanını örnek verilerle doldurun (seed)
pnpm db:seed

# API geliştirici sunucusunu başlatın
pnpm start:dev
```
> API `http://localhost:3000/api/v1`, Swagger dokümantasyonu ise `http://localhost:3000/docs` adresinde hazır olacaktır.

### 4. Frontend (Web) Yapılandırması & Başlatma
Yeni bir terminal sekmesinde:
```bash
cd apps/web
cp .env.example .env.local

# Next.js geliştirici sunucusunu başlatın
pnpm dev
```
> Frontend `http://localhost:3001` (veya port çakışmasına göre 3000) adresinde çalışacaktır.

Alternatif olarak, kök dizinden doğrudan şu komutlar kullanılabilir:
- `pnpm dev:api` — Backend API sunucusunu başlatır.
- `pnpm dev:web` — Frontend Next.js sunucusunu başlatır.

---

## 🔐 Ortam Değişkenleri (.env)

### Backend (`apps/api/.env`)
```env
# Veritabanı
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ojs_nutrition?schema=public"

# Sunucu & Port
PORT=3000
API_GLOBAL_PREFIX="api/v1"
CORS_ORIGINS="http://localhost:3000,http://localhost:3001"

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

### Frontend (`apps/web/.env.local`)
```env
# Sunucu Taraflı API URL'i (Server Components & Server Actions)
API_BASE_URL=http://localhost:3000/api/v1

# İstemci Taraflı API URL'i (Client Components & Browser)
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api/v1

# Statik Medya & Görsel Sunucu Hostu
NEXT_PUBLIC_IMAGE_HOST=http://localhost:3000
```

---

## 🧪 Test ve Kalite Kontrolleri

Proje uçtan uca kapsamlı bir test ve kod kalitesi altyapısına sahiptir:

```bash
# Kök dizinden tüm testleri çalıştırma
pnpm test

# Sadece Frontend (Next.js - Vitest) testleri
pnpm test:web
pnpm test:web:coverage

# Sadece Backend (NestJS - Jest) testleri
pnpm test:api
pnpm test:api:coverage

# Kod biçimlendirme ve lint denetimleri
pnpm lint:web
pnpm lint:api
```

---

## 📐 Mühendislik Standartları

Proje genelinde uygulanan temiz kod, N+1 sorgu optimizasyonu, güvenlik kuralları ve katmanlı mimari prensipleri için [ENGINEERING_STANDARDS.md](./ENGINEERING_STANDARDS.md) dokümanını; detaylı backend mimarisi ve rota tasarımı için [BACKEND_PLAN.md](./BACKEND_PLAN.md) dokümanını; Next.js geçiş kararları için [FRONTEND_NEXTJS_PLAN.md](./FRONTEND_NEXTJS_PLAN.md) dokümanını inceleyebilirsiniz.

---

## 📝 Lisans

Bu proje **MIT** lisansı altında geliştirilmektedir.
