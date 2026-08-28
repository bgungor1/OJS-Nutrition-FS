import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed script iskeleti.
 *
 * Faz 1'de burada:
 *  - apps/web/src/data/mock-api-data.ts içindeki ürün/varyant verisi Category /
 *    SubCategory / Product / ProductVariant kayıtlarına dönüştürülür,
 *  - apps/web/src/data/faq-data.ts -> FaqItem,
 *  - lokasyon (Country/Region/Subregion) referans verisi,
 *  - bir admin kullanıcı (role = admin) oluşturulur.
 *
 * Bkz. BACKEND_PLAN.md §9 (Faz 1).
 */
async function main(): Promise<void> {
  console.log('Seed: TODO — Faz 1 kapsamında doldurulacak.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
