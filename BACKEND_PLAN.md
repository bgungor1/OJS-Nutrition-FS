# Backend Planı — OJS Nutrition

> Bu doküman, projenin daha önce kullandığı backend sunucusuna (`https://fe1111.projects.academy.onlyjs.com/api/v1`) artık erişim olmadığı için, frontend kodu analiz edilerek çıkarılmış **sıfırdan backend geliştirme planıdır**. Frontend zaten bu API sözleşmesine göre yazıldığından, plan mevcut `src/services/*.ts` ve `src/types/*.ts` dosyalarındaki sözleşmeleri temel alır; tespit edilen tutarsızlıklar düzeltilmiş, eksik özellikler (reviews, FAQ, contact, adres lookup, gerçek ödeme) tamamlanmış olarak sunulur.
>
> Kod yazımı için bkz. [ENGINEERING_STANDARDS.md](./ENGINEERING_STANDARDS.md) (clean code, güvenlik, N+1 ve proje düzeni kuralları).

## İçindekiler

1. [Genel Bakış](#1-genel-bakış)
2. [Teknoloji Yığını](#2-teknoloji-yığını)
3. [Proje Mimarisi](#3-proje-mimarisi)
4. [Veritabanı Şeması](#4-veritabanı-şeması)
5. [API Endpoint Spesifikasyonu](#5-api-endpoint-spesifikasyonu)
6. [Auth & Güvenlik Tasarımı](#6-auth--güvenlik-tasarımı)
7. [Medya / Görsel Sunumu](#7-medya--görsel-sunumu)
8. [Frontend Tarafında Gereken Uyum Değişiklikleri](#8-frontend-tarafında-gereken-uyum-değişiklikleri)
9. [Yol Haritası / Fazlar](#9-yol-haritası--fazlar)
10. [Ortam Değişkenleri](#10-ortam-değişkenleri)
11. [Açık Kararlar / Netleştirilmesi Gerekenler](#11-açık-kararlar--netleştirilmesi-gerekenler)

---

## 1. Genel Bakış

Frontend (`src/`), aşağıdaki mekanizmalarla backend'siz durumda bile ayakta kalabiliyor:

- `src/services/api.ts` içindeki `apiClient`, her isteği **2500ms** sonra `AbortController` ile iptal ediyor.
- `products` ve `best-sellers` servisleri, istek başarısız olursa veya beklenmeyen bir şekil dönerse `src/data/mock-api-data.ts` içindeki mock veriye **sessizce** düşüyor (fallback).
- `src/routes/home` ve `src/routes/products` loader'ları bu fallback'i ikinci bir katman olarak tekrarlıyor.

Bu yüzden **Ana Sayfa, Ürünler ve Ürün Detay sayfaları** backend olmadan da çalışır gibi görünüyor. Ama şu akışların **gerçek bir backend olmadan çalışması mümkün değil** (mock fallback'leri yok):

- Login / Register
- Hesap bilgisi görüntüleme/güncelleme
- Adres CRUD
- Sepetin sunucuyla senkronizasyonu (misafir sepeti localStorage'da çalışmaya devam eder, ama girişli kullanıcıda sync sessizce başarısız olur)
- Sipariş listesi/detayı, kargo ücreti, ödeme ayarları, siparişi tamamlama
- İletişim formu (şu an sadece `console.log` yapıyor, hiç endpoint'e bağlı değil)
- Ürün yorumları (tam tip tanımı var ama hiç endpoint'e bağlı değil, tamamen statik)

**Hedef:** Yukarıdaki tüm akışları destekleyen, frontend'in beklediği response şekline (`{status, data}` zarfı, sayfalama, alan adları) uyumlu, güvenli ve genişletilebilir bir backend kurmak.

---

## 2. Teknoloji Yığını

| Katman | Seçim | Gerekçe |
|---|---|---|
| Framework | **NestJS** (TypeScript) | Frontend zaten TS; modüler yapı (module/controller/service/DTO) büyüyen bir e-ticaret backend'i için sürdürülebilir; guard/interceptor/pipe mekanizmaları auth ve response zarfı için doğal çözüm sunuyor. |
| ORM | **Prisma** | Tip güvenli sorgular, migration yönetimi, ilişkisel şema (Product→Variant, Order→OrderItem vb.) için uygun. |
| Veritabanı | **PostgreSQL** | İlişkisel veri (kategori/ürün/varyant/sipariş) ve JSON alanlar (nutrition_facts gibi) için iyi denge. |
| Doğrulama | `class-validator` + `class-transformer` (DTO'lar) | NestJS ile birebir entegre, request body validasyonu. |
| Auth | `@nestjs/passport` + `passport-jwt` + `bcrypt` | JWT access/refresh + şifre hash'leme. |
| Dosya/medya | Yerel `multer` + NestJS statik sunumu (`/media`), **Render Persistent Disk** üzerinde kalıcı — CDN/S3 planlanmıyor | Bkz. [Bölüm 7](#7-medya--görsel-sunumu). |
| API dokümantasyonu | `@nestjs/swagger` | Endpoint sözleşmesini canlı tutmak, frontend geliştiricisiyle senkron kalmak için. |
| Test | Jest (NestJS varsayılanı) | Servis/controller unit testleri, e2e testler için `supertest`. |

---

## 3. Proje Mimarisi

Önerilen modül yapısı (NestJS modülleri, `src/<module>/` altında controller + service + dto + entity):

```
backend/
├── src/
│   ├── auth/            # login, register, refresh, JWT + Google OAuth strategy'leri, guard'lar
│   ├── users/            # profil (my-account), kullanıcı CRUD (admin)
│   ├── admin/            # dashboard stats, RolesGuard/@Roles() decorator, admin-only agregasyon uçları
│   ├── addresses/        # adres CRUD + country/region/subregion lookup
│   ├── products/         # ürün listesi/detay, kategori, varyant
│   ├── best-sellers/     # ürün modülü altında ayrı endpoint olarak ele alınabilir
│   ├── cart/              # sepet (server-side, girişli kullanıcı için)
│   ├── orders/            # sipariş, kargo ücreti, ödeme ayarları, checkout
│   ├── payments/          # ödeme sağlayıcı entegrasyonu (tokenization)
│   ├── reviews/           # ürün yorumları
│   ├── faq/                # SSS
│   ├── contact/           # iletişim formu
│   ├── media/             # görsel yükleme/sunum
│   ├── common/            # global response interceptor, exception filter, decorator'lar
│   └── prisma/            # PrismaService (tekil client)
├── prisma/
│   └── schema.prisma
└── test/
```

**Ortak altyapı (`common/`):**
- **`ResponseInterceptor`** — her başarılı yanıtı otomatik olarak `{status: 'success', data: <controller'ın döndürdüğü değer>}` şekline sarar. Böylece her controller sadece ham veriyi döndürür, zarf tek bir yerde yönetilir (mevcut kodda address/cart arasında görülen zarf tutarsızlığının kök nedeni buydu — merkezi interceptor bunu yapısal olarak imkansız kılar).
- **`AllExceptionsFilter`** — hataları `{status: 'error', reason: {...}}` (auth/validation hataları için alan bazlı) veya `{status: 'error', message: string}` (genel hatalar için) şekline çevirir.
- **`JwtAuthGuard`** — `Authorization: Bearer <token>` doğrulaması; `@Public()` decorator'ı ile login/register/products gibi public endpoint'ler işaretlenir (varsayılan olarak tüm route'lar korumalı, whitelist yaklaşımı — mevcut frontend'in "token varsa her isteğe ekle" davranışıyla uyumlu ve daha güvenli).
- **`RolesGuard`** — `@Roles('admin')` decorator'ı taşıyan route'larda `User.role === 'admin'` kontrolü yapar; `JwtAuthGuard`'dan sonra çalışır (bkz. 5.10).
- **`OptionalAuthGuard`** — sepet uçlarında (`/cart`) kullanılır; token varsa doğrular, yoksa isteği misafir olarak geçirir (bkz. 5.5).

---

## 4. Veritabanı Şeması

Aşağıdaki model, Prisma şeması olarak düşünülmüştür (alan tipleri özet, gerçek `schema.prisma`'da `@id`, `@relation`, `@default` vb. eklenecek).

```prisma
model User {
  id            String       @id @default(uuid())
  email         String       @unique
  passwordHash  String?      // Google ile kayıt olan kullanıcılarda null (bkz. 5.1)
  authProvider  AuthProvider @default(local)
  googleId      String?      @unique
  role          Role         @default(customer)   // admin panel yetkilendirmesi — bkz. 5.10
  firstName     String
  lastName      String
  phoneNumber   String?
  createdAt     DateTime     @default(now())
  addresses     Address[]
  cartItems     CartItem[]
  orders        Order[]
  reviews       Review[]
}
enum AuthProvider {
  local
  google
}
enum Role {
  customer
  admin
}

model Country {
  id      Int      @id @default(autoincrement())
  name    String
  regions Region[]
}
model Region {
  id          Int         @id @default(autoincrement())
  name        String
  countryId   Int
  country     Country     @relation(fields: [countryId], references: [id])
  subregions  Subregion[]
}
model Subregion {
  id        Int    @id @default(autoincrement())
  name      String
  regionId  Int
  region    Region @relation(fields: [regionId], references: [id])
}

model Address {
  id            String    @id @default(uuid())
  userId        String
  user          User      @relation(fields: [userId], references: [id])
  title         String
  firstName     String
  lastName      String
  countryId     Int
  regionId      Int
  subregionId   Int
  fullAddress   String
  phoneNumber   String
}

model Category {
  id            String       @id @default(uuid())
  name          String
  slug          String       @unique
  subCategories SubCategory[]
  products      Product[]
}
model SubCategory {
  id          String    @id @default(uuid())
  name        String
  slug        String
  categoryId  String
  category    Category  @relation(fields: [categoryId], references: [id])
  products    Product[]
}

model Product {
  id                String            @id @default(uuid())
  name              String
  slug              String            @unique
  shortExplanation  String
  usage             String
  features          String
  description       String
  nutritionalContent Json             // { ingredients, nutrition_facts, amino_acid_facts } — bkz. 5.3
  tags              String[]
  mainCategoryId    String
  subCategoryId     String
  isBestSeller      Boolean           @default(false)
  bestSellerRank    Int?
  createdAt         DateTime          @default(now())
  variants          ProductVariant[]
  reviews           Review[]
  commentCount      Int               @default(0)   // reviews'dan denormalize, trigger/job ile güncellenir
  averageStar       Float             @default(0)
}

model ProductVariant {
  id                String   @id @default(uuid())
  productId         String
  product           Product  @relation(fields: [productId], references: [id])
  gram              Int
  pieces            Int
  totalServings     Int
  aroma             String
  totalPrice        Decimal
  discountedPrice   Decimal?
  pricePerServing   Decimal
  photoSrc          String
  isAvailable       Boolean  @default(true)   // admin'in manuel "satışa kapat" anahtarı
  stockQuantity     Int      @default(0)      // gerçek stok takibi — bkz. 5.6.1
}

model Review {
  id            String   @id @default(uuid())
  productId     String
  product       Product  @relation(fields: [productId], references: [id])
  userId        String?
  user          User?    @relation(fields: [userId], references: [id])
  reviewerName  String
  rating        Int      // 1-5
  isVerified    Boolean  @default(false)
  title         String
  text          String
  images        String[]
  helpfulCount  Int      @default(0)
  createdAt     DateTime @default(now())
}

model CartItem {
  id               String    @id @default(uuid())
  userId           String?
  user             User?     @relation(fields: [userId], references: [id])
  guestSessionId   String?   // userId null ise misafir sepeti — bkz. 5.5
  productId        String
  productVariantId String
  pieces           Int
  createdAt        DateTime  @default(now())

  @@unique([userId, productVariantId])
  @@unique([guestSessionId, productVariantId])
}

model Order {
  id            String       @id @default(uuid())
  orderNo       String       @unique
  userId        String
  user          User         @relation(fields: [userId], references: [id])
  status        OrderStatus  @default(pending)
  totalPrice    Decimal
  shippingFee   Decimal
  addressSnapshot Json       // OrderAddress şekli — sipariş anındaki adres kopyası
  createdAt     DateTime     @default(now())
  items         OrderItem[]
  payment       PaymentTransaction?
}
enum OrderStatus {
  pending
  processing
  shipped
  delivered
  cancelled
  returned
}

model OrderItem {
  id                String  @id @default(uuid())
  orderId           String
  order             Order   @relation(fields: [orderId], references: [id])
  productId         String
  productVariantId  String
  productName       String
  variantName       String?
  pieces            Int
  unitPrice         Decimal
  totalPrice        Decimal
  photo             String?
}

model PaymentTransaction {
  id              String   @id @default(uuid())
  orderId         String   @unique
  order           Order    @relation(fields: [orderId], references: [id])
  provider        String   // örn. "iyzico"
  providerRef     String   // sağlayıcıdan dönen işlem/token referansı
  cardType        String   // "VISA" | "MASTERCARD"
  last4           String   // sadece son 4 hane saklanır, tam PAN asla saklanmaz
  status          String   // "succeeded" | "failed" | "refunded"
  createdAt       DateTime @default(now())
}

model FaqItem {
  id        String @id @default(uuid())
  question  String
  answer    String
  category  String // "genel" | "urunler" | "kargo"
}

model ContactMessage {
  id        String   @id @default(uuid())
  name      String
  email     String
  message   String
  createdAt DateTime @default(now())
  handled   Boolean  @default(false)
}
```

**Not:** `Product.nutritionalContent` alanı `Json` tipinde tutulur çünkü frontend'in beklediği şekil (`ingredients`, `nutrition_facts.ingredients[].amounts[]`, `amino_acid_facts`) oldukça iç içe ve varyanta özgü; ilişkisel modellemek getirisi olmayan bir karmaşıklık ekler.

**Not:** API yanıtındaki gerçek "satın alınabilirlik" (`is_available` frontend alanı) DB'de ayrı bir kolon olarak **saklanmaz**, response katmanında `isAvailable && stockQuantity > 0` olarak hesaplanır — tek doğruluk kaynağı `stockQuantity` olur, iki alanın birbirinden bağımsız yanlış senkronize olması engellenir.

**Not:** `CartItem.userId`/`guestSessionId` çifti Prisma seviyesinde XOR olarak zorlanamaz (bu tür kısıtlar migration'a elle eklenen bir Postgres `CHECK` constraint'i gerektirir); pratik yaklaşım, servis katmanında ikisinden tam birinin dolu olmasını garanti etmek — bkz. [5.5](#55-sepet-cart).

---

## 5. API Endpoint Spesifikasyonu

Tüm başarılı yanıtlar `{"status": "success", "data": ...}`, hatalar `{"status": "error", "reason": {...}}` şeklinde döner (bkz. `ResponseInterceptor`).

### 5.1 Auth (`/auth`)

| Method | Path | Auth | Request | Response `data` |
|---|---|---|---|---|
| POST | `/auth/login` | Public | `{ username /* email */, password }` | `{ access, refresh }` |
| POST | `/auth/register` | Public | `{ email, password, password2, first_name, last_name }` | `{ user: User, message }` |
| POST | `/auth/token/refresh` | Public (refresh token body ile) | `{ refresh }` | `{ access }` |
| GET | `/auth/google` | Public | — | Google OAuth consent ekranına redirect |
| GET | `/auth/google/callback` | Public | — | Google'dan dönen `code` işlenir; `email` ile mevcut kullanıcı eşleştirilir ya da `authProvider: google` ile yeni kullanıcı oluşturulur, ardından `access`/`refresh` frontend'e (cookie/redirect ile) iletilir |

> `api_key` alanı **kesin olarak kaldırıldı** — eski projeye erişim mümkün olmadığından amacı netleştirilemedi, bu alan yeni backend'de hiç bulunmayacak.

**Not (Google OAuth):** `passwordHash` alanı `google` provider'lı kullanıcılarda `null` olur; login akışında `authProvider === 'local'` olan kullanıcılar için şifre kontrolü yapılır, `google` olanlar sadece OAuth ile giriş yapabilir (aynı e-postayla local+google karışık girişe izin verilmez, kafa karıştırıcı edge-case'leri önler).

### 5.2 Kullanıcı / Hesap (`/users`)

| Method | Path | Auth | Request | Response `data` |
|---|---|---|---|---|
| GET | `/users/my-account` | Bearer | — | `AccountProfile` |
| PUT | `/users/my-account` | Bearer | `{ first_name, last_name, phone_number }` | `AccountProfile` |

`/auth/profile` endpoint'i **kaldırılır** — frontend zaten sadece `/users/my-account`'u kullanıyor, iki profil kaynağının tekilleştirilmesi.

### 5.3 Ürünler (`/products`)

| Method | Path | Auth | Query/Body | Response `data` |
|---|---|---|---|---|
| GET | `/products` | Public | `?limit=&offset=&category=` | `{ count, next, previous, results: ApiProduct[] }` |
| GET | `/products/:slug` | Public | — | `ApiProductDetail` (variants dahil) |
| GET | `/products/best-sellers` | Public | — | `ApiBestSellerProduct[]` |
| GET | `/categories` | Public | — | `Category[]` (`subCategories` dahil) — yeni |

`category` query param'ı `Category.slug` veya `SubCategory.slug` kabul eder. `/categories` endpoint'i, frontend'in **dinamik kategori sayfaları** (`products/[category]`, bkz. `FRONTEND_NEXTJS_PLAN.md` §4) için `generateStaticParams`'ta kullanılır — kategori nav menüsü de aynı veriyi kullanır.

`ApiProduct`, `ApiProductDetail`, `ApiProductVariant`, `ApiBestSellerProduct` alan adları için önceki (artık kullanılmayan) frontend'deki `types/api.ts` sözleşmesi referans alınır — `price_info`/`price` içindeki `total_price`, `discounted_price`, `discount_percentage`, `profit`, `price_per_servings` **backend'de hesaplanıp** döndürülür.

### 5.4 Adresler (`/users/addresses`)

| Method | Path | Auth | Request | Response `data` |
|---|---|---|---|---|
| GET | `/users/addresses?limit=&offset=` | Bearer | — | `{ count, results: Address[] }` |
| GET | `/users/addresses/:id` | Bearer | — | `Address` |
| POST | `/users/addresses` | Bearer | `CreateAddressRequest` | `Address` |
| PUT | `/users/addresses/:id` | Bearer | `UpdateAddressRequest` | `Address` |
| DELETE | `/users/addresses/:id` | Bearer | — | `{ id }` |

**Yeni — lookup endpoint'leri** (adres formundaki elle ID girme sorununu çözer):

| Method | Path | Auth | Response `data` |
|---|---|---|---|
| GET | `/locations/countries` | Public | `Country[]` |
| GET | `/locations/countries/:countryId/regions` | Public | `Region[]` |
| GET | `/locations/regions/:regionId/subregions` | Public | `Subregion[]` |

> Response zarfı artık `ResponseInterceptor` sayesinde tüm address endpoint'lerinde **tutarlı** — mevcut koddaki `{count,results}` / bare `Address` / `{status,data}` karışıklığı ortadan kalkıyor.

### 5.5 Sepet (`/cart`)

**Karar:** sepet artık misafir kullanıcılar için de tamamen **backend'de** tutulur — frontend tarafında `localStorage`'a sepet verisi yazılmaz (bkz. [`FRONTEND_NEXTJS_PLAN.md`](./FRONTEND_NEXTJS_PLAN.md) §9 madde 4). `Authorization` header'ı olmayan isteklerde backend, `guest_cart_id` adında `HttpOnly` bir cookie üzerinden misafir oturumunu yönetir (yoksa `Set-Cookie` ile oluşturur).

| Method | Path | Auth | Request | Response `data` |
|---|---|---|---|---|
| GET | `/cart` | Public (opsiyonel Bearer) | — | `CartItem[]` |
| POST | `/cart` | Public (opsiyonel Bearer) | `{ product_id: string, product_variant_id: string, pieces: number }` | `CartItem[]` |
| DELETE | `/cart` | Public (opsiyonel Bearer) | `{ product_id: string, product_variant_id: string, pieces: number }` | `CartItem[]` |
| POST | `/cart/merge` | Bearer | — | `CartItem[]` |

- **`OptionalAuthGuard`** (yeni) — `Authorization` header'ı varsa doğrulayıp `req.user`'ı set eder, yoksa isteği reddetmeden geçirir. Controller, `req.user` yoksa `guest_cart_id` cookie'sine göre çalışır.
- **`POST /cart/merge`** — login/register başarılı olduğu anda frontend tarafından çağrılır: `guest_cart_id` cookie'sindeki kalemler `userId`'ye taşınır (aynı varyant zaten kullanıcının sepetindeyse `pieces` toplanır), ardından cookie temizlenir. Bu, eski plandaki "girişte misafir sepetinin sunucuya merge edilmesi" ihtiyacını localStorage yerine **iki sunucu-taraflı sepetin birleştirilmesi** olarak karşılar.
- Path `/users/cart` → `/cart` olarak sadeleştirildi çünkü artık yalnızca giriş yapmış kullanıcıya özel bir kaynak değil.
- `product_id` her yerde **`string`** olarak standardize edilir (eski/karşılaştırma amaçlı frontend'deki `RemoveFromCartRequest`/`CartItem`'da görülen `number` tutarsızlığı burada baştan doğru kurulur).

### 5.6 Siparişler (`/orders`)

| Method | Path | Auth | Request | Response `data` |
|---|---|---|---|---|
| GET | `/orders` | Bearer | — | `Order[]` |
| GET | `/orders/:orderId` | Bearer | — | `Order` (cart_detail + address dahil) |
| GET | `/orders/payment-settings` | Bearer | — | `{ card_types, payment_types }` |
| GET | `/orders/calculate-shipment-fee?address_id=` | Bearer | — | `{ fee, currency }` |
| POST | `/orders/complete-shopping` | Bearer | `CompleteShoppingRequest` (bkz. altta) | `Order` |

**`CompleteShoppingRequest` (düzeltilmiş):**
```ts
{
  address_id: string
  payment_type: 'credit_card' | 'debit_card'   // "cart" yazım hatası düzeltildi
  payment_token: string   // ödeme sağlayıcısından (iyzico/Stripe) alınan tek kullanımlık token — ham kart bilgisi ARTIK backend'e hiç gönderilmiyor
}
```
Ham kart numarası/CVV, frontend'de doğrudan ödeme sağlayıcısının client-side SDK'sı ile tokenize edilip backend'e sadece token gönderilir (bkz. [Bölüm 6](#6-auth--güvenlik-tasarımı) ve [Bölüm 8](#8-frontend-tarafında-gereken-uyum-değişiklikleri)).

#### 5.6.1 Stok Yönetimi ve Eşzamanlılık (Concurrency)

Gerçek stok takibi yapıldığı için (`ProductVariant.stockQuantity`), **"iki kullanıcı aynı anda son 1 adedi satın almaya çalışırsa ne olur"** sorusu somut bir şekilde çözülmeli:

- **Sepete ekleme aşamasında stok rezerve edilmez.** `POST /users/cart`, `stockQuantity`'i sadece kullanıcıya "sadece X adet kaldı" gibi bir uyarı göstermek için kontrol eder; iki farklı kullanıcı aynı ürünü sepetine ekleyebilir, çakışma burada engellenmez (standart e-ticaret davranışı — Amazon/Trendyol da böyle çalışır).
- **Gerçek çekişme `POST /orders/complete-shopping`'te, DB transaction içinde çözülür.** Her sepet kalemi için **koşullu/atomik update** yapılır:
  ```sql
  UPDATE "ProductVariant"
  SET "stockQuantity" = "stockQuantity" - :pieces
  WHERE id = :variantId AND "stockQuantity" >= :pieces
  ```
  (Prisma'da `updateMany` + `where: { stockQuantity: { gte: pieces } }`, dönen `count` kontrol edilir.) `count === 0` ise o kalem için stok yetersiz demektir, **transaction tamamen rollback olur** — sipariş ya hep ya hiç oluşur, kısmi/eksik sipariş oluşmaz. Bu yaklaşım `SELECT ... FOR UPDATE` ile satır kilitlemeye göre daha basit ve deadlock riski taşımaz, çünkü tek atomik `UPDATE` sorgusuna dayanır.
- Stok yetersizliği durumunda API, hangi kalemin/kalemlerin stokta olmadığını belirten alan-bazlı bir hata döner (frontend sepette o kalemi işaretleyip kullanıcıyı uyarabilir).
- **İptal/iade:** `Order.status` `cancelled` veya `returned`'a çekildiğinde (admin panelinden, bkz. 5.10), ilgili `OrderItem`'ların `pieces` miktarı karşılık gelen `ProductVariant.stockQuantity`'e **geri eklenir** (aynı transaction deseniyle).

### 5.7 Yorumlar (`/products/:slug/reviews`) — yeni

| Method | Path | Auth | Request | Response `data` |
|---|---|---|---|---|
| GET | `/products/:slug/reviews?limit=&offset=&rating=` | Public | — | `{ count, results: Review[], stats: ReviewStats }` |
| POST | `/products/:slug/reviews` | Bearer | `{ rating, title, text, images? }` | `Review` |

`reviewerName` girişli kullanıcının adından otomatik doldurulur; `isVerified` kullanıcının bu ürünü satın almış olup olmadığına (Order tablosunda eşleşme) göre backend'de hesaplanır. Kayıt sonrası `Product.commentCount`/`averageStar` transaction içinde güncellenir.

### 5.8 SSS (`/faq`) — yeni

| Method | Path | Auth | Response `data` |
|---|---|---|---|
| GET | `/faq?category=` | Public | `FaqItem[]` |

### 5.9 İletişim (`/contact`) — yeni

| Method | Path | Auth | Request | Response `data` |
|---|---|---|---|---|
| POST | `/contact` | Public | `{ name, email, message }` | `{ id, message: "Mesajınız alındı" }` |

Basit rate-limit (IP başına, örn. `@nestjs/throttler`) önerilir, spam'i önlemek için.

### 5.10 Admin (`/admin`) — yeni

Gerçek bir e-ticaret deneyimi için ayrı bir admin panel isteniyor (bkz. [Bölüm 11](#11-açık-kararlar--netleştirilmesi-gerekenler)). Yetkilendirme `RolesGuard` + `@Roles('admin')` decorator'ıyla yapılır (`User.role`, bkz. Bölüm 4); mevcut public/kullanıcı endpoint'lerinin mutasyon işlemleri (ürün oluşturma/silme gibi) aynı controller'lara admin-only olarak eklenir, yalnızca admin'e özgü yeni uçlar burada listelenir:

| Method | Path | Auth | Request | Response `data` |
|---|---|---|---|---|
| GET | `/admin/dashboard/stats` | Admin | — | `{ totalOrders, totalRevenue, ordersByStatus, recentOrders, topProducts }` |
| POST / PUT / DELETE | `/products`, `/products/:id`, `/products/:id/variants/:variantId` | Admin | ürün/varyant DTO'ları | `Product` / `ProductVariant` |
| PUT | `/orders/:id/status` | Admin | `{ status: OrderStatus }` | `Order` (stok geri-ekleme tetiklenir — bkz. 5.6.1) |
| POST / PUT / DELETE | `/faq`, `/faq/:id` | Admin | `FaqItem` DTO'ları | `FaqItem` |
| GET | `/contact` | Admin | `?handled=` | `{ count, results: ContactMessage[] }` |
| PUT | `/contact/:id` | Admin | `{ handled: boolean }` | `ContactMessage` |
| GET | `/admin/users` | Admin | `?limit=&offset=` | `{ count, results: User[] }` (salt-okunur) |
| DELETE | `/reviews/:id` | Admin | — | `{ id }` (moderasyon) |

`/admin/dashboard/stats` sipariş/gelir/best-seller özetini döner — hem "gerçek e-ticaret" hissini güçlendirir hem de admin frontend'inde basit bir grafik/istatistik ekranı için veri sağlar.

---

## 6. Auth & Güvenlik Tasarımı

- **Şifreler:** `bcrypt` ile hash'lenir (10-12 salt round), asla düz metin saklanmaz/loglanmaz.
- **JWT:** `access` token kısa ömürlü (örn. 15 dk), `refresh` token uzun ömürlü (örn. 7 gün) ve DB'de (veya Redis'te) `hash`'lenerek saklanır ki logout/iptal mümkün olsun. Access token süresi dolduğunda frontend `401` alır — **frontend'e bir axios/fetch interceptor eklenmesi gerekiyor** (bkz. Bölüm 8) ki `refresh` otomatik denensin; şu anki kod bunu hiç yapmıyor.
- **`api_key` alanı:** Amacı frontend kodundan çıkarılamadı (muhtemelen okul/academy projesinin çoklu-tenant koruması). Yeni backend'de **zorunlu tutulmuyor**; kullanıcı isterse ileride basit bir "istemci anahtarı" (rate-limit/analytics amaçlı, header üzerinden, `X-Client-Key`) olarak yeniden eklenebilir.
- **Ödeme verisi:** Ham kart numarası/CVV **hiçbir zaman** kendi veritabanımıza yazılmaz veya loglanmaz. **iyzico** entegre edilir (bkz. Bölüm 11 madde 1 — sandbox hesabı ücretsiz/e-posta ile açılıyor): frontend, iyzico'nun client-side SDK'sıyla kart bilgisini doğrudan sağlayıcıya gönderip bir tek-kullanımlık token/checkout-form referansı alır, backend'e sadece bu token + `address_id` gider. `payments` modülü bu token'ı iyzico API'sine iletip sonucu `PaymentTransaction` tablosuna (sadece `last4`, `cardType`, `providerRef`, `status`) kaydeder.
- **CORS:** Sadece frontend'in origin'i (dev: `http://localhost:5173`, prod: gerçek domain) whitelist'e alınır.
- **Rate limiting:** `@nestjs/throttler` ile login/register/contact gibi kötüye kullanılabilecek endpoint'lerde IP başına limit.
- **HTTP Güvenlik Başlıkları:** `helmet` middleware'i ile X-Frame-Options, X-Content-Type-Options, HSTS ve CSP başlıkları üretimde aktif tutulur.
- **İstek Boyutu Sınırı (DoS Koruması):** Bellek tükenmesini önlemek için genel JSON parser limiti `50kb` ile sınırlandırılır.
- **Dosya & Medya Yükleme Güvenliği:** Yüklenen görsellerde uzantı yerine magic-bytes doğrulaması yapılır, SVG formatı (Stored XSS riski) reddedilir, dosyalar rastgele UUID ile isimlendirilir ve 5MB dosya boyutu sınırı uygulanır.
- **Webhook İmza Doğrulaması:** iyzico asenkron bildirimlerinde HMAC-SHA256 imzası (`X-IYZICO-SIGNATURE`) doğrulanmadan hiçbir sipariş durumu değiştirilmez.
- **Sıralama / Filtreleme Whitelist:** Dinamik sıralama parametreleri (`sort`) DTO seviyesinde açık bir beyaz liste (`@IsIn`) ile kısıtlanır; keyfi kolon enjeksiyonu engellenir.
- **Güvenlik Denetim Günlüğü (Audit Log):** Başarısız oturum denemeleri, şifre/rol değişiklikleri, ürün fiyat müdahaleleri ve sipariş iptalleri IP ve kullanıcı bilgisiyle loglanır.
- **Girdi doğrulama:** Her DTO'da `class-validator` decorator'ları (email format, min/max length, enum) — frontend'deki zod şemalarıyla (`src/schemas/auth.ts`) aynı kurallar (min 8 karakter + büyük/küçük harf + rakam) backend'de de zorunlu kılınır.

---

## 7. Medya / Görsel Sunumu

- `photo_src` alanları backend'den **göreli path** olarak döner (örn. `media/products/whey-protein-cikolata.jpg`), frontend'deki `src/utils/getImageUrl.ts` bunu bir `IMAGE_BASE_URL` ile birleştiriyor.
- **Karar: CDN/S3 geçişi planlanmıyor.** NestJS'in statik dosya sunumu (`ServeStaticModule`, `/media` altında) kalıcı çözüm olarak kabul edilir. Render'ın varsayılan web service disk'i **ephemeral**'dır (redeploy/restart'ta dosyalar silinir), bu yüzden `/media` dizini **Render Persistent Disk**'e mount edilir — bu bir CDN değil, sadece küçük/ucuz bir kalıcı disk eklentisidir, mimariyi değiştirmez. Gelecekte hiç kullanılmayacak bir local/S3 seçimi için soyutlama (`MediaStorageService` arayüzü) eklenmez (YAGNI) — `media` modülü doğrudan dosya sistemine yazar/okur.
- Her ürün varyantının geçerli bir `photo_src`'i olması **veritabanı seviyesinde zorunlu kılınmaz** ama seed/admin akışında uyarı verilir (frontend, eksikse zaten bundled bir placeholder'a düşüyor).

---

## 8. Frontend Tarafında Gereken Uyum Değişiklikleri

> **Güncelleme:** Mevcut Vite/React repo'suna (CV'lerde linkli) **dokunulmayacağına** karar verildi — bkz. `FRONTEND_NEXTJS_PLAN.md` §9. Yeni backend, ayrı bir monorepo'daki **yeni Next.js istemcisi** tarafından tüketilecek. Bu bölüm artık "eski repoda yapılacaklar listesi" değil, aşağıdaki sözleşme farklarının **yeni Next.js tarafında karşılığının ne olacağını** gösteren bir referanstır (bazı maddeler zaten yukarıda güncel kararlarla — sepet, ödeme, kategori — değişti).

Backend tasarımı eski frontend'in sözleşmesini referans alıyor, ama şu noktalarda **kasıtlı farklar** var:

1. **`VITE_API_BASE_URL`** — yeni backend'in URL'ine güncellenir (`.env`).
2. **`src/utils/getImageUrl.ts`** — hardcoded `IMAGE_BASE_URL` yerine `import.meta.env.VITE_IMAGE_BASE_URL` okunur.
3. **`src/types/cart.ts`** — `RemoveFromCartRequest.product_id` ve `CartItem.product_id` tipleri `number`'dan `string`'e çevrilir (backend'le tutarlı olsun diye); `cartStore`'daki ilgili çağrılar güncellenir.
4. **`src/types/order.ts`** — `CompleteShoppingRequest` yeni şekliyle (`payment_type: 'credit_card'|'debit_card'`, ham kart alanları yerine `payment_token`) güncellenir; `payment.tsx` akışına seçilen ödeme sağlayıcısının client-SDK'sı entegre edilir (kart formu artık backend'e değil sağlayıcıya gidiyor).
5. **`src/services/api.ts`** — 401 yanıtında otomatik `refresh` deneyen bir interceptor eklenir (şu an `authApi.refreshToken` tanımlı ama hiç çağrılmıyor).
6. **`src/services/auth.ts`** — kaldırılan `/auth/profile` çağrısı silinir (zaten kullanılmıyordu); `api_key` alanı login/register body'sinden çıkarılır.
7. **`src/components/contact/contact-form.tsx`** — `onSubmit`'teki `console.log` yerine yeni `contactApi.submit()` (yeni `src/services/contact.ts`) çağrılır.
8. **Reviews** — yeni `src/services/reviews.ts` eklenir; `product-detail.tsx`'teki statik `review-data.ts` kullanımı gerçek `GET /products/:slug/reviews` çağrısıyla değiştirilir, "YORUM (17)" butonuna bir yorum-gönderme formu bağlanır.
9. **Adres formu** (`add-address-modal.tsx`) — elle "İl ID/İlçe ID" girme yerine yeni `/locations/*` lookup endpoint'leriyle beslenen ülke→il→ilçe seçim (cascading select) kutuları eklenir.
10. **`payment/thank-you`** — hardcoded sipariş numarası yerine `complete-shopping` yanıtındaki gerçek `order_no` route state ile taşınır ve gösterilir.
11. **Google OAuth butonları** — ya gerçek bir OAuth akışına bağlanır (kapsam dışı bırakılırsa) ya da netleşene kadar UI'dan kaldırılır (bkz. Bölüm 11).

Bu değişiklikler bu planın kapsamında **yalnızca listelenmiştir**; ayrı bir görev/PR olarak uygulanmalıdır.

---

## 9. Yol Haritası / Fazlar

### Faz 1 — Çekirdek (uygulamayı gerçek veriyle ayağa kaldırır)
- Auth (login/register/refresh), Users (my-account)
- Products, ProductVariant, Category/SubCategory, BestSellers (seed verisiyle — `mock-api-data.ts` doğrudan seed script'ine dönüştürülebilir)
- `ResponseInterceptor` + `AllExceptionsFilter` + `JwtAuthGuard` altyapısı

### Faz 2 — Alışveriş akışı
- Cart (misafir + kullanıcı, ikisi de server-side; `guest_cart_id` cookie + `POST /cart/merge` ile login'de birleştirme — bkz. 5.5)
- Addresses + Locations lookup
- Orders (liste/detay), payment-settings, calculate-shipment-fee
- Payments modülü + seçilen sağlayıcı (bkz. Bölüm 11) entegrasyonu, complete-shopping

### Faz 3 — İçerik & etkileşim
- Reviews (okuma + yazma + rating aggregate)
- FAQ
- Contact

### Faz 4 — Sertleştirme
- Rate limiting, refresh-token blacklist/rotation, audit log
- Render Persistent Disk kurulumu (bkz. Bölüm 7) — CDN geçişi planlanmıyor
- Swagger dokümantasyonunun canlı tutulması, e2e test kapsamı

### Faz 5 — Admin Panel
- `User.role` + `RolesGuard`, `/admin/*` uçları (dashboard stats, ürün/sipariş/FAQ/contact yönetimi — bkz. 5.10)
- Frontend: ayrı bir admin arayüzü (bkz. `FRONTEND_NEXTJS_PLAN.md`) — aynı backend'e karşı çalışan, role-korumalı ikinci bir istemci

---

## 10. Ortam Değişkenleri

**Backend (`.env`):**
```
DATABASE_URL=postgresql://user:pass@localhost:5432/ojs_nutrition
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d
PORT=3000
CORS_ORIGIN=http://localhost:5173
IYZICO_API_KEY=...                # sandbox: sandbox-merchant.iyzipay.com üzerinden alınır
IYZICO_SECRET_KEY=...
IYZICO_BASE_URL=https://sandbox-api.iyzipay.com
MEDIA_BASE_URL=http://localhost:3000/media
MEDIA_STORAGE_PATH=./media               # prod'da Render Persistent Disk mount path'i (örn. /data/media)
```

**Frontend (`.env`, güncellenecek):**
```
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_IMAGE_BASE_URL=http://localhost:3000/media
```

---

## 11. Açık Kararlar / Netleştirilmesi Gerekenler

Bu konular kod yazılmaya başlamadan önce netleştirilmeli:

1. ~~**Ödeme sağlayıcısı seçimi**~~ → **Karar: iyzico.** Sandbox/test merchant hesabı gerçek şirket/vergi no gerekmeden e-posta ile açılabiliyor (`sandbox-merchant.iyzipay.com`), test kartları ve dokümantasyon hazır — hem portfolyo demosu hem de TR mülakatlarında en çok beklenen entegrasyon olması açısından uygun.
2. ~~**Stok takibi**~~ → **Karar: gerçek `stockQuantity` takibi yapılıyor.** Eşzamanlılık (aynı ürünü aynı anda alan iki kullanıcı) atomik koşullu `UPDATE` + transaction ile çözülüyor — detay için bkz. [5.6.1](#561-stok-yönetimi-ve-eşzamanlılık-concurrency).
3. ~~**Google OAuth**~~ → **Karar: entegre edilecek.** `passport-google-oauth20`, `User.authProvider`/`googleId` alanları — bkz. [5.1](#51-auth-auth).
4. ~~**`api_key` alanının orijinal amacı**~~ → **Karar: kaldırıldı.** Eski projeye erişim şansı yok, amacı netleştirilemiyor; yeni backend bu alanı hiç içermeyecek.
5. ~~**Best-seller belirleme mantığı**~~ → **Karar: kabul edildi.** Faz 1'de manuel `isBestSeller` flag'i, otomasyon (satış/puan bazlı) sonraki bir fazda değerlendirilebilir — şimdilik zorunlu değil.
6. ~~**Admin paneli**~~ → **Karar: dahil.** Gerçek bir e-ticaret deneyimi sunmak için backend'e `/admin/*` uçları (bkz. [5.10](#510-admin-admin--yeni)) ve Faz 5 olarak ayrı bir frontend istemcisi ekleniyor.
