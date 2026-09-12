# apps/web — OJS Nutrition Frontend

Next.js 15 (App Router) + React 19 + TailwindCSS v4 mimarisi üzerine kurulu modern, tip güvenli ve yüksek performanslı e-ticaret vitrini.  
Geçiş ve rota mimarisi: [`../../FRONTEND_NEXTJS_PLAN.md`](../../FRONTEND_NEXTJS_PLAN.md)  
Mühendislik standartları: [`../../ENGINEERING_STANDARDS.md`](../../ENGINEERING_STANDARDS.md)

---

## 📌 Genel Bakış & Özellikler

Bu uygulama, OJS Nutrition platformunun müşteri vitrinini ve kullanıcı arayüzünü oluşturur:

- **Next.js 15 App Router & Server Components:** Ürün katalogları, ana sayfa ve statik içerikler sunucu tarafında hızlıca render edilir; filtreleme ve sepet gibi interaktif bileşenler optimize Client Component'lar ile yürütülür.
- **TailwindCSS v4:** PostCSS tabanlı en güncel Tailwind v4 utility-first stil motoru.
- **Zustand State Yönetimi:** İstemci tarafında hızlı ve reaktif sepet (cart) ve arayüz durum yönetimi.
- **Tip Güvenli Form Validasyonu:** `react-hook-form` ve `zod` entegrasyonu ile adres, ödeme, iletişim ve hesap formlarında anlık doğrulama.
- **Bileşen & UI Altyapısı:** Radix UI erişilebilir headless primitives, Lucide React ikonları ve Motion mikro animasyonları.
- **Vitest Test Altyapısı:** Hızlı, ESM-native birim ve bileşen testleri (`@testing-library/react` ve `jsdom`).

---

## 🛠️ Kurulum ve Başlatma

```bash
cd apps/web

# 1. Ortam değişkenlerini oluşturun
cp .env.example .env.local

# 2. Bağımlılıkları yükleyin
pnpm install

# 3. Geliştirici sunucusunu başlatın
pnpm dev
```

Uygulama varsayılan olarak `http://localhost:3001` (veya port uygunluğuna göre `http://localhost:3000`) adresinde çalışır.

---

## 💻 Komutlar

| Komut | Açıklama |
|---|---|
| `pnpm dev` | Next.js geliştirici sunucusunu başlatır |
| `pnpm build` | Üretim derlemesini (`.next`) oluşturur |
| `pnpm start` | Derlenmiş üretim sunucusunu başlatır |
| `pnpm lint` | Next.js ve ESLint kurallarını denetler |
| `pnpm typecheck` | TypeScript tip denetimini (`tsc --noEmit`) çalıştırır |
| `pnpm test` | Vitest testlerini tek seferlik çalıştırır |
| `pnpm test:watch` | Vitest testlerini izleme (watch) modunda çalıştırır |
| `pnpm test:coverage` | Test kapsama (coverage) raporunu üretir |

---

## 🔐 Ortam Değişkenleri (`.env.local`)

```env
# Sunucu taraflı API URL'i (Server Components & Server Actions)
API_BASE_URL=http://localhost:3000/api/v1

# İstemci taraflı API URL'i (Client Components & Browser)
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api/v1

# Statik görseller ve medya hostu
NEXT_PUBLIC_IMAGE_HOST=http://localhost:3000
```

---

## 🏗️ Klasör Yapısı

```
apps/web/
├── app/                        # Next.js App Router sayfaları ve layout'lar
│   ├── (shop)/                 # Vitrin rotaları (Home, Catalog, Product, Account)
│   ├── layout.tsx              # Root HTML & body layout
│   └── not-found.tsx           # Özelleştirilmiş 404 sayfası
├── components/                 # Modüler UI bileşenleri
│   ├── account/                # Profil, adres formları ve sipariş listeleri
│   ├── auth/                   # Giriş ve kayıt kartları/formları
│   ├── catalog/                # Filtreleme, sayfalama ve grid bileşenleri
│   ├── home/                   # Hero banner, vitrin blokları, çok satanlar
│   ├── layout/                 # Navbar, Footer, Header, Sepet Drawer
│   ├── product-detail/         # Varyant seçici, aroma seçici, besin tablosu
│   └── ui/                     # Radix & Shadcn UI primitifleri (Button, Dialog, Accordion...)
├── lib/                        # API istemcisi, şemalar, yardımcı fonksiyonlar
├── test/                       # Vitest test setup ve test yardımcıları
├── middleware.ts               # Rota ve oturum middleware'i
├── next.config.ts              # Next.js yapılandırması ve remote image patterns
└── vitest.config.mts           # Vitest ve JSDOM test konfigürasyonu
```
