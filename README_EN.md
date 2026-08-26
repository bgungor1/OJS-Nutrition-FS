# 🥤 Nutrition Store - React + TypeScript Project

English | [Türkçe](./README.md)

This project is a supplement-focused e-commerce website. Users can browse products, filter them, leave reviews, add items to their cart, and manage their account information.

---

## 🚀 Project Technologies

| Purpose                        | Recommended Tool / Library                    |
|-------------------------------|-----------------------------------------------|
| Styling                       | **TailwindCSS**, **Shadcn UI**                |
| Router                        | **React Router DOM**                          |
| Forms & Validation            | **react-hook-form** + **zod**                 |
| Global State (Cart etc.)     | **Zustand**                                   |
| API Requests                  | **Axios**                                     |
| Authentication                | **JWT** + **Context API**                    |
| Animation                     | **Framer Motion**                             |
| Icons                         | **Lucide Icons**, **Heroicons**               |

---

## 📁 Project Folder Structure

```bash
src/
├── assets/           # Images, icons
│   ├── about/        # About page images
│   ├── flavors/      # Product flavor images
│   ├── order/        # Order images
│   └── protein-list/ # Protein product images
├── components/       # UI components
│   ├── common/       # Common components (Navbar, Footer, ProductCard, AccountSidebar)
│   ├── contact/      # Contact form components
│   ├── login/        # Login components
│   ├── modals/       # Modal components
│   ├── ui/           # Shadcn UI components (Button, Card, Dialog, Breadcrumb, etc.)
│   ├── banner.tsx
│   ├── best-sellers.tsx
│   ├── customer-reviews.tsx
│   ├── faq.tsx
│   ├── home-product.tsx
│   ├── layout.tsx
│   ├── product-reviews.tsx
│   ├── theme-provider.tsx
│   └── ...
├── data/             # Dummy data files
│   ├── best-sellers-data.ts
│   ├── faq-data.ts
│   ├── order-data.ts
│   ├── payment-data.ts
│   ├── product-detail-data.ts
│   ├── protein-data.ts
│   └── review-data.ts
├── hooks/            # Custom React hooks
│   └── useProductVariants.ts
├── lib/              # Helper libraries
│   └── utils.ts      # Utility functions
├── routes/           # All route structure
│   ├── about/        # About page
│   ├── account/      # Account pages (Account, Addresses, Order)
│   ├── contact/      # Contact page
│   ├── faq/          # FAQ page
│   ├── home/         # Home page (Home, Loader)
│   ├── login/        # Login page
│   ├── payment/      # Payment page
│   ├── product-detail/ # Product detail page
│   ├── products/     # Products page (Products, Protein, Loader)
│   ├── register/     # Register page
│   └── index.ts      # Route export file
├── schemas/          # Form validation schemas
│   └── auth.ts       # Authentication schemas
├── services/         # API functions
│   ├── api.ts        # API base configuration
│   ├── best-sellers.ts
│   └── products.ts
├── store/            # Zustand global state (empty)
├── types/            # TypeScript type definitions
│   ├── api.ts
│   ├── faq.ts
│   ├── order.ts
│   ├── product.ts
│   └── review.ts
├── utils/            # Helper functions
│   └── productTransform.ts
├── examples/         # Example components
│   └── ProductDetailWithVariants.tsx
├── main.tsx          # Main entry point
├── index.css         # Global styles
└── vite-env.d.ts     # Vite type definitions
```

---

## 🛍️ Pages and Features List

### Home Page
- Best-selling products
- Category filters
- Search functionality

### 📦 Product Listing
- Card view
- Filtering (category, price, brand)
- Sorting (price, rating, newest)

### 🔍 Product Detail Page
- Image gallery
- Description and content
- User reviews
- Add to cart

### 🛒 Shopping Cart
- Increase/decrease product quantity
- Total price
- Remove from cart

### 👤 User Operations
- Login / Register
- My account information
- Order history

### 💬 User Reviews
- Star rating for products
- Leave comments
- View previous reviews

### ❓ Frequently Asked Questions (FAQ)
- Accordion structure with questions and answers

### 📬 Contact Page
- Name, email, message fields
- Form validation and submission

---

## 🧪 Dummy Data Used

During the project development process, fake product data (`/data/products.ts`) is used. Each product contains the following information:

- `id`: Product ID
- `name`: Product name
- `brand`: Brand
- `category`: Category (Protein, Creatine, BCAA, etc.)
- `description`: Description
- `ingredients`: Ingredients
- `price`: Price
- `imageUrl`: Image URL
- `rating`: Rating (1–5)
- `reviewsCount`: Number of reviews
- `isBestseller`: Bestseller tag

---

## ⚙️ Installation

```bash
git clone https://github.com/username/nutrition-store.git
cd nutrition-store
npm install
npm run dev
```

### Initial setup for Shadcn components:

```bash
npx shadcn-ui@latest init
```

---

## 🚀 Development

To run the project in development mode:

```bash
pnpm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📦 Build

To build the project for production:

```bash
npm run build
```

---

## 🧪 Test

To run tests:

```bash
npm run test
```

---

## 📝 License

This project is licensed under the MIT License.
