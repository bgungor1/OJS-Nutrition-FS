# Mühendislik Standartları — OJS Nutrition

> Bu doküman [`BACKEND_PLAN.md`](./BACKEND_PLAN.md) ve [`FRONTEND_NEXTJS_PLAN.md`](./FRONTEND_NEXTJS_PLAN.md) ile birlikte okunmalıdır. O iki doküman projenin **ne** inşa edileceğini (mimari, stack, endpoint sözleşmesi) tanımlar; bu doküman **nasıl** kod yazılacağını tanımlar. Aralarında çelişki olduğunda plan dosyalarındaki mimari kararlar geçerlidir, bu doküman onların üzerine kod-kalitesi/güvenlik/performans katmanı ekler.

## İçindekiler

0. [Kapsam](#0-kapsam)
1. [Genel Clean Code Prensipleri](#1-genel-clean-code-prensipleri)
2. [Backend Düzeni (NestJS / apps/api)](#2-backend-düzeni-nestjs--appsapi)
3. [Frontend Düzeni (Next.js / apps/web, apps/admin)](#3-frontend-düzeni-nextjs--appsweb-appsadmin)
4. [Güvenlik Kuralları](#4-güvenlik-kuralları)
5. [Performans Kuralları](#5-performans-kuralları)
6. [Hata Yönetimi](#6-hata-yönetimi)
7. [Test Stratejisi](#7-test-stratejisi)
8. [CI/CD](#8-cicd)
9. [Dokümantasyon Kuralları](#9-dokümantasyon-kuralları)
10. [Git & Workflow Kuralları](#10-git--workflow-kuralları)
11. [Review Kontrol Listesi](#11-review-kontrol-listesi)

---

## 0. Kapsam

Bu kurallar `apps/api` (NestJS), `apps/web` (Next.js storefront) ve `apps/admin` (Next.js admin) için ortak geçerlidir. Yeni yazılan her modül/dosya, bu dokümandaki kurallara aykırıysa, bunun bilinçli ve gerekçeli bir istisna olması gerekir — varsayılan davranış değildir.

---

## 1. Genel Clean Code Prensipleri

Bu bölüm dilden bağımsızdır, hem TypeScript backend hem frontend için geçerlidir.

- **İsimlendirme:** Anlamlı, kısaltmasız isimler kullanılır (`calculateShippingFee`, `data`/`tmp`/`x` değil). Boolean değişken/fonksiyonlar `is`/`has`/`can` öneki alır (`isAvailable`, `hasDiscount`). Fonksiyon isimleri fiil ile başlar (`getProductBySlug`), değişkenler isim olur.
- **Fonksiyon/metod tasarımı:** Tek sorumluluk ilkesi — bir fonksiyon tek bir işi yapar. Fonksiyon uzunluğu ~20-30 satırı aştığında bu bir refactor sinyalidir. 3'ten fazla parametre gerektiren fonksiyonlarda tek bir `options`/DTO objesi kullanılır, pozisyonel parametre yığını yapılmaz.
- **DRY, ama aşırıya kaçmadan (Rule of Three):** İki yerde aynı mantık görülmesi otomatik refactor gerektirmez; üçüncü tekrarda ortak fonksiyon/hook/servis çıkarılır. Erken soyutlama, hiç soyutlamamaktan daha pahalıdır.
- **KISS / YAGNI:** Şu an ihtiyaç olmayan konfigürasyon, feature flag veya "ileride lazım olur" soyutlaması eklenmez. Üç benzer satır, gereksiz bir abstraction'dan iyidir.
- **Yorum politikası:** Kod "ne yaptığını" zaten okunabilir isimlerle anlatır; yorum yalnızca "neden" böyle yapıldığını (non-obvious bir kısıt, bilinen bir workaround, şaşırtıcı bir davranış) açıklamak için yazılır. Kaldırıldığında okuyucuyu şaşırtmayacak yorum yazılmaz.
- **Hata yönetimi:** Sessiz `catch {}` / hatayı yutup varsayılan değere düşme yasaktır. Mevcut Vite/React kod tabanında görülen "API başarısız olursa sessizce mock veriye düş" deseni (bkz. `BACKEND_PLAN.md` §1) yeni yazılan kodda **tekrarlanmaz** — hatalar ya kullanıcıya (anlamlı bir mesajla) ya da loglara yüzeye çıkarılır, asla sessizce yutulmaz. `try/catch` yalnızca gerçekten beklenen bir hata senaryosunda (dış servis çağrısı, dosya IO, parse) kullanılır; kontrol akışı için kullanılmaz.
- **Magic number/string yok:** Tekrar eden sabit değerler (`15`, `"admin"`, `2500`) adlandırılmış sabitlere veya `enum`'lara taşınır.
- **TypeScript strict mode:** Hem `apps/api` hem `apps/web`/`apps/admin` `tsconfig.json`'da `strict: true` ile çalışır. `any` kullanımı yasaktır — tipi bilinmeyen veri için `unknown` + type guard kullanılır. `as` ile zorla tip atama yalnızca gerçekten kaçınılmaz olduğu (ör. üçüncü parti kütüphane eksik tip) durumlarda ve yanında kısa bir yorumla kullanılır.
- **Ölü kod bırakılmaz:** Kullanılmayan import, değişken, component veya route (bkz. `FRONTEND_NEXTJS_PLAN.md`'deki `WooCommerce` örneği — yeni repoya taşınmayacağı zaten karara bağlanmış) commit edilmez.
- **Dosya/fonksiyon boyutu ve sorumluluk sınırı:** Frontend'de bir component/dosya için hedef üst sınır **~150 satır**'dır; aşıldığında anlamlı alt component'lere bölünür (örn. büyük bir form → `FormHeader`/`FormFields`/`FormActions`). Backend'de **"god service/controller" yasaktır** — bir service tek bir domain'e odaklanır (`OrdersService` sipariş orkestrasyonu yapar; ödeme veya stok mantığını kendi içine yazmak yerine `PaymentService`/`StockService` gibi ilgili servisleri çağırır). Bu bir lint kuralı değil **refactor sinyalidir** — satır sayısını tutturmak için anlamsız bölme yapılmaz, amaç okunabilirlik ve tek sorumluluktur.

---

## 2. Backend Düzeni (NestJS / apps/api)

- **Katman ayrımı:** Her modül `controller/service/dto/entity` yapısını izler (bkz. `BACKEND_PLAN.md` §3). Controller yalnızca HTTP isteğini karşılar, DTO validasyonunu tetikler ve service'i çağırır — **hiçbir iş mantığı controller'da yazılmaz**.
- **DTO zorunluluğu:** Her request body'si `class-validator` decorator'larına sahip bir DTO sınıfıdır. Ham `any` veya `Record<string, unknown>` tipinde request body kabul edilmez.
- **Bağımlılık yönetimi:** Servisler arası ilişki dependency injection ile kurulur; circular dependency oluşturacak modül tasarımlarından kaçınılır, modül sınırları (`imports`/`exports`) net tutulur.
- **Tek merkezden response zarfı:** Başarılı yanıt şekli (`{status: 'success', data}`) yalnızca `ResponseInterceptor` tarafından üretilir. Hiçbir controller elle zarf oluşturmaz — bu, mevcut kod tabanında adres/sepet arasında görülen zarf tutarsızlığının (bkz. `BACKEND_PLAN.md` §3) tekrarını yapısal olarak imkânsız kılar.
- **Konfigürasyon:** Environment değişkenleri asla hardcode edilmez, `ConfigModule`/`.env` üzerinden okunur. `.env` dosyaları repoya commit edilmez, bir `.env.example` tutulur.
- **Env validasyonu (fail-fast):** `ConfigModule`, bir doğrulama şemasıyla (`class-validator` ile `EnvironmentVariables` sınıfı veya `Joi`) kurulur; zorunlu bir env eksik/hatalıysa uygulama **başlamadan** hata verir. Eksik env'i runtime'da sessizce `undefined` olarak okuyup ilerlemek yasaktır.
- **Swagger güncelliği:** Yeni veya değişen bir endpoint, aynı PR içinde `@nestjs/swagger` decorator'larıyla (`@ApiOperation`, `@ApiResponse` vb.) dokümante edilir — dokümantasyon ayrı bir "sonra yaparım" görevi olarak bırakılmaz (bkz. §9).
- **Loglama:** Hatalar ve önemli iş olayları (sipariş oluşturma, ödeme sonucu) loglanır; log satırları en az `error`/`warn`/`info` seviyesine ayrılır. Hassas veri (bkz. §4) loglara asla yazılmaz.
- Hata yönetiminin mekanikleri (exception hiyerarşisi, status kodu eşlemesi, idempotency, correlation ID) için bkz. **§6 Hata Yönetimi**; test kuralları için bkz. **§7 Test Stratejisi**.
- **Backend akıllı, frontend dilsiz (dumb) — ama sınırı net:** Tüm **domain/iş kuralı** hesaplamaları (fiyat, indirim yüzdesi, kargo ücreti, stok durumu, yetkilendirme kararı) yalnızca backend'de yapılır ve frontend'e hesaplanmış olarak döner (bkz. `BACKEND_PLAN.md` §5.3'teki `price_info` kararı). Aynı hesaplama iki tarafta ayrı ayrı yazılmaz — tek doğruluk kaynağı backend'dir. Bu kural **sunum mantığını** (para birimi formatlama, optimistic UI, client-side form UX validasyonu) kapsamaz; bkz. §3.

---

## 3. Frontend Düzeni (Next.js / apps/web, apps/admin)

- **Server/Client Component ayrımı:** Varsayılan olarak Server Component kullanılır; `"use client"` yalnızca gerçekten interaktivite, browser API veya React state gerektiren component'lerde eklenir (bkz. `FRONTEND_NEXTJS_PLAN.md` §5'teki server/client ayrımı bu genel kuralın somut uygulamasıdır).
- **Veri çekme katmanı:** Server Component'lerde doğrudan fetch yapılır; Client Component'ler ortak bir `lib/` API katmanı üzerinden veri çeker. Component gövdesine inline fetch URL'i veya `fetch()` çağrısı gömülmez — her zaman `lib/` altındaki fonksiyonlar üzerinden.
- **Adlandırma:** Dosya adları `kebab-case` (`product-card.tsx`), component export'ları `PascalCase` (`ProductCard`), hook'lar `use` öneki (`useCart`).
- **Prop tasarımı:** Bir component'in prop sayısı 4-5'i geçtiğinde, tek bir `props` objesi/interface'ine taşınır; pozisyonel prop yığını yapılmaz.
- **State yönetimi:** Zustand store'ları yalnızca gerçekten component'ler arası paylaşılan client state için kullanılır. Sunucu tarafı veriyi (sepet, ürün listesi gibi) client store'da "kaynak" gibi tutmak yasaktır — store, API'den gelen son durumun bir yansıması (cache) olur, kaynak olamaz (bkz. `FRONTEND_NEXTJS_PLAN.md` §5'teki sepet kararı; bu ilke tüm store'lara genelleştirilir).
- **Form validasyonu:** Her form `zod` şeması + `react-hook-form` ile doğrulanır; bu şema backend'deki DTO validasyon kurallarıyla (min uzunluk, karakter kısıtı vb.) **birebir eşleşir** (bkz. `BACKEND_PLAN.md` §6).
- **Erişilebilirlik:** İnteraktif elemanlar semantik HTML ile yazılır (`<button>`, `<a>`; `div onClick` yasak), görsellerde `alt` metni zorunludur.
- **Görsel optimizasyonu:** Ürün görselleri `next/image` ile render edilir, hardcoded `<img>` kullanılmaz (bkz. `FRONTEND_NEXTJS_PLAN.md` §2).
- **Frontend "dumb" tutulur, ama sunum mantığı client'ta kalır:** Component'ler domain/iş mantığı taşımaz — backend'den hazır gelen veriyi gösterir, kendi başına fiyat/indirim/stok/yetki hesaplamaz (bkz. §2). Bunun kapsamına **girmeyenler**: para birimi/tarih formatlama, optimistic UI (örn. sepet ekleme/çıkarma anlık güncellemesi — bkz. `BACKEND_PLAN.md` §5.5), modal/dropdown aç-kapa state'i, `zod` ile client-side form UX validasyonu — bunlar normal şekilde frontend'de kalır.
- **Reusability:** Tekrar eden UI parçaları (`Button`, `Input`, `Card`, `Badge` vb.) `components/ui/` altında ortak, parametrik component'ler olarak tutulur; tekrar eden client mantığı (pagination, filtre state'i, form hata gösterimi) custom hook'lara çıkarılır. Aynı component/hook'un ikinci bir kopyası yazılmadan önce mevcut `components/`/`hooks/` altında karşılığı olup olmadığı kontrol edilir.
- **Dosya boyutu:** ~150 satır kuralı burada da geçerlidir (bkz. §1) — lint kuralı değil, "bu component çok iş yapıyor" sinyalidir.
- **Tek tip kaynağı (frontend/backend sözleşme senkronu):** API response/DTO tipleri frontend'de elle iki kez yazılmaz. Monorepo'nun avantajı kullanılır: backend DTO/entity tiplerinden türeyen ya da Swagger'dan üretilen paylaşılan bir tip kaynağı (`packages/types` veya OpenAPI codegen) kullanılır. Eski kod tabanındaki `product_id`'nin frontend'de `number`, backend'de `string` olması gibi sözleşme kaymaları (bkz. `BACKEND_PLAN.md` §5.5), tipin tek kaynaktan gelmesiyle yapısal olarak engellenir.
- **`loading.tsx` / `error.tsx` zorunlu:** Veri çeken her route segmenti (Server Component) karşılık gelen `loading.tsx` (iskelet/spinner) ve `error.tsx` (hata sınırı) dosyalarını tanımlar — yakalanmamış hata veya boş/flash ekran bırakılmaz. Hata gösteriminin genel felsefesi için bkz. §6.
- Test kuralları için bkz. **§7 Test Stratejisi**.

---

## 4. Güvenlik Kuralları

- **Token saklama:** Access/refresh token'lar asla `localStorage`'da tutulmaz; httpOnly, secure cookie kullanılır (bkz. `FRONTEND_NEXTJS_PLAN.md` §6). Bu kural, ileride yazılacak her auth-ilişkili kodda sabit kabul edilir.
- **Şifreler:** `bcrypt` ile min 10-12 salt round hash'lenir; `passwordHash` alanı hiçbir response'a serialize edilmez, hiçbir log satırına yazılmaz.
- **Input validation:** Her API girişi (query/body/param) sunucu tarafında (`class-validator`) doğrulanır. İstemci tarafı (`zod`) validasyonu yalnızca UX içindir, güvenlik sınırı değildir — backend'e asla güvenilmeden veri kabul edilmez.
- **Injection önleme:** Prisma parametrize sorgular kullandığı için standart CRUD'da SQL injection riski yoktur. Raw SQL (`$queryRaw`) gerekiyorsa mutlaka parametrize edilir, string concatenation ile sorgu oluşturmak yasaktır.
- **XSS:** Kullanıcı girdisi (review metni, contact mesajı) React'ın varsayılan escape davranışıyla render edilir; `dangerouslySetInnerHTML` kullanılmaz. Kullanılması zorunluysa sanitize kütüphanesi (örn. `DOMPurify`) ile birlikte kullanılır.
- **CSRF:** Cookie-tabanlı auth kullanıldığından cookie'ler `SameSite=Lax` (veya `Strict`) ile set edilir; state değiştiren istekler CORS whitelist (bkz. aşağı) ile ikinci bir katmanla korunur.
- **Authorization her endpoint'te ayrıca kontrol edilir:** "Kullanıcı giriş yapmış" ile "bu kullanıcı bu kaynağa erişebilir" farklı şeylerdir (IDOR önleme). Örn. `GET /orders/:id`, sadece `order.userId === req.user.id` ise veriyi döner; admin uçları `RolesGuard` + `@Roles('admin')` olmadan asla açılmaz (bkz. `BACKEND_PLAN.md` §5.10).
- **Ödeme/PII:** Ham kart numarası/CVV backend'e hiç ulaşmaz, hiç saklanmaz, hiç loglanmaz (bkz. `BACKEND_PLAN.md` §6, iyzico tokenization akışı). E-posta, telefon, adres gibi PII alanları log satırlarına yazılmaz.
- **CORS:** Yalnızca bilinen frontend origin'leri (`apps/web`, `apps/admin`) whitelist'e alınır.
- **Rate limiting:** `login`, `register`, `contact` gibi kötüye kullanılabilecek public uçlarda `@nestjs/throttler` ile IP başına limit uygulanır.
- **HTTP Güvenlik Başlıkları (`helmet`):** NestJS giriş noktasında (`main.ts`) `helmet` middleware'i zorunludur. `X-Frame-Options` (clickjacking engeli), `X-Content-Type-Options` (MIME-sniffing engeli), `Strict-Transport-Security` (HSTS) ve `Content-Security-Policy` (CSP) başlıkları üretim ortamında aktif tutulur.
- **Dosya / Medya Yükleme Güvenliği:** Yüklenen dosyaların yalnızca uzantısına (`.jpg`, `.png`) güvenilmez; dosyanın gerçek içeriği (magic bytes) kontrol edilir. SVG dosyaları doğrudan `<script>` çalıştırabildiğinden (Stored XSS) kesinlikle engellenir. Orijinal dosya adı asla dosya sistemine doğrudan yazılmaz (path traversal engeli); her dosya `uuidv4()` formatında rastgele isimlendirilir. Maksimum dosya boyutu (örn. 5MB) ve MIME-type katı şekilde sınırlandırılır.
- **Webhook İmza Doğrulaması (HMAC):** Ödeme veya kargo sağlayıcılarından (iyzico vb.) gelen asenkron webhook istekleri, sağlayıcının gizli anahtarı ile üretilen HMAC-SHA256 imzası (`X-IYZICO-SIGNATURE` vb.) doğrulanmadan asla işleme alınmaz ve sipariş durumu güncellenmez. Replay attack'lara karşı zaman damgası toleransı kontrol edilir.
- **İstek Boyutu Sınırı (Payload Limits / DoS Koruması):** Büyük JSON gövdeleri üzerinden bellek tükenmesini (Out of Memory DoS) önlemek için genel JSON parser limiti sıkı tutulur (örn. `express.json({ limit: '50kb' })`). Dosya yüklemeleri yalnızca ilgili `multer` route'ları üzerinden ve dosya boyutu kontrolüyle kabul edilir.
- **Sıralama ve Filtreleme Enjeksiyonu (Sort/Filter Injection & Query DoS):** Dinamik sıralama (`sort`, `orderBy`) parametreleri doğrudan veritabanı sorgusuna aktarılmaz. DTO seviyesinde `@IsIn(['price', 'createdAt', 'rating'])` gibi açık beyaz liste (whitelist) kontrolleri zorunludur; bilinmeyen veya ilişkili alanlar üzerinden sorgu yükü (Query DoS) oluşturulması engellenir.
- **Güvenlik Denetim Günlüğü (Security Audit Logging):** Kritik güvenlik ve yönetim olayları (başarısız giriş denemeleri, şifre değişiklikleri, admin rol değişiklikleri, ürün fiyat/stok manuel güncellemeleri, sipariş iptalleri/iade onayları) IP adresi, kullanıcı ID ve zaman damgasıyla birlikte izlenebilir bir güvenlik günlüğünde (`logger.warn`/`logger.log`) tutulur.
- **Dependency hijyeni:** Yeni bağımlılık eklenmeden önce bakım durumu değerlendirilir; `npm audit` düzenli çalıştırılır.
- **Secrets:** `.env` dosyaları `.gitignore`'dadır, hiçbir secret commit edilmez.

---

## 5. Performans Kuralları

Bu bölüm hem backend (veritabanı/API) hem frontend (Next.js) performans kurallarını kapsar. **Genel ilke: erken/ölçülmeden optimizasyon yapılmaz.** Aşağıdaki kurallar, bu stack'te (Next.js + NestJS + Prisma/Postgres, Render deploy) sık görülen ve baştan ucuza önlenebilen hatalar (N+1, fetch waterfall, gereksiz client bundle) içindir; profiling gerektiren mikro-optimizasyonlar kapsam dışıdır.

### 5.1 Veritabanı & Sorgu Kuralları

- **N+1 sorgu yasağı:** Bir listeyi döndürdükten sonra her eleman için ayrı ayrı ilişkili veri çekmek yasaktır:
  ```ts
  // YASAK — N+1
  const products = await prisma.product.findMany();
  for (const p of products) {
    p.variants = await prisma.productVariant.findMany({ where: { productId: p.id } });
  }
  ```
  Bunun yerine Prisma'nın `include`/`select` mekanizmasıyla tek sorguda ilişki çekilir:
  ```ts
  // DOĞRU — tek sorgu
  const products = await prisma.product.findMany({ include: { variants: true } });
  ```
- **Denormalize alanların güncel tutulması:** `Product.commentCount` / `Product.averageStar` gibi denormalize alanlar, ilgili yazma işlemiyle (yeni review) **aynı transaction içinde** güncellenir (bkz. `BACKEND_PLAN.md` §5.7). Her denormalize alan için hangi işlemin onu güncellediği kod içinde açık olmalıdır.
- **Sayfalama zorunlu:** Sınırsız `findMany()` yasaktır; her liste endpoint'i `limit`/`offset` (veya cursor) ile sınırlanır, varsayılan ve maksimum bir `limit` değeri tanımlanır (örn. varsayılan 20, maksimum 100).
- **`select` disiplini:** Gerekmeyen alanlar (`passwordHash`, liste görünümünde ihtiyaç duyulmayan büyük `Json` alanlar) `select` ile response'tan dışlanır — "SELECT *" zihniyetiyle tüm alanları çekip response'ta filtrelemek yerine, sorgu seviyesinde sınırlanır.
- **Index'ler:** Sık filtrelenen/sıralanan/aranan alanlarda (`Product.slug`, `Order.userId`, `CartItem` unique constraint'leri) index veya unique constraint tanımlıdır (mevcut şemada büyük ölçüde var — bkz. `BACKEND_PLAN.md` §4); yeni bir sorgu pattern'i eklendiğinde karşılık gelen index kontrol edilir/eklenir.
- **Transaction disiplini:** Birden fazla tabloyu etkileyen ve "ya hep ya hiç" olması gereken işlemler (`complete-shopping` — sipariş oluşturma + stok düşürme, review sonrası aggregate güncelleme) `prisma.$transaction` içinde yapılır (bkz. `BACKEND_PLAN.md` §5.6.1'deki atomik stok güncelleme deseni — bu genel kural olarak tüm çoklu-yazma akışlarına uygulanır).
- **Frontend'de N+1 benzeri hata:** Bir listedeki her item için ayrı bir `useEffect`/fetch tetiklemek (örn. her ürün kartı için ayrı review-count isteği) da bu kategoriye girer ve yasaktır; ilgili veri üst seviyede tek istekte (`include` veya bir aggregate endpoint ile) alınır.

### 5.2 Backend Runtime Performansı

- **Response compression:** NestJS'te `compression` middleware ile gzip/brotli açık tutulur — özellikle ürün listesi gibi büyük JSON response'larında transfer boyutunu düşürür.
- **Caching, gerektiğinde ve ölçülü:** Sık okunan, seyrek değişen veri (kategori listesi, FAQ, best-sellers) için basit bir in-memory cache (`@nestjs/cache-manager`, kısa TTL — örn. 60-300sn) düşünülebilir. Redis gibi ayrı bir altyapı bu proje ölçeğinde **gerekli değildir** (YAGNI) — gerçek bir darboğaz ölçülürse eklenir, baştan kurulmaz.
- **Bloklamayan yan işlemler:** Contact formu e-postası, review sonrası bildirim gibi kritik olmayan yan etkiler ana request-response döngüsünü bloklamaz; bu işlem başarısız olsa bile asıl işlem (örn. mesajın DB'ye kaydı) kullanıcıya başarı olarak döner, hata ayrıca loglanır.
- **Connection pooling farkındalığı:** Ücretsiz/düşük tier Postgres sağlayıcılarının (Neon/Supabase) bağlantı limiti olduğu bilinir; Prisma'nın varsayılan pool ayarları bu limitleri aşmayacak şekilde kontrol edilir — özellikle birden fazla NestJS instance'ı/serverless fonksiyon çalışacaksa.

### 5.3 Frontend (Next.js) Performansı

- **Fetch waterfall'ı önlenir:** Bir Server Component'te birbirinden bağımsız birden fazla veri kaynağı varsa (örn. ürün detay + review istatistikleri) sıralı `await`'ler yerine `Promise.all` ile paralel çekilir.
- **Cache stratejisi bilinçli seçilir:** Her `fetch` çağrısında Next.js'in `cache`/`next.revalidate` seçenekleri açıkça set edilir — statik/seyrek değişen veri (ürün listesi, kategoriler) ISR ile (`revalidate: 60` gibi), kullanıcıya özel veri (sepet, hesap) `no-store` ile çekilir. Varsayılan davranışa bırakılmaz.
- **Gereksiz client bundle büyütülmez:** Sadece belirli sayfalarda kullanılan ağır/nadir component'ler (admin dashboard grafiği, büyük modal) `next/dynamic` ile lazy-load edilir.
- **LCP/CLS farkındalığı:** Sayfanın ana görseli (hero/ilk best-seller ürünü) `next/image`'da `priority` ile işaretlenir; tüm görsellerde `width`/`height` (veya `fill` + boyutlu container) verilerek layout shift önlenir.
- **Font yükleme:** `next/font` kullanılır (harici `<link>` ile font çekmek yerine) — font-swap kaynaklı flash/CLS engellenir.
- **Gereksiz memoization yasak, gereken yerde zorunlu:** `useMemo`/`useCallback` refleks olarak her yere eklenmez (okunabilirliği düşürür, çoğu zaman faydasızdır); büyük liste render'larında (ürün grid'i) veya ölçülebilir bir re-render maliyeti varsa kullanılır.
- **Liste render'larında stabil `key`:** Array index yerine backend'den gelen `id`/`slug` kullanılır.

---

## 6. Hata Yönetimi

- **Fail-fast ve sessiz catch yasağı:** Hatalar asla sessizce yutulmaz (`catch {}` yasaktır). Bir hata oluştuğunda ya kullanıcıya anlamlı ve güvenli bir hata mesajı gösterilir ya da log sistemine yüzeye çıkarılır. Eski kod tabanındaki "API başarısız olursa sessizce mock veriye düş" deseni yeni kodda kesinlikle uygulanmaz.
- **Standart API response zarfı ve HTTP durum kodları:** Backend tarafında tüm exception'lar `AllExceptionsFilter` üzerinden yakalanır ve standart kurumsal hata zarfında (`{ status: 'error', statusCode, message, timestamp, path }`) istemciye iletilir. Doğru HTTP durum kodları (`400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `409 Conflict`, `422 Unprocessable Entity`, `500 Internal Server Error`) kullanılır.
- **Frontend hata sınırları (`error.tsx`):** Veri çeken her route segmenti (Server Component) karşılık gelen bir `error.tsx` hata sınırına sahip olmalıdır. Beklenmeyen bir sunucu veya render hatasında kullanıcının karşısına beyaz ekran çıkması engellenir; yeniden deneme butonu (`reset()`) sunulur.
- **Form ve girdi hataları:** Formlardaki validasyon hataları Zod ve `react-hook-form` entegrasyonuyla ilgili girdi alanının hemen altında kullanıcıya gösterilir. Güvenlik gerekçesiyle genel hatalarda (örn. hatalı giriş) spesifik ayrıntı sızdırılmaz ("E-posta veya şifre hatalı").

---

## 7. Test Stratejisi

Bu bölüm projenin test kültürünü, mimari sınırlarını ve kalite standartlarını belirler. Amaç, üretim güvenilirliğini sağlamak ve regresyon korkusu olmadan sürekli refactor yapabilmektir.

### 7.1 Kurumsal Test Piramidi (Testing Trophy)

Projede iki ana katmanlı test mimarisi uygulanır:
- **Backend (NestJS / apps/api):** `Jest` + `Supertest` ile yürütülür. DTO validasyonları, servis iş kuralları, mapper'lar, guard'lar, interceptor'lar ve kritik API controller uçları test edilir. (Hedef: %80+ servis ve domain mantığı kapsamı).
- **Frontend (Next.js / apps/web):** `Vitest` + `React Testing Library (RTL)` + `jsdom` ile yürütülür. Pure fonksiyonlar, Zod şemaları, UI primitifleri, interaktif domain bileşenleri ve API istemci katmanı test edilir.

### 7.2 Frontend Test Kapsamı ve Sınırları

- **Test Edilecek Katmanlar:**
  - **Pure Utilities (`lib/utils`):** `cn` sınıf birleştirici, para birimi (`formatPrice`), tarih/saat (`formatDate`, `formatDateTime`) formatlayıcıları gibi saf fonksiyonlar (%100 kapsam).
  - **Validasyon Şemaları (`lib/schemas`):** Form ve API girdi DTO'larını doğrulayan Zod şemaları (`authSchema`, `addressSchema` vb.). Geçerli ve geçersiz girdiler, sınır durumlar, regex kontrolleri ve hata mesajları doğrulanır.
  - **Ortak UI Primitives (`components/ui`):** `Button`, `Badge`, `Card` gibi temel bileşenlerin render varyantları (`variant`, `size`), disabled durumları, Radix UI `asChild` Slot mekanizması ve erişilebilirlik nitelikleri.
  - **Domain Bileşenleri (`components/account`, `components/auth` vb.):** Durum rozetleri (`OrderStatusBadge`), kimlik kartları (`AuthCard`) gibi kullanıcıya doğrudan veri sunan veya etkileşim alan bileşenler.
  - **İstemci Altyapısı (`lib/api-client`, `lib/auth-cookies`):** API istek zarfı çözümleme (`unwrap`), HTTP hata işleme ve cookie okuyucu yardımcı fonksiyonlar.
- **Test Edilmeyecekler (Anti-pattern'ler):**
  - **Dahili State (Implementation Details):** Bir bileşenin iç state değişkeninin adını veya `useState` çağrısını test etmek yasaktır; yalnızca kullanıcının gördüğü DOM çıktısı ve tetiklenen olaylar test edilir.
  - **Üçüncü Parti Kütüphanelerin İçi:** Radix UI veya Next.js'in kendi iç mekanizması test edilmez; sadece bizim verdiğimiz prop ve yapılandırmanın doğru çalıştığı doğrulanır.
  - **Kırılgan Snapshot Testleri:** Bütün DOM ağacını donduran devasa `toMatchSnapshot()` testleri kirlilik yaratır ve yasaktır; her test somut DOM elemanlarını ve metinleri doğrulamalıdır.

### 7.3 Dosya Konumlandırma Kuralı (Co-location)

Test dosyaları merkezi ayrı bir klasörde toplanmaz; test ettiği kaynak dosyanın hemen yanında yaşar:
```
apps/web/
├── lib/
│   ├── utils.ts
│   ├── utils.test.ts             # Co-located unit test
│   └── schemas/
│       ├── auth.ts
│       └── auth.test.ts          # Co-located schema test
└── components/
    └── ui/
        ├── button.tsx
        └── button.test.tsx       # Co-located component test
```
Global test ayarları, JSDOM polyfill'leri ve test yardımcıları `apps/web/test/` altında (`setup.ts`, `test-utils.tsx`) konumlandırılır.

### 7.4 Test Yazım Standartları & En İyi Uygulamalar

- **AAA (Arrange-Act-Assert) Kalıbı:** Her test belirgin üç aşamadan oluşur:
  ```tsx
  it('tıklama olayını tetikler', async () => {
    // Arrange: Hazırla
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Tıkla</Button>);
    
    // Act: Eylemi gerçekleştir
    await userEvent.click(screen.getByRole('button', { name: /tıkla/i }));
    
    // Assert: Doğrula
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
  ```
- **Kullanıcı Odaklı Sorgu Hiyerarşisi:** Testing Library felsefesine uygun olarak sorgular kullanıcı/erişilebilirlik önceliğine göre seçilir:
  1. `getByRole` (`button`, `link`, `heading`, `textbox` vb. ve erişilebilir isim: `{ name: /kaydet/i }`)
  2. `getByLabelText` (form inputları)
  3. `getByPlaceholderText` (etiket bulunmayan ek ipuçları)
  4. `getByText` (statik metinler)
  5. `getByTestId` (*Yalnızca* metin veya semantik rol taşımayan elemanlarda son çare olarak kullanılır).
- **Gerçekçi Kullanıcı Olayları:** Basit `fireEvent` yerine tam klavye ve fare döngüsünü simüle eden `@testing-library/user-event` kullanılır.
- **İzolasyon:** Her test birbirinden bağımsızdır. `apps/web/test/setup.ts` içinde her testten sonra otomatik `cleanup()` çağrılır; global mock'lar (`vi.clearAllMocks()`) temizlenir.

---

## 8. CI/CD

- **Kalite Kapısı (Quality Gate) İlkesi:** Main branch'e giden her Pull Request, CI hattındaki tüm kalite kontrollerini sıfır hatayla geçmek zorundadır.
- **Paralel Boru Hattı:** GitHub Actions üzerinde backend (`api-quality-gate`) ve frontend (`web-quality-gate`) bağımsız ve paralel çalışır.
- **Zorunlu Kontrol Adımları:**
  - `lint`: ESLint kuralları (0 hata, 0 uyarı).
  - `typecheck`: TypeScript derleyicisi strict mod kontrolü (`tsc --noEmit`, 0 tip hatası).
  - `test`: Tüm birim ve bileşen testleri (0 başarısız test).
  - `build`: Üretim derleme doğrulaması (`next build` / `nest build`).

---

## 9. Dokümantasyon Kuralları

- **Sözleşme Senkronizasyonu:** Backend'de yeni veya güncellenen her endpoint `@nestjs/swagger` ile canlı dokümante edilir.
- **Plan & Mimari Güncelliği:** Mimari bir karar alındığında veya yeni bir faz tamamlandığında [ENGINEERING_STANDARDS.md](./ENGINEERING_STANDARDS.md), [FRONTEND_NEXTJS_PLAN.md](./FRONTEND_NEXTJS_PLAN.md) veya [BACKEND_PLAN.md](./BACKEND_PLAN.md) dosyaları aynı PR içinde güncellenir.
- **Kod İçi Açıklamalar:** Kodun kendisi okunabilir ve kendini açıklayan isimlerle yazılır; yorumlar sadece "neden" böyle yapıldığını (iş kuralı kısıtı, workaround, güvenlik nedeni) belirtmek için yazılır.

---

## 10. Git & Workflow Kuralları

- **Commit mesajları:** Conventional Commits formatı izlenir (`feat:`, `fix:`, `refactor:`, `chore:`, `docs:`, `test:`) — proje geçmişinde neyin ne zaman ve neden değiştiğinin okunabilir kalması içindir.
- **Branch adlandırma:** `feature/<kısa-açıklama>`, `fix/<kısa-açıklama>` gibi amaca göre önekli isimler kullanılır.
- **Doğrudan `main`'e push yok:** Tek kişilik bir portfolyo projesi olsa bile, değişiklikler bir branch/PR üzerinden ilerler; en azından lint + test yeşil olduktan sonra merge edilir. Bu, "gerçek bir takım pratiği" olarak CV'de anlatılabilir bir alışkanlıktır.
- **Staging disiplini:** `git add -A`/`git add .` yerine ilgili dosyalar adlandırılarak stage edilir; `.env` veya secret içerebilecek dosyalar commit edilmeden önce içerikleri kontrol edilir (bkz. §4).

---

## 11. Review Kontrol Listesi

Kod review'unda (insan veya otomatik) kontrol edilecek maddeler:

- [ ] Response zarfı `ResponseInterceptor` üzerinden mi geliyor, controller elle sarmıyor mu?
- [ ] Request body bir DTO ile mi doğrulanıyor?
- [ ] N+1 sorgu var mı? (döngü içinde `await prisma.*` var mı?)
- [ ] Authentication **ve** authorization ayrı ayrı kontrol edilmiş mi (IDOR riski var mı)?
- [ ] Log satırlarında şifre/token/kart/PII sızıntısı var mı?
- [ ] Sessizce yutulan hata (`catch {}`) var mı?
- [ ] Gereksiz yorum veya ölü kod var mı?
- [ ] Yeni liste endpoint'i sayfalanmış mı, `select` ile gereksiz alan dışlanmış mı?
- [ ] Frontend component ~150 satırı aşıyor mu, aşıyorsa mantıklı alt component'lere bölünmüş mü?
- [ ] Backend service tek bir domain'e mi odaklanıyor (god service değil mi), domain mantığı frontend'e sızmış mı?
- [ ] Server Component'te bağımsız fetch'ler `Promise.all` ile paralel mi, gereksiz sıralı `await` var mı?
- [ ] `fetch` çağrısının cache/revalidate stratejisi bilinçli mi (varsayılana bırakılmamış mı)?
- [ ] Kritik olmayan yan işlem (email, bildirim) ana request-response akışını bloklamıyor mu?
- [ ] Kritik state-değiştiren endpoint (ödeme/sipariş) idempotent mi, çift istekte duplicate kayıt riski var mı?
- [ ] Yeni/değişen endpoint Swagger'da güncel mi?
- [ ] Yeni bir route segmentinde `loading.tsx`/`error.tsx` var mı?
- [ ] Frontend'de backend response şekliyle elle tekrar yazılmış, ortak kaynaktan gelmeyen bir tip var mı?
- [ ] HTTP güvenlik başlıkları (`helmet`) ve JSON body parser boyut limiti (`limit: '50kb'`) devrede mi?
- [ ] Dosya yükleme uçlarında magic-bytes doğrulaması, dosya boyutu sınırı ve rastgele UUID isimlendirme uygulanmış mı (SVG engellenmiş mi)?
- [ ] Webhook uçlarında sağlayıcı HMAC imzası ve zaman damgası doğrulanıyor mu?
- [ ] Dinamik sıralama/filtreleme parametreleri DTO seviyesinde açık bir whitelist (`@IsIn`) ile kısıtlanmış mı?
- [ ] `any` kullanımı var mı, gereksiz `as` cast'i var mı?
- [ ] Yeni pure utility veya Zod şeması için `*.test.ts` birim/sözleşme testi yazıldı mı?
- [ ] Yeni interaktif UI bileşeni için `*.test.tsx` (RTL, `getByRole` öncelikli, accessibility) testi yazıldı mı?
- [ ] Testlerde kırılgan snapshot ve `getByTestId` kirliliğinden kaçınıldı mı?
- [ ] Commit mesajı Conventional Commits formatına uyuyor mu?
