# Frontend Next.js Geçiş Planı — OJS Nutrition

> Bu doküman, mevcut React 19 + Vite + react-router SPA'sının **Next.js (App Router)** ile yeniden yazılması için hazırlanmıştır. Amaç prod-grade bir "büyütme" değil, **CV/portfolyo değeri yüksek bir full-stack örnek proje** ortaya koymak — bu yüzden kapsam, mülakatta anlatılabilecek somut kararlar (Server Component vs Client Component, cookie-based auth, ISR) etrafında tutulmuştur. [`BACKEND_PLAN.md`](./BACKEND_PLAN.md) ile birlikte okunmalıdır; bu plan backend'in Faz 1'inin (auth + products) bitmiş olduğunu varsayar.
>
> Kod yazımı için bkz. [ENGINEERING_STANDARDS.md](./ENGINEERING_STANDARDS.md) (clean code, güvenlik, N+1 ve proje düzeni kuralları).

## İçindekiler

1. [Genel Bakış & Repo Stratejisi](#1-genel-bakış--repo-stratejisi)
2. [Teknoloji Yığını](#2-teknoloji-yığını)
3. [Proje/Repo Yapısı](#3-projerepo-yapısı)
4. [Route Haritası (eski → yeni)](#4-route-haritası-eski--yeni)
5. [Veri Çekme Stratejisi (Server vs Client)](#5-veri-çekme-stratejisi-server-vs-client)
6. [Auth & Middleware Tasarımı](#6-auth--middleware-tasarımı)
   - [6a. Admin Uygulaması](#6a-admin-uygulaması-appsadmin--yetkilendirme)
7. [Ortam Değişkenleri](#7-ortam-değişkenleri)
8. [Yol Haritası / Fazlar](#8-yol-haritası--fazlar)
9. [Açık Kararlar](#9-açık-kararlar)

---

## 1. Genel Bakış & Repo Stratejisi

- **Mevcut repo (`OJS.Nutrition`, Vite SPA) dokunulmaz kalır.** Halihazırda bazı CV'lerde linklenmiş; geçmişi bozmadan, ayrı bir yerde durmaya devam eder ("v1" referansı gibi düşünülebilir).
- Next.js + NestJS birlikte **yeni ve ayrı bir repo**da geliştirilir, temiz bir git geçmişiyle başlar (mimari zaten yeniden yazım olduğu için eski commit geçmişini taşımanın getirisi yok).
- Yeni repo **monorepo** olarak kurulur (`apps/web` = Next.js, `apps/api` = NestJS) — bkz. [Bölüm 3](#3-projerepo-yapısı) ve [Bölüm 9](#9-açık-kararlar) madde 1.
- Bu proje SEO/trafik ihtiyacı olan bir prod ürün değil; bu yüzden kapsam bilinçli olarak "Next.js'in neyi neden çözdüğünü gösteren" noktalarla sınırlı tutuluyor, her özelliğin server-first cilalanması hedeflenmiyor.

---

## 2. Teknoloji Yığını

| Katman | Seçim | Gerekçe |
|---|---|---|
| Framework | **Next.js (App Router)** | Server Component + Server Actions + Metadata API ile gösterilecek somut, güncel pattern'ler. |
| State (client) | **Zustand** (korunuyor) | Sepet, UI state gibi salt client-side kalan şeyler için; auth token'ı artık burada tutulmuyor (bkz. Bölüm 6). |
| Form | `react-hook-form` + `zod` (korunuyor) | Mevcut `src/schemas/*` doğrudan taşınabilir. |
| Stil | Tailwind v4 (`@tailwindcss/postcss`) | Vite plugin'i yerine Next'in PostCSS entegrasyonu; config neredeyse birebir taşınır. |
| UI primitives | radix-ui, `lucide-react`, `motion` (korunuyor) | Değişiklik gerekmiyor, hepsi client component içinde çalışmaya devam eder. |
| Görsel | `next/image` | Backend'in döndürdüğü göreli `photo_src` + `remotePatterns` config'i ile otomatik optimize/lazy-load. |
| Test | **Vitest + React Testing Library + jsdom** | ESM-native, Next.js 15 ve React 19 ile yüksek hızlı birim ve bileşen testleri; Jest-DOM matcher'ları ile erişilebilirlik ve DOM davranışı doğrulaması. |
| Deploy | **Vercel** (web) + **Render** (api, Persistent Disk ile — bkz. `BACKEND_PLAN.md` §7) + Neon/Supabase (Postgres) | Hepsi ücretsiz/düşük maliyetli tier'da; tek komutla canlı demo linki. |

---

## 3. Proje/Repo Yapısı

```
ojs-nutrition-fullstack/          # yeni repo, pnpm workspaces
├── apps/
│   ├── admin/                    # Next.js (App Router) — role=admin korumalı ayrı istemci, bkz. Bölüm 6a
│   │   ├── app/
│   │   │   ├── page.tsx                         # dashboard (stats/chart — GET /admin/dashboard/stats)
│   │   │   ├── products/                        # liste + create/edit
│   │   │   ├── orders/                           # liste + durum güncelleme
│   │   │   ├── faq/
│   │   │   └── contact/
│   │   └── middleware.ts         # cookie + role==admin kontrolü
│   ├── web/                      # Next.js (App Router)
│   │   ├── app/
│   │   │   ├── (shop)/           # Navbar+Footer paylaşan sayfalar (eski <Layout/>)
│   │   │   │   ├── page.tsx                    # Home
│   │   │   │   ├── about/page.tsx
│   │   │   │   ├── contact/page.tsx
│   │   │   │   ├── faq/page.tsx
│   │   │   │   ├── login/page.tsx
│   │   │   │   ├── product/[slug]/page.tsx
│   │   │   │   ├── products/page.tsx             # ?category= olmadan tüm ürünler
│   │   │   │   ├── products/[category]/page.tsx  # kategoriye göre filtrelenmiş liste (bkz. §4)
│   │   │   │   └── account/
│   │   │   │       ├── layout.tsx              # ProtectedRoute karşılığı
│   │   │   │       ├── page.tsx
│   │   │   │       ├── addresses/page.tsx
│   │   │   │       └── order/page.tsx
│   │   │   ├── (checkout)/       # Layout'suz sayfalar (eski top-level payment route'ları)
│   │   │   │   ├── payment/page.tsx
│   │   │   │   └── payment/thank-you/page.tsx
│   │   │   └── layout.tsx        # root layout (ThemeProvider vb.)
│   │   ├── middleware.ts         # auth guard — bkz. Bölüm 6
│   │   ├── lib/                  # eski src/services + src/utils karşılığı
│   │   ├── components/           # eski src/components (client component'ler "use client")
│   │   ├── store/                # zustand (sadece client state)
│   │   └── next.config.ts
│   └── api/                      # NestJS — bkz. BACKEND_PLAN.md
├── package.json                  # workspaces root
└── pnpm-workspace.yaml
```

`src/routes/WooCommerce/WooCommerceProducts.tsx` gibi kullanılmayan kalıntılar yeni repoya **taşınmaz**.

---

## 4. Route Haritası (eski → yeni)

| Eski (react-router, `main.tsx`) | Yeni (App Router path) | Render tipi |
|---|---|---|
| `/` (Home, loader: best-sellers) | `app/(shop)/page.tsx` | Server Component + ISR |
| `/product/:id` | `app/(shop)/product/[slug]/page.tsx` | Server Component + `generateMetadata`/`generateStaticParams` |
| `/products` (loader: productsLoader) | `app/(shop)/products/page.tsx` | Server Component, `searchParams` ile sayfalama |
| `/products/protein` | `app/(shop)/products/[category]/page.tsx` (dinamik) | Server Component + `generateStaticParams` |
| `/contact` | `app/(shop)/contact/page.tsx` | Server Component + Server Action (submit) |
| `/faq` | `app/(shop)/faq/page.tsx` | Server Component |
| `/login` (GuestRoute) | `app/(shop)/login/page.tsx` | Client Component (form), guest kontrolü middleware'de |
| `/about` | `app/(shop)/about/page.tsx` | Server Component (statik) |
| `/account` (ProtectedRoute) + children | `app/(shop)/account/**` | `account/layout.tsx` guard; sayfalar karışık server/client |
| `/payment` (ProtectedRoute, Layout dışı) | `app/(checkout)/payment/page.tsx` | Client Component (form-ağırlıklı) |
| `/payment/thank-you` | `app/(checkout)/payment/thank-you/page.tsx` | Server Component (order no artık route state değil, gerçek sipariş verisiyle) |

> **Not:** Route param `:id` → `[slug]` olarak değiştiriliyor çünkü backend (`BACKEND_PLAN.md` §5.3) zaten slug bazlı çalışıyor; mevcut isimlendirme tutarsızlığı bu vesileyle düzeltiliyor.

> **Karar — `products/protein` dinamik `[category]` oluyor:** Mevcut kodda `Protein` (`routes/products/protein.tsx`) ve `Products` (`routes/products/products.tsx`) sayfaları **neredeyse birebir aynı template** (breadcrumb + başlık/açıklama + grid + sayfalama), tek fark Protein'in statik mock veri kullanması. Yani dinamik yapmak burada ekstra iş değil, aynı component'i parametreleştirmek demek:
> - **Hardcoded (`products/protein/page.tsx` gibi ayrı dosya):** Hızlı ama her yeni kategori (kreatin, vitamin, ...) için yeni bir sayfa dosyası kopyalamak gerekir; layout değişince N dosyayı ayrı ayrı güncellemek gerekir; mülakatta "yeni kategori nasıl eklenir" sorusuna cevabınız "yeni sayfa yazarım" olur.
> - **Dinamik (`products/[category]/page.tsx`):** Tek dosya tüm kategorileri karşılar; yeni kategori eklemek backend'de bir `Category` satırı eklemekten ibarettir, frontend'de sıfır kod değişikliği gerekir; `generateStaticParams`, backend'deki `GET /categories` (bkz. `BACKEND_PLAN.md` §5.3) listesinden kategori slug'larını çekip her biri için build-time'da sayfa üretir (SSG) + `revalidate` ile güncel kalır. Backend zaten `Category`/`SubCategory` tablolarıyla veri-odaklı çalıştığı için bu, mimariyle tutarlı olan seçenek.
>
> **Karar: dinamik.** Sayfa başlığı/açıklaması `Category.name`'den, ürün listesi `GET /products?category=:slug`'dan gelir.

---

## 5. Veri Çekme Stratejisi (Server vs Client)

**Server Component'te veri çekilen sayfalar** (SEO/performans gösterimi burada yapılır):
- Home (best-sellers), Products listesi, Product detail, FAQ, About, Payment/thank-you (sipariş özeti).

**Client Component kalan parçalar** (etkileşim/kullanıcıya özel state):
- Navbar (sepet sayacı, kullanıcı menüsü), sepet drawer'ı, login/register formları, account formları (adres CRUD, profil güncelleme), payment/checkout formu, ürün detayındaki "sepete ekle" butonu (server-render edilen sayfa içinde bir "island"), review gönderme formu.

**Server Actions** kullanılacak akışlar:
- Contact form submit, login/register (cookie set etme nedeniyle server-side olmalı).

**Sepet — karar:** `localStorage` bağımlılığından tamamen vazgeçildi; misafir sepeti de backend'de tutuluyor (`guest_cart_id` httpOnly cookie ile, bkz. `BACKEND_PLAN.md` §5.5). Sepete ekle/çıkar mutasyonları **client-side'dan tetiklenir** (sepet drawer'ında anlık/optimistic UI güncellemesi için) ama her zaman `/cart` API'sine gider — client zustand store'u artık sepet verisinin kaynağı değil, sadece API'den gelen son durumun bir yansıması (cache) olur. Login/register başarılı olduğunda `POST /cart/merge` çağrılarak misafir sepeti kullanıcının sepetiyle birleştirilir.

---

## 6. Auth & Middleware Tasarımı

Mevcut sistemde `accessToken`/`refreshToken` Zustand + localStorage'da tutuluyor (`src/store/authStore.ts`), route koruması client-side `ProtectedRoute`/`GuestRoute` component'leriyle yapılıyor — bu hem XSS'e karşı token'ı JS'e açık bırakıyor hem de sayfa render olduktan sonra yönlendirme yaptığı için içerik "flash" edebiliyor.

Next.js geçişinde:
- Login/register **Server Action** içinde çalışır, backend'den dönen `access`/`refresh` token'lar **httpOnly, secure cookie** olarak set edilir (JS'den erişilemez — CV'de anlatılacak somut güvenlik iyileştirmesi).
- `middleware.ts`, `account/**` ve `payment/**` route'larında cookie'yi kontrol edip yoksa `/login`'e, `login` sayfasında cookie varsa `/`'e yönlendirir — **render öncesi**, flash olmadan.
- `user` bilgisi (görüntüleme amaçlı) gerekirse hâlâ küçük bir client store'da tutulabilir ama token'ın kendisi orada tutulmaz.
- 401 alındığında refresh — bu artık bir Route Handler (`/api/auth/refresh` gibi) üzerinden, cookie'yi okuyup yenileyerek yapılır (mevcut planda zaten "eklenmedi" diye not edilen interceptor eksikliği burada gerçek çözüme kavuşuyor).
- **Google OAuth** — login sayfasındaki buton `GET /auth/google`'a yönlendirir; backend callback'i işleyip kullanıcıyı `NEXT_PUBLIC_WEB_URL`'e (cookie set edilmiş halde) geri redirect eder, `apps/web` tarafında ek bir şey yapmaya gerek kalmaz.

### 6a. Admin Uygulaması (`apps/admin`) — Yetkilendirme

`apps/admin`, `apps/web`'den **bağımsız bir Next.js uygulaması** olarak deploy edilir (ayrı Vercel projesi/subdomain, örn. `admin.ojs-nutrition.vercel.app`). Kendi `middleware.ts`'i cookie'deki JWT'yi decode edip `role !== 'admin'` ise `apps/web`'in login sayfasına redirect eder. Böylece storefront ve admin panel tamamen ayrı deploy/güvenlik sınırlarına sahip olur — gerçek şirketlerdeki storefront/dashboard ayrımını birebir yansıtır ve CV'de "role-based, çok uygulamalı monorepo" olarak anlatılabilir.

---

## 7. Ortam Değişkenleri

**`apps/web/.env`:**
```
API_BASE_URL=http://localhost:3000/api/v1        # server-side fetch (Server Component/Action)
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api/v1   # client-side çağrılar
NEXT_PUBLIC_IMAGE_HOST=localhost                  # next.config.ts remotePatterns için
```

`next.config.ts` içinde `images.remotePatterns`, backend'in medya host'unu (bkz. `BACKEND_PLAN.md` §7) whitelist'ler.

---

## 8. Yol Haritası / Fazlar

### Faz 0 — Repo & İskelet
- Yeni monorepo kurulumu (pnpm workspaces), `apps/web` içinde boş Next.js App Router iskeleti, Tailwind/shadcn config taşıma.

### Faz 1 — Statik/public sayfalar
- Home, About, FAQ, Products (liste+detay) — Server Component + ISR, backend Faz 1 (auth+products) ile entegrasyon.

### Faz 2 — Auth, Hesap, Adresler & Siparişler (Tamamlandı ✅)
- **Faz 2.1:** Sözleşmeler, tipler (`auth`, `user`, `location`, `address`, `order`), token/çerez yardımcıları (`auth-cookies.ts`) ve API katmanı (`lib/api/*`).
- **Faz 2.2:** Next.js Edge Middleware (`middleware.ts`), Google OAuth callback (`auth/callback/route.ts`), modüler Header ve kullanıcı menüsü (`user-menu.tsx`, `mobile-menu.tsx`, `dropdown-menu.tsx`).
- **Faz 2.3:** Zod şemaları (`schemas/auth.ts`), Server Actions (`login/actions.ts`), UI primitifleri (`label.tsx`, `tabs.tsx`), giriş & kayıt formları (`login-form.tsx`, `register-form.tsx`, `auth-card.tsx`).
- **Faz 2.4:** Hesap navigasyonu & düzeni (`account/layout.tsx`, `account-nav.tsx`), profil Server Action (`account/actions.ts`), profil formu (`profile-form.tsx`) ve sayfa sınırları (`loading.tsx`, `error.tsx`).
- **Faz 2.5:** Radix UI Dialog (`dialog.tsx`), native Select (`select.tsx`), Zod adres şeması (`schemas/address.ts`), adres Server Actions (`account/addresses/actions.ts`), kademeli lokasyon seçici (`location-selects.tsx`), adres modalı & kartları (`address-modal.tsx`, `address-card.tsx`, `address-list.tsx`).
- **Faz 2.6:** Biçimlendirme yardımcıları (`format.ts`), sipariş durum rozeti (`order-status-badge.tsx`), sipariş kartı & listesi (`order-card.tsx`, `order-list.tsx`), sipariş detay kalemleri & özeti (`order-detail-items.tsx`, `order-detail-summary.tsx`), sipariş sayfaları (`/account/orders`, `/account/orders/[id]`).
- **Faz 2.7:** Monorepo çapında entegrasyon kontrolü (backend 296 test passed, frontend 0 lint/0 typecheck hatası), mimari kurallar & dokümantasyon tamamlama.
- **Faz 2.8:** Frontend Test Altyapısı ve Temel Test Paketi (Vitest, RTL, JSDOM polyfill'leri, custom render altyapısı, `lib/utils`, `lib/schemas`, `components/ui/button`, `OrderStatusBadge` testleri, `web-quality-gate` CI entegrasyonu).

### Faz 3 — Sepet & Checkout
- Sepet (client-side, misafir merge dahil), Payment akışı, thank-you sayfası gerçek sipariş verisiyle.
- *Test Kabul Kriteri:* Sepet yardımcıları, sepet toplam hesaplamaları ve ödeme form Zod şemaları için test suite eklenmelidir.

### Faz 4 — İçerik & Cila
- Reviews, Contact (server action), `next/image` + `generateMetadata` ince ayarları, `loading.tsx`/`error.tsx` sınırları, Vercel'e deploy.
- *Test Kabul Kriteri:* Review & Contact Zod şemaları ve UI form bileşenleri test edilmelidir.

### Faz 5 — Admin Panel (`apps/admin`)
- Dashboard (istatistik kartları + basit grafik, `GET /admin/dashboard/stats`), ürün/varyant CRUD, sipariş durum yönetimi, FAQ/contact yönetimi (bkz. `BACKEND_PLAN.md` §5.10).
- Ayrı Vercel projesi olarak deploy, `apps/web`'den bağımsız middleware/role kontrolü (bkz. Bölüm 6a).

---

## 9. Açık Kararlar

Tüm kararlar netleşti:

1. ~~**Monorepo mu, iki ayrı repo mu?**~~ → **Karar: monorepo** (`apps/web` + `apps/admin` + `apps/api`).
2. ~~**Eski repo ne olacak?**~~ → **Karar: dokunulmuyor.** CV'lerdeki mevcut Vite/React repo linki aynen kalır, yeni backend'e hiç bağlanmaz.
3. ~~**`products/protein` hardcoded mı, dinamik mi?**~~ → **Karar: dinamik `products/[category]`** — bkz. Bölüm 4'teki gerekçe (mevcut Protein/Products sayfaları zaten aynı template, backend `Category` tablosuna sahip).
4. ~~**Sepete ekle/çıkar server action mı, client-side mi?**~~ → **Karar: client-side'dan tetiklenen backend çağrısı, localStorage yok.** Misafir sepeti de backend'de `guest_cart_id` cookie'siyle tutulur — bkz. Bölüm 5 ve `BACKEND_PLAN.md` §5.5.
5. **Deploy zamanlaması** — kullanıcı tarafından, geliştirme ilerledikçe ayrıca karara bağlanacak (Faz 1 sonu erken canlı link vs. tüm fazlar bitince).
