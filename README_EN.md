# 🥤 OJS Nutrition — Full-Stack E-Commerce Project

**English** | [Türkçe](./README.md)

OJS Nutrition is a modern supplement-focused **Full-Stack (React + NestJS + PostgreSQL)** e-commerce platform built according to contemporary web standards and clean code principles.

The application delivers an interactive client experience using **React 19 + Vite**, backed by a robust, type-safe, and modular RESTful API architecture powered by **NestJS 11 + Prisma ORM + PostgreSQL**.

---

## 📑 Table of Contents

- [Technology Stack](#-technology-stack)
- [Architecture & Key Features](#-architecture--key-features)
- [Directory Structure](#-directory-structure)
- [Pages & Modules Map](#-pages--modules-map)
- [API Documentation & Endpoints](#-api-documentation--endpoints)
- [Installation & Getting Started](#-installation--getting-started)
- [Environment Variables (.env)](#-environment-variables-env)
- [Engineering Standards](#-engineering-standards)
- [License](#-license)

---

## 🚀 Technology Stack

### 🖥️ Frontend (Client)

| Layer | Tool / Library | Version | Description |
|---|---|---|---|
| **Framework & Build** | **React** + **Vite** | `^19.1.0` / `^7.0.4` | Ultra-fast bundling and React 19 component ecosystem |
| **Language** | **TypeScript** | `~5.8.3` | End-to-end type safety |
| **Routing** | **React Router** | `^7.7.1` | Data loaders and protected route architecture |
| **Styling & Design** | **TailwindCSS v4**, **Shadcn UI** | `^4.1.11` | Modern, responsive design with Light/Dark mode support |
| **State Management** | **Zustand** | `^5.0.8` | Cart state and client-side store |
| **Forms & Validation** | **React Hook Form** + **Zod** | `^7.62.0` / `^4.1.5` | Schema-driven, performant form validation |
| **Animations & UI** | **Motion (Framer Motion)**, **Radix UI** | `^12.23.26` / `^1.2.x` | Accessible UI primitives and smooth micro-interactions |
| **Icons** | **Lucide React** | `^0.536.0` | Modern vector icon library |
| **AI Assistant** | **@google/generative-ai** | `^0.24.1` | Gemini-powered interactive customer support chatbot |

### ⚙️ Backend (Server & API)

| Layer | Tool / Library | Version | Description |
|---|---|---|---|
| **Framework** | **NestJS** | `^11.0.1` | Modular, scalable enterprise Node.js architecture |
| **ORM** | **Prisma** | `^6.2.1` | Type-safe database queries and automated migrations |
| **Database** | **PostgreSQL** | `15+` | Relational models, JSON facts storage, and indexed performance |
| **Auth & Security** | **Passport JWT**, **Bcrypt** | `^4.0.1` / `^5.1.1` | Whitelist auth guard (`JwtAuthGuard`), refresh token rotation |
| **Authorization** | **RolesGuard** (`@Roles('admin')`) | Custom | Role-based access control (`customer` vs `admin`) |
| **Validation & Serialization** | **class-validator**, **class-transformer** | `^0.14.1` / `^0.5.1` | Strict DTO validation and fail-fast environment schema |
| **API Documentation** | **@nestjs/swagger** | `^11.0.0` | Live Swagger/OpenAPI documentation (`/docs`) |
| **Security & Performance** | **Throttler**, **Compression**, **Cookie-Parser** | `^6.4.0` / `^1.7.5` | Rate limiting, Gzip/Brotli compression, HTTP-only cookie support |
| **Testing** | **Jest**, **Supertest** | `^29.7.0` / `^7.0.0` | Unit and end-to-end (E2E) testing framework |

---

## 🏛️ Architecture & Key Features

- **Centralized Response Envelope (`ResponseInterceptor`):** All successful API responses are normalized to `{ status: 'success', data: ... }`. Controllers return raw payloads without manual wrappers.
- **Unified Error Handling (`AllExceptionsFilter`):** Validation and server errors are surfaced in a standardized format: `{ status: 'error', reason: {...} }` or `{ status: 'error', message: "..." }`.
- **Fail-Fast Configuration:** Critical environment variables (`DATABASE_URL`, `JWT_ACCESS_SECRET`, etc.) are validated with `class-validator` at boot time; the server will halt immediately if configuration is missing.
- **Dual-Layer Cart Synchronization:** Database-synced cart for authenticated users; server-managed guest cart via `guest_cart_id` cookie with seamless merge upon login (`/cart/merge`).
- **Concurrent Stock Management:** Atomic database updates (`WHERE stockQuantity >= pieces`) within database transactions prevent race conditions and overselling.
- **AI Customer Assistant:** Live chatbot integrated with Google Gemini API for personalized supplement recommendations and guidance.

---

## 📁 Directory Structure

```bash
ojs-nutrition-fullstack/
├── apps/
│   └── api/                    # NestJS Backend API
│       ├── prisma/
│       │   ├── schema.prisma   # Database models (User, Product, Order, Cart, etc.)
│       │   └── seed.ts         # Seed script populating DB from mock datasets
│       ├── src/
│       │   ├── common/         # Interceptors, Filters, Guards, Decorators
│       │   ├── config/         # Typed config and fail-fast env validation
│       │   ├── prisma/         # Global PrismaService
│       │   ├── auth/           # Login, register, refresh token, JWT strategy
│       │   ├── users/          # Profile and user management
│       │   ├── addresses/      # Address CRUD operations
│       │   ├── locations/      # Country / Region / Subregion lookup services
│       │   ├── products/       # Products, variants, categories, best-sellers
│       │   ├── cart/           # Guest & User server-side cart
│       │   ├── orders/         # Order creation, shipping fee calculation, checkout
│       │   ├── payments/       # Payment provider (iyzico tokenization) integration
│       │   ├── reviews/        # Product reviews and rating aggregation
│       │   ├── faq/            # FAQ management
│       │   ├── contact/        # Contact inquiries
│       │   ├── media/          # Static media hosting (/media)
│       │   └── admin/          # Dashboard analytics and administration endpoints
│       └── test/               # E2E test suites
├── src/                        # React Frontend SPA
│   ├── assets/                 # Static images and icons
│   ├── components/             # Reusable UI components
│   │   ├── common/             # Navbar, Footer, ProductCard, etc.
│   │   ├── modals/             # Address modals, Cart sheet drawer
│   │   ├── payment/            # Step-by-step checkout components
│   │   ├── product-detail/     # Variant/Flavor selectors, accordions
│   │   └── ui/                 # Shadcn UI primitives (Button, Dialog, Accordion, etc.)
│   ├── data/                   # Mock API and static content datasets
│   ├── hooks/                  # Custom React hooks (Chatbot, Variant logic, etc.)
│   ├── routes/                 # Route pages (Home, Products, Account, Payment, etc.)
│   ├── schemas/                # Zod form validation schemas
│   ├── services/               # Axios API clients and service layer
│   ├── store/                  # Zustand global state stores
│   ├── types/                  # TypeScript interface and type definitions
│   └── utils/                  # Utility helpers and image URL resolvers
├── BACKEND_PLAN.md             # Backend architecture and API specification
├── ENGINEERING_STANDARDS.md    # Clean code, security, and performance standards
└── FRONTEND_NEXTJS_PLAN.md     # Next.js App Router migration roadmap
```

---

## 🛍️ Pages & Modules Map

| Page / Feature | Client Route | Description |
|---|---|---|
| **Home Page** | `/` | Best-sellers, featured categories, dynamic promotional banners, and search |
| **Product Catalog** | `/products` | Category filtering, pagination, sorting, and responsive grid |
| **Category View** | `/products/protein` | Category-specific dynamic product listing |
| **Product Detail** | `/product/:id` | Variant/Size/Flavor selector, nutrition table, customer reviews |
| **Cart Sheet** | Drawer / Sheet | Quantity management, real-time total calculation, backend sync |
| **Checkout Flow** | `/payment` | Address selection, dynamic shipping calculation, card tokenization |
| **Order Confirmation**| `/payment/thank-you` | Real-time order summary and tracking number |
| **Account Overview** | `/account` | Profile editing, order history with detail modal |
| **Address Manager** | `/account/addresses` | Hierarchical Country/Region/Subregion cascading address CRUD |
| **Authentication** | `/login`, `/register` | JWT login, registration, and client/server validation |
| **Contact & FAQ** | `/contact`, `/faq` | Validated contact form and categorized accordion FAQ |
| **AI Assistant** | Floating Widget | Global Gemini-powered supplement advisor chatbot |

---

## 🔌 API Documentation & Endpoints

When the backend is running, the interactive Swagger documentation is available at **[http://localhost:3000/docs](http://localhost:3000/docs)**.

### Key Endpoints Summary

```
POST   /api/v1/auth/login                     # User login (returns access + refresh tokens)
POST   /api/v1/auth/register                  # New user registration
POST   /api/v1/auth/token/refresh             # Access token renewal

GET    /api/v1/products                       # Product listing (with pagination & category filter)
GET    /api/v1/products/:slug                 # Product detail with variants & nutrition facts
GET    /api/v1/products/best-sellers          # Featured best-seller items
GET    /api/v1/categories                     # Hierarchical category tree

GET    /api/v1/cart                           # Fetch current cart (Authenticated / Guest)
POST   /api/v1/cart                           # Add item/variant to cart
DELETE /api/v1/cart                           # Remove item from cart
POST   /api/v1/cart/merge                     # Merge guest session cart into user account

GET    /api/v1/users/my-account               # Get account profile
PUT    /api/v1/users/my-account               # Update account profile
GET    /api/v1/users/addresses                # List user addresses
POST   /api/v1/users/addresses                # Create new address

GET    /api/v1/orders                         # List user orders
POST   /api/v1/orders/complete-shopping       # Finalize checkout (with atomic stock deduction)

GET    /api/v1/admin/dashboard/stats          # Admin revenue & order analytics
```

---

## ⚙️ Installation & Getting Started

### Prerequisites
- **Node.js**: `v20+` or `v22+`
- **pnpm**: `v9+` (or npm / yarn)
- **PostgreSQL**: `v15+` (Local or hosted on Neon / Supabase)

### 1. Clone the Repository
```bash
git clone https://github.com/bgungor1/OJS-Nutrition-FS.git
cd OJS-Nutrition-FS
```

### 2. Backend (API) Setup
```bash
cd apps/api
cp .env.example .env

# Install dependencies
pnpm install

# Generate Prisma Client and apply migrations
pnpm prisma:generate
pnpm prisma:migrate

# Seed sample data into the database
pnpm db:seed

# Start the NestJS development server
pnpm start:dev
```
> API will run at `http://localhost:3000/api/v1`, Swagger docs at `http://localhost:3000/docs`.

### 3. Frontend (Client) Setup
Open a new terminal and return to the root folder:
```bash
# Install dependencies
pnpm install

# Start the Vite development server
pnpm run dev
```
> Frontend will run at `http://localhost:5173`.

---

## 🔐 Environment Variables (.env)

### Backend (`apps/api/.env`)
```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ojs_nutrition?schema=public"

# Server & Port
PORT=3000
API_GLOBAL_PREFIX="api/v1"
CORS_ORIGINS="http://localhost:5173,http://localhost:3000"

# JWT Configuration
JWT_ACCESS_SECRET="your-super-secret-access-key-here"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-here"
JWT_ACCESS_EXPIRES="15m"
JWT_REFRESH_EXPIRES="7d"

# Media Storage
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

## 🧪 Testing & Quality Assurance

```bash
# Backend unit & e2e test suites
cd apps/api
pnpm test          # Unit tests
pnpm test:e2e      # End-to-end tests
pnpm lint          # Linting with ESLint

# Frontend linting and type verification
cd ../..
pnpm lint
pnpm build
```

---

## 📐 Engineering Standards

For detailed information on clean code conventions, error handling, N+1 query prevention, and security rules, refer to [ENGINEERING_STANDARDS.md](./ENGINEERING_STANDARDS.md). For full API specifications, refer to [BACKEND_PLAN.md](./BACKEND_PLAN.md).

---

## 📝 License

This project is licensed under the **MIT** License.
