# 🥤 OJS Nutrition — Full-Stack Monorepo E-Commerce Platform

**English** | [Türkçe](./README.md)

OJS Nutrition is a modern, supplement-oriented **Full-Stack (Next.js 15 + NestJS 11 + PostgreSQL)** e-commerce platform built according to modern web engineering standards, clean architecture principles, and a scalable monorepo setup.

> 💡 **Project Evolution & Architectural Journey (Vite SPA → Full-Stack Monorepo):**  
> This project was developed as a **self-improvement, showcase, and portfolio project** to demonstrate real-world software architecture, clean code practices, and modern full-stack workflows.  
> Originally initiated as a client-side **React 19 + Vite SPA**, the platform was systematically re-architected into a robust **Full-Stack Monorepo** powered by **Next.js 15 (App Router)** and **NestJS 11 + Prisma ORM**. This evolution highlights critical enterprise capabilities including **Server-Side Rendering (SSR)**, **Incremental Static Regeneration (ISR)**, **Server Components**, **HTTP-only cookie-based authentication**, and **atomic transaction-guaranteed checkout and inventory management**. (The original v1 Vite SPA implementation remains available under the root `src/` folder for historical reference).

---

## 📑 Table of Contents

- [Architecture & Key Features](#-architecture--key-features)
- [Technology Stack](#-technology-stack)
- [Directory Structure (Monorepo)](#-directory-structure-monorepo)
- [Pages & Modules Map](#-pages--modules-map)
- [API Documentation & Endpoints](#-api-documentation--endpoints)
- [Installation & Getting Started](#-installation--getting-started)
- [Environment Variables (.env)](#-environment-variables-env)
- [Testing & Quality Assurance](#-testing--quality-assurance)
- [Engineering Standards](#-engineering-standards)
- [License](#-license)

---

## 🏛️ Architecture & Key Features

- **Full-Stack Monorepo Architecture (`pnpm workspaces`):** Decoupled, independently deployable and scalable frontend (`apps/web`) and backend (`apps/api`) packages within a unified repository.
- **Server & Client Components Balance:** High-performance server-side rendering for catalog and product landing pages (SSR/ISR) paired with optimized Client Components for interactive filtering, cart drawers, and checkout steps.
- **Centralized Response Envelope (`ResponseInterceptor`):** All successful API responses are strictly normalized to `{ status: 'success', data: ... }`. Controllers return raw domain models without manual wrapping.
- **Standardized Error Handling (`AllExceptionsFilter`):** Validation errors and unhandled exceptions are cleanly surfaced as `{ status: 'error', reason: {...} }` or `{ status: 'error', message: "..." }`.
- **Fail-Fast Configuration Schema:** Critical environment parameters (`DATABASE_URL`, `JWT_ACCESS_SECRET`, etc.) are validated at boot time via `class-validator`; the server halts immediately if configurations are missing or invalid.
- **Dual-Layer Cart Synchronization:** Fully synchronized database-backed cart for authenticated users, paired with guest session carts via `guest_cart_id` cookie and automatic merge upon login (`/cart/merge`).
- **Concurrent Stock Management:** Atomic database updates (`WHERE stockQuantity >= pieces`) within PostgreSQL transactions prevent race conditions and overselling during peak traffic.
- **Secure Authentication & RBAC:** Short-lived Access Tokens, Refresh Token rotation, secure HTTP-only cookie support, and declarative role-based access control via `RolesGuard` (`customer` vs `admin`).
- **AI Customer Assistant:** Interactive live chatbot widget integrated with Google Gemini API for real-time supplement recommendations and customer guidance.

---

## 🚀 Technology Stack

### 🖥️ Frontend (Client — `apps/web`)

| Layer | Tool / Library | Version | Description |
|---|---|---|---|
| **Framework** | **Next.js (App Router)** | `^15.2.1` | SSR, ISR, Server Components, Route Groups, and Metadata API |
| **Library** | **React** | `^19.0.0` | React 19 component architecture and hooks |
| **Language** | **TypeScript** | `^5.7.3` | End-to-end type safety and strict type checking |
| **Styling & Design** | **TailwindCSS v4**, **PostCSS** | `^4.0.9` | Utility-first styling engine with responsive design |
| **UI Primitives** | **Radix UI**, **Lucide React** | `^1.1.x` / `^0.477.0` | Accessible unstyled primitives and modern vector iconography |
| **Animations** | **Motion (Framer Motion)** | `^12.4.7` | Fluid micro-interactions and smooth layout animations |
| **State Management** | **Zustand** | `^5.0.3` | Lightweight client-side cart and UI state store |
| **Forms & Validation** | **React Hook Form** + **Zod** | `^7.54.2` / `^3.24.2` | Type-safe, schema-driven, performant form validations |
| **Testing** | **Vitest**, **Testing Library**, **JSDOM** | `^5.0.0` / `^16.3.3` | Fast ESM-native unit and component test suites |

### ⚙️ Backend (Server & API — `apps/api`)

| Layer | Tool / Library | Version | Description |
|---|---|---|---|
| **Framework** | **NestJS** | `^11.0.1` | Modular enterprise Node.js architecture |
| **ORM** | **Prisma ORM** | `^6.2.1` | Type-safe database queries and automated migrations |
| **Database** | **PostgreSQL** | `15+` | Relational schema, JSON facts storage, and query indexes |
| **Auth & Security** | **Passport JWT**, **Bcrypt** | `^4.0.1` / `^5.1.1` | Whitelist auth guard (`JwtAuthGuard`), refresh token rotation |
| **Authorization** | **RolesGuard** (`@Roles('admin')`) | Custom Guard | Granular RBAC for `customer` and `admin` roles |
| **Validation & Serialization** | **class-validator**, **class-transformer** | `^0.14.1` / `^0.5.1` | Strict DTO validation and fail-fast environment schema |
| **API Documentation** | **@nestjs/swagger** | `^11.0.0` | Interactive Swagger/OpenAPI documentation (`/docs`) |
| **Security & Performance** | **Helmet**, **Throttler**, **Compression** | `^8.3.0` / `^6.4.0` / `^1.7.5` | Security headers, rate limiting, and gzip/brotli compression |
| **Testing** | **Jest**, **Supertest** | `^29.7.0` / `^7.0.0` | Unit and end-to-end (E2E) testing framework |

---

## 📁 Directory Structure (Monorepo)

```bash
OJS-Nutrition-FS/
├── apps/
│   ├── web/                     # Next.js 15 Frontend (App Router, Tailwind v4, Zustand)
│   │   ├── app/                 # App Router pages, layouts, and route groups
│   │   │   ├── (shop)/          # Customer-facing storefront (Home, Catalog, Product, Account)
│   │   │   ├── layout.tsx       # Root layout
│   │   │   └── not-found.tsx    # 404 page
│   │   ├── components/          # Modular domain and UI components (account, auth, catalog, ui...)
│   │   ├── lib/                 # API client, schemas (Zod), utility helpers
│   │   ├── test/                # Vitest test files and setup
│   │   └── vitest.config.mts    # Test runner configuration
│   │
│   └── api/                     # NestJS 11 Backend API (Prisma, PostgreSQL)
│       ├── prisma/
│       │   ├── schema.prisma    # Database schema (User, Product, Order, Cart, etc.)
│       │   └── seed.ts          # Realistic mock data seeding script
│       ├── src/
│       │   ├── common/          # Interceptors, Filters, Guards, and Decorators
│       │   ├── config/          # Typed config and fail-fast env schema
│       │   ├── prisma/          # Global PrismaService
│       │   ├── auth/            # JWT login, register, token refresh, OAuth strategies
│       │   ├── users/           # Profile and user management
│       │   ├── addresses/       # Address CRUD operations
│       │   ├── locations/       # Region and subregion lookup services
│       │   ├── products/        # Products, variants, categories, best-sellers
│       │   ├── cart/            # Guest and authenticated cart system
│       │   ├── orders/          # Order creation, atomic stock deduction, checkout
│       │   ├── payments/        # Payment provider integration (iyzico tokenization)
│       │   ├── reviews/         # Product reviews and rating aggregation
│       │   ├── faq/             # FAQ management
│       │   ├── contact/         # Customer inquiries
│       │   ├── media/           # Static media asset hosting (/media)
│       │   └── admin/           # Administrative metrics and dashboard endpoints
│       └── test/                # Jest E2E test suites
│
├── src/                         # [V1 Reference] Legacy Vite SPA source code preserved for reference
├── pnpm-workspace.yaml          # pnpm workspace configuration
├── BACKEND_PLAN.md              # Backend architecture and API specification
├── FRONTEND_NEXTJS_PLAN.md      # Next.js App Router migration blueprint
└── ENGINEERING_STANDARDS.md     # Clean code, security, and N+1 prevention guidelines
```

---

## 🛍️ Pages & Modules Map

| Page / Feature | Client Route | Description |
|---|---|---|
| **Home Page** | `/` | Best-sellers, featured categories, dynamic promotional banners, and search |
| **Product Catalog** | `/products` | Category filtering, pagination, sorting, and responsive grid |
| **Category View** | `/products/[category]` | Dynamic category-filtered product listing |
| **Product Detail** | `/product/[slug]` | Variant/Size/Flavor selector, nutrition table, customer reviews |
| **Cart (Drawer)** | Drawer / Sheet | Quantity management, real-time total calculation, backend sync |
| **Checkout Flow** | `/payment` | Address selection, dynamic shipping calculation, card tokenization |
| **Order Confirmation**| `/payment/thank-you` | Real-time order summary and tracking number |
| **Account Overview** | `/account` | Profile editing, order history with detail modal |
| **Address Manager** | `/account/addresses` | Cascading Country/Region/City address CRUD |
| **Authentication** | `/login`, `/register` | JWT and cookie-based login, registration, and client/server validation |
| **Contact & FAQ** | `/contact`, `/faq` | Validated contact form and categorized accordion FAQ |
| **AI Assistant** | Chatbot Widget | Global Gemini-powered supplement advisor chatbot |

---

## 🔌 API Documentation & Endpoints

When the backend server is running, the interactive Swagger documentation is available at **[http://localhost:3000/docs](http://localhost:3000/docs)**.

### Key Endpoints Summary

```
POST   /api/v1/auth/login                     # User login (returns access + refresh tokens & sets cookie)
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
- **pnpm**: `v9+` (Recommended package manager)
- **PostgreSQL**: `v15+` (Local or hosted on Neon / Supabase)

### 1. Clone the Repository
```bash
git clone https://github.com/bgungor1/OJS-Nutrition-FS.git
cd OJS-Nutrition-FS
```

### 2. Install Dependencies
Install all monorepo dependencies across workspaces in one step:
```bash
pnpm install
```

### 3. Backend (API) Setup & Start
```bash
cd apps/api
cp .env.example .env

# Generate Prisma Client and apply database migrations
pnpm prisma:generate
pnpm prisma:migrate

# Seed the database with sample datasets
pnpm db:seed

# Start the NestJS development server
pnpm start:dev
```
> API will run at `http://localhost:3000/api/v1`, Swagger docs at `http://localhost:3000/docs`.

### 4. Frontend (Web) Setup & Start
Open a new terminal session:
```bash
cd apps/web
cp .env.example .env.local

# Start the Next.js development server
pnpm dev
```
> Frontend will be available at `http://localhost:3001` (or 3000 based on port allocation).

Alternatively, launch services directly from the repository root:
- `pnpm dev:api` — Starts the backend API development server.
- `pnpm dev:web` — Starts the frontend Next.js development server.

---

## 🔐 Environment Variables (.env)

### Backend (`apps/api/.env`)
```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ojs_nutrition?schema=public"

# Server & Port
PORT=3000
API_GLOBAL_PREFIX="api/v1"
CORS_ORIGINS="http://localhost:3000,http://localhost:3001"

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

### Frontend (`apps/web/.env.local`)
```env
# Server-side API URL (Server Components & Server Actions)
API_BASE_URL=http://localhost:3000/api/v1

# Client-side API URL (Client Components & Browser)
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api/v1

# Media host for static assets & images
NEXT_PUBLIC_IMAGE_HOST=http://localhost:3000
```

---

## 🧪 Testing & Quality Assurance

The codebase includes end-to-end test suites and automated linting:

```bash
# Run all workspace tests from root
pnpm test

# Run only Frontend (Next.js - Vitest) tests
pnpm test:web
pnpm test:web:coverage

# Run only Backend (NestJS - Jest) tests
pnpm test:api
pnpm test:api:coverage

# Format and lint code
pnpm lint:web
pnpm lint:api
```

---

## 📐 Engineering Standards

For detailed architectural guidelines, N+1 query prevention, security rules, and code conventions, consult [ENGINEERING_STANDARDS.md](./ENGINEERING_STANDARDS.md). For detailed API specifications, see [BACKEND_PLAN.md](./BACKEND_PLAN.md). For Next.js migration decisions, see [FRONTEND_NEXTJS_PLAN.md](./FRONTEND_NEXTJS_PLAN.md).

---

## 📝 License

This project is licensed under the **MIT** License.
