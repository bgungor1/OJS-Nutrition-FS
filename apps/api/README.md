# apps/api — OJS Nutrition Backend

NestJS + Prisma + PostgreSQL. Sözleşme: `../../BACKEND_PLAN.md`,
kod kuralları: `../../ENGINEERING_STANDARDS.md`.

> Bu bir **iskelet**tir. Klasör yapısı, ortak altyapı (`common/`), config
> doğrulama ve Prisma şeması hazırdır; endpoint gövdeleri fazlara göre
> doldurulacaktır (her controller'da route tablosu yorum olarak durur).

## Kurulum

```bash
cd apps/api
cp .env.example .env          # değerleri doldur (DATABASE_URL, JWT secret'ları)
pnpm install
pnpm prisma:generate
pnpm prisma:migrate           # ilk migration (Postgres ayakta olmalı)
pnpm start:dev
```

- API: `http://localhost:3000/api/v1`
- Swagger: `http://localhost:3000/docs`
- Statik medya: `http://localhost:3000/media`

## Komutlar

| Komut | Açıklama |
|---|---|
| `pnpm start:dev` | watch modda çalıştır |
| `pnpm build` | `dist/` üretimi |
| `pnpm lint` | ESLint (flat config) |
| `pnpm test` | unit testler |
| `pnpm prisma:studio` | Prisma Studio |
| `pnpm db:seed` | seed script (Faz 1'de doldurulacak) |

## Yapı

```
src/
├── common/     # ResponseInterceptor, AllExceptionsFilter, guard'lar, decorator'lar
├── config/     # env validation (fail-fast), tipli configuration
├── prisma/     # PrismaService (global)
├── auth/       users/  addresses/  locations/  products/  cart/
├── orders/     payments/  reviews/  faq/  contact/  media/  admin/
```
