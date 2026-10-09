import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ExplainRow {
  'QUERY PLAN': string;
}

async function runExplain(label: string, query: string, forceIndex = false): Promise<void> {
  console.log(`\n================================================================`);
  console.log(`🔬 [TEST] ${label} ${forceIndex ? '(Planner: enable_seqscan = OFF)' : '(Planner: Default CBO)'}`);
  console.log(`Query: ${query}`);
  console.log(`----------------------------------------------------------------`);

  try {
    if (forceIndex) {
      await prisma.$executeRawUnsafe(`SET enable_seqscan = off;`);
    } else {
      await prisma.$executeRawUnsafe(`SET enable_seqscan = on;`);
    }

    const result = await prisma.$queryRawUnsafe<ExplainRow[]>(
      `EXPLAIN (ANALYZE, BUFFERS, VERBOSE) ${query}`,
    );
    const lines = result.map((r) => r['QUERY PLAN']);
    lines.forEach((line) => console.log(`   ${line}`));

    const isIndex = lines.some(
      (l) =>
        l.toLowerCase().includes('bitmap index scan') ||
        l.toLowerCase().includes('index scan') ||
        l.toLowerCase().includes('bitmap heap scan'),
    );
    const hasQuicksort = lines.some((l) =>
      l.toLowerCase().includes('quicksort'),
    );

    console.log(`\n   🎯 Index Kullanımı: ${isIndex ? '✅ İndeks Devrede (Index/Bitmap Scan)' : '⚠️ Seq Scan'}`);
    if (query.includes('ORDER BY')) {
      console.log(`   🎯 Sıralama Durumu: ${!hasQuicksort ? '✅ Zero-Sort (Quicksort Yok)' : '⚠️ RAM Quicksort Mevcut'}`);
    }
  } catch (err: any) {
    console.error(`   ❌ Hata: ${err.message}`);
  }
}

async function main(): Promise<void> {
  console.log('🚀 FAZ 3.2: İndeks & Arama Optimizasyonu Doğrulama Testi Başlıyor...\n');

  // 1. Review Composite Index Test
  const sampleProduct = await prisma.product.findFirst({ select: { id: true } });
  const sampleProductId = sampleProduct?.id ?? '00000000-0000-0000-0000-000000000000';

  await runExplain(
    'HEDEF 1: Review Composite Index (productId + createdAt DESC)',
    `SELECT "id", "productId", "rating", "title", "createdAt" FROM "Review" WHERE "productId" = '${sampleProductId}' ORDER BY "createdAt" DESC LIMIT 10;`,
    false,
  );
  await runExplain(
    'HEDEF 1: Review Composite Index (productId + createdAt DESC)',
    `SELECT "id", "productId", "rating", "title", "createdAt" FROM "Review" WHERE "productId" = '${sampleProductId}' ORDER BY "createdAt" DESC LIMIT 10;`,
    true,
  );

  // 2. Product Tags GIN Index Test
  await runExplain(
    'HEDEF 2A: Product.tags GIN Index (Array = ANY)',
    `SELECT "id", "name", "tags" FROM "Product" WHERE 'PROTEİN' = ANY("tags");`,
    false,
  );
  await runExplain(
    'HEDEF 2B: Product.tags GIN Index (Array Containment @>)',
    `SELECT "id", "name", "tags" FROM "Product" WHERE "tags" @> ARRAY['PROTEİN'];`,
    true,
  );
  await runExplain(
    'HEDEF 2C: Product.tags GIN Index (Array Overlap &&)',
    `SELECT "id", "name", "tags" FROM "Product" WHERE "tags" && ARRAY['PROTEİN'];`,
    true,
  );

  // 3. Product Full-Text Trigram Search Test (Name)
  await runExplain(
    'HEDEF 3A: Product Trigram Search (name ILIKE %protein%)',
    `SELECT "id", "name", "slug" FROM "Product" WHERE "name" ILIKE '%protein%';`,
    false,
  );
  await runExplain(
    'HEDEF 3A: Product Trigram Search (name ILIKE %protein%)',
    `SELECT "id", "name", "slug" FROM "Product" WHERE "name" ILIKE '%protein%';`,
    true,
  );

  // 4. Product Full-Text Trigram Search Test (Multi-field OR)
  await runExplain(
    'HEDEF 3B: Product Trigram Search (OR Multi-column)',
    `SELECT "id", "name", "slug" FROM "Product" WHERE "name" ILIKE '%whey%' OR "shortExplanation" ILIKE '%whey%' OR "slug" ILIKE '%whey%' LIMIT 12;`,
    false,
  );
  await runExplain(
    'HEDEF 3B: Product Trigram Search (OR Multi-column)',
    `SELECT "id", "name", "slug" FROM "Product" WHERE "name" ILIKE '%whey%' OR "shortExplanation" ILIKE '%whey%' OR "slug" ILIKE '%whey%' LIMIT 12;`,
    true,
  );

  await prisma.$disconnect();
  console.log('\n🏁 FAZ 3.2 Doğrulama Tamamlandı.\n');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
