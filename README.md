# 🥤 Nutrition Store - React + TypeScript Project

[English](./README_EN.md) | Türkçe

Bu proje, supplement (besin takviyesi) odaklı bir e-ticaret sitesidir. Kullanıcılar ürünleri inceleyebilir, filtreleyebilir, yorum yapabilir, sepetlerine ekleyebilir ve hesap bilgilerini yönetebilir. 

---

## 🚀 Proje Teknolojileri

| Amaç                          | Önerilen Araç / Kütüphane                     |
|-------------------------------|-----------------------------------------------|
| Stil                          | **TailwindCSS**, **Shadcn UI**                |
| Router                        | **React Router DOM**                          |
| Form & Doğrulama              | **react-hook-form** + **zod**                 |
| Global State (Sepet vs.)     | **Zustand**                                   |
| API İstekleri                 | **Axios**                                     |
| Auth                          | **JWT** + **Context API**  |
| Animasyon                     | **Framer Motion**                             |
| İkon                          | **Lucide Icons**, **Heroicons**               |

---

## 📁 Proje Klasör Yapısı

```bash
src/
├── assets/           # Görseller, ikonlar
│   ├── about/        # Hakkımızda sayfası görselleri
│   ├── flavors/      # Ürün aroma görselleri
│   ├── order/        # Sipariş görselleri
│   └── protein-list/ # Protein ürün görselleri
├── components/       # UI bileşenleri
│   ├── common/       # Ortak bileşenler (Navbar, Footer, ProductCard, AccountSidebar)
│   ├── contact/      # İletişim formu bileşenleri
│   ├── login/        # Giriş bileşenleri
│   ├── modals/       # Modal bileşenleri
│   ├── ui/           # Shadcn UI bileşenleri (Button, Card, Dialog, Breadcrumb, vs.)
│   ├── banner.tsx
│   ├── best-sellers.tsx
│   ├── customer-reviews.tsx
│   ├── faq.tsx
│   ├── home-product.tsx
│   ├── layout.tsx
│   ├── product-reviews.tsx
│   ├── theme-provider.tsx
│   └── ...
├── data/             # Dummy data dosyaları
│   ├── best-sellers-data.ts
│   ├── faq-data.ts
│   ├── order-data.ts
│   ├── payment-data.ts
│   ├── product-detail-data.ts
│   ├── protein-data.ts
│   └── review-data.ts
├── hooks/            # Özel React hook'ları
│   └── useProductVariants.ts
├── lib/              # Yardımcı kütüphaneler
│   └── utils.ts      # Utility fonksiyonları
├── routes/           # Tüm route yapısı
│   ├── about/        # Hakkımızda sayfası
│   ├── account/      # Hesap sayfaları (Account, Addresses, Order)
│   ├── contact/      # İletişim sayfası
│   ├── faq/          # SSS sayfası
│   ├── home/         # Ana sayfa (Home, Loader)
│   ├── login/        # Giriş sayfası
│   ├── payment/      # Ödeme sayfası
│   ├── product-detail/ # Ürün detay sayfası
│   ├── products/     # Ürünler sayfası (Products, Protein, Loader)
│   ├── register/     # Kayıt sayfası
│   └── index.ts      # Route export dosyası
├── schemas/          # Form validation şemaları
│   └── auth.ts       # Authentication şemaları
├── services/         # API fonksiyonları
│   ├── api.ts        # API base konfigürasyonu
│   ├── best-sellers.ts
│   └── products.ts
├── store/            # Zustand global state (boş)
├── types/            # TypeScript tip tanımları
│   ├── api.ts
│   ├── faq.ts
│   ├── order.ts
│   ├── product.ts
│   └── review.ts
├── utils/            # Yardımcı fonksiyonlar
│   └── productTransform.ts
├── examples/         # Örnek bileşenler
│   └── ProductDetailWithVariants.tsx
├── main.tsx          # Ana giriş noktası
├── index.css         # Global stiller
└── vite-env.d.ts     # Vite tip tanımları
```

---

## 🛍️ Sayfa ve Özellik Listesi

### Ana Sayfa
- Çok satan ürünler
- Kategorilere göre filtre
- Arama özelliği

### 📦 Ürün Listeleme
- Kart görünüm
- Filtreleme (kategori, fiyat, marka)
- Sıralama (fiyat, puan, yenilik)

### 🔍 Ürün Detay Sayfası
- Görsel galerisi
- Açıklama ve içerik
- Kullanıcı yorumları
- Sepete ekleme

### 🛒 Sepet
- Ürün adedi artır/azalt
- Toplam fiyat
- Sepetten çıkarma

### 👤 Kullanıcı İşlemleri
- Giriş / Kayıt ol
- Hesap bilgilerim
- Sipariş geçmişi

### 💬 Kullanıcı Yorumları
- Ürünlere yıldızlı puanlama
- Yorum bırakma
- Önceki yorumları görme

### ❓ Sıkça Sorulan Sorular (SSS)
- Accordion yapısı ile sorular ve cevaplar

### 📬 İletişim Sayfası
- Ad, e-posta, mesaj alanı
- Form doğrulama ve gönderim

---

## 🧪 Kullanılan Dummy Data

Proje geliştirme sürecinde, sahte ürün verileri (`/data/products.ts`) kullanılmaktadır. Her ürün aşağıdaki bilgileri içerir:

- `id`: Ürün ID'si
- `name`: Ürün adı
- `brand`: Marka
- `category`: Kategori (Protein, Kreatin, BCAA, vb.)
- `description`: Açıklama
- `ingredients`: İçindekiler
- `price`: Fiyat
- `imageUrl`: Görsel bağlantısı
- `rating`: Puan (1–5)
- `reviewsCount`: Yorum sayısı
- `isBestseller`: Çok satanlar etiketi

---

## ⚙️ Kurulum

```bash
git clone https://github.com/kullaniciadi/nutrition-store.git
cd nutrition-store
npm install
npm run dev
```

### Shadcn bileşenleri için ilk kurulum:

```bash
npx shadcn-ui@latest init
```

---

## 🚀 Geliştirme

Projeyi geliştirme modunda çalıştırmak için:

```bash
pnpm run dev
```

Tarayıcınızda [http://localhost:5173](http://localhost:5173) adresini açın.

---

## 📦 Build

Projeyi production için build etmek için:

```bash
npm run build
```

---

## 🧪 Test

Testleri çalıştırmak için:

```bash
npm run test
```

---

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.
