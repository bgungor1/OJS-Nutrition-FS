import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ExplainRow {
  'QUERY PLAN': string;
}

interface DiagnosisResult {
  target: string;
  name: string;
  query: string;
  plan: string[];
  executionTimeMs?: number;
  planningTimeMs?: number;
  scanType: string;
  sortType: string;
  diagnosis: string;
  recommendation: string;
}

async function runExplain(query: string): Promise<{ plan: string[]; executionTimeMs?: number; planningTimeMs?: number }> {
  const result = await prisma.$queryRawUnsafe<ExplainRow[]>(`EXPLAIN (ANALYZE, BUFFERS, VERBOSE) ${query}`);
  const lines = result.map((r) => r['QUERY PLAN']);

  let executionTimeMs: number | undefined;
  let planningTimeMs: number | undefined;

  for (const line of lines) {
    const execMatch = line.match(/Execution Time:\s*([0-9.]+)\s*ms/i);
    if (execMatch) {
      executionTimeMs = parseFloat(execMatch[1]);
    }
    const planMatch = line.match(/Planning Time:\s*([0-9.]+)\s*ms/i);
    if (planMatch) {
      planningTimeMs = parseFloat(planMatch[1]);
    }
  }

  return { plan: lines, executionTimeMs, planningTimeMs };
}

async function main(): Promise<void> {
  console.log('🩺 [FAZ 2.2 RÖNTGEN] PostgreSQL EXPLAIN (ANALYZE, BUFFERS) Teşhis Başlatılıyor...\n');

  // Örnek bir product ID çekelim
  const sampleProduct = await prisma.product.findFirst({ select: { id: true } });
  const sampleProductId = sampleProduct?.id ?? '00000000-0000-0000-0000-000000000000';

  // Birden fazla product ID çekelim (variant sorgusu için)
  const sampleProducts = await prisma.product.findMany({ take: 3, select: { id: true } });
  const sampleProductIdsList = sampleProducts.map((p) => `'${p.id}'`).join(', ') || `'${sampleProductId}'`;

  const targets = [
    {
      target: '1',
      name: 'Product.tags (Dizi / Array Filtreleme)',
      query: `SELECT "id", "name", "tags" FROM "Product" WHERE 'protein' = ANY("tags");`,
      analyzeScan: (plan: string[]) => {
        const isSeq = plan.some((l) => l.toLowerCase().includes('seq scan'));
        const isGin = plan.some((l) => l.toLowerCase().includes('index scan') || l.toLowerCase().includes('bitmap'));
        return isGin ? 'Index Scan (GIN)' : isSeq ? 'Seq Scan (Tablo Taranıyor)' : 'Seq Scan';
      },
      analyzeSort: (_plan: string[]) => 'N/A',
      diagnosis:
        'Product.tags kolonu üzerinde GIN indeksi bulunmadığı için PostgreSQL dizinin elemanlarını kontrol etmek için tablonun tamamını (Seq Scan) satır satır okur.',
      recommendation: 'CREATE INDEX IF NOT EXISTS "Product_tags_gin_idx" ON "Product" USING GIN ("tags");',
    },
    {
      target: '2',
      name: 'Review (Yorum Listeleme: productId + createdAt DESC)',
      query: `SELECT "id", "productId", "rating", "title", "createdAt" FROM "Review" WHERE "productId" = '${sampleProductId}' ORDER BY "createdAt" DESC LIMIT 10;`,
      analyzeScan: (plan: string[]) => {
        const isIndex = plan.some((l) => l.toLowerCase().includes('index scan') || l.toLowerCase().includes('bitmap'));
        return isIndex ? 'Index Scan (productId)' : 'Seq Scan';
      },
      analyzeSort: (plan: string[]) => {
        const hasSort = plan.some((l) => l.toLowerCase().includes('sort'));
        return hasSort ? 'Ayrı Sort Düğümü (In-Memory Quicksort / Top-N)' : 'İndeks Sıralı (Zero-Sort)';
      },
      diagnosis:
        'Review tablosunda sadece productId indeksi var. createdAt kolonu indekste yer almadığı için veritabanı bulunan tüm yorumları RAM üzerinde yeniden sıralamak (Sort) zorundadır.',
      recommendation:
        'Review modeline composite index eklenmeli: @@index([productId, createdAt(sort: Desc)])',
    },
    {
      target: '3',
      name: 'Order (Admin Dashboard: status + createdAt Aralık Sorgusu)',
      query: `SELECT "id", "orderNo", "status", "totalPrice", "createdAt" FROM "Order" WHERE "status" = 'processing'::"OrderStatus" AND "createdAt" >= NOW() - INTERVAL '30 days' ORDER BY "createdAt" DESC;`,
      analyzeScan: (plan: string[]) => {
        const isBitmap = plan.some((l) => l.toLowerCase().includes('bitmap index scan'));
        const isIndex = plan.some((l) => l.toLowerCase().includes('index scan'));
        const isSeq = plan.some((l) => l.toLowerCase().includes('seq scan'));
        return isIndex ? 'Index Scan' : isBitmap ? 'Bitmap Index Scan' : isSeq ? 'Seq Scan' : 'Diğer';
      },
      analyzeSort: (plan: string[]) => {
        const hasSort = plan.some((l) => l.toLowerCase().includes('sort'));
        return hasSort ? 'Ayrı Sort Düğümü (Quicksort)' : 'İndeks Sıralı (Zero-Sort)';
      },
      diagnosis:
        'Order tablosunda sadece status üzerinde tekil indeks var. status + createdAt birleşik olmadığı için zaman aralığı ve sıralama ekstra filtreleme ve sıralama maliyeti üretir.',
      recommendation: 'Order modeline composite index eklenmeli: @@index([status, createdAt])',
    },
    {
      target: '4',
      name: 'CartItem (Misafir Sepet Sorgulama & Birleştirme)',
      query: `SELECT "id", "guestSessionId", "productId", "productVariantId", "pieces" FROM "CartItem" WHERE "guestSessionId" = '00000000-0000-0000-0000-000000000001';`,
      analyzeScan: (plan: string[]) => {
        const isIndex = plan.some((l) => l.toLowerCase().includes('index scan') || l.toLowerCase().includes('bitmap'));
        return isIndex ? 'Index Scan (guestSessionId_idx)' : 'Seq Scan';
      },
      analyzeSort: (_plan: string[]) => 'N/A',
      diagnosis:
        'CartItem tablosunda @@index([guestSessionId]) indeksi mevcuttur. Misafir sepeti sorgulamaları doğrudan B-Tree üzerinden yürütülür.',
      recommendation: 'Mevcut guestSessionId indeksi korunmalı; unique constraint doğrulaması sürdürülmeli.',
    },
    {
      target: '5',
      name: 'Product Listeleme & Sıralama (ORDER BY createdAt DESC) [Sentry 204ms]',
      query: `SELECT "id", "name", "slug", "createdAt" FROM "Product" ORDER BY "createdAt" DESC LIMIT 12;`,
      analyzeScan: (plan: string[]) => {
        const isSeq = plan.some((l) => l.toLowerCase().includes('seq scan'));
        const isIndex = plan.some((l) => l.toLowerCase().includes('index scan'));
        return isIndex ? 'Index Scan (createdAt)' : isSeq ? 'Seq Scan (Tüm Tablo Taranıyor)' : 'Diğer';
      },
      analyzeSort: (plan: string[]) => {
        const hasSort = plan.some((l) => l.toLowerCase().includes('sort'));
        return hasSort ? 'Top-N Heapsort (Bellekte Sıralama)' : 'İndeks Üzerinden Doğrudan Okuma (Zero-Sort)';
      },
      diagnosis:
        'Product tablosunda createdAt üzerinde B-Tree indeksi YOKTUR! Sentryde yakalanan 204ms süresinin temel nedeni, PostgreSQLin tüm ürünleri Seq Scan ile okuyup ardından top-N heapsort ile bellekte sıralamasıdır.',
      recommendation: 'Product modeline B-Tree indeksi eklenmeli: @@index([createdAt])',
    },
    {
      target: '6',
      name: 'ProductVariant İlişkisel Çekim (WHERE productId IN (...) ORDER BY createdAt ASC) [Sentry 137ms]',
      query: `SELECT "id", "productId", "totalPrice", "createdAt" FROM "ProductVariant" WHERE "productId" IN (${sampleProductIdsList}) ORDER BY "createdAt" ASC;`,
      analyzeScan: (plan: string[]) => {
        const isIndex = plan.some((l) => l.toLowerCase().includes('index scan') || l.toLowerCase().includes('bitmap'));
        return isIndex ? 'Bitmap/Index Scan (productId)' : 'Seq Scan';
      },
      analyzeSort: (plan: string[]) => {
        const hasSort = plan.some((l) => l.toLowerCase().includes('sort'));
        return hasSort ? 'Ayrı Sort Düğümü (Quicksort)' : 'İndeks Sıralı (Zero-Sort)';
      },
      diagnosis:
        'ProductVariant modelinde sadece @@index([productId]) vardır. Ancak Prisma ilişkileri çekerken orderBy: { createdAt: "asc" } kuralı işletir. Composite [productId, createdAt] indeksi olmadığı için her ürünün varyantları RAMde yeniden sıralanır (Sentry 137ms).',
      recommendation:
        'ProductVariant modeline composite index eklenmeli: @@index([productId, createdAt])',
    },
    {
      target: '7',
      name: 'Product.count() Sayfalama Sayımı [Sentry 130ms]',
      query: `SELECT COUNT(*) FROM "Product";`,
      analyzeScan: (plan: string[]) => {
        const isSeq = plan.some((l) => l.toLowerCase().includes('seq scan'));
        const isIndexOnly = plan.some((l) => l.toLowerCase().includes('index only scan'));
        return isIndexOnly ? 'Index Only Scan' : isSeq ? 'Seq Scan (Tüm Tablo Sayılıyor)' : 'Aggregate';
      },
      analyzeSort: (_plan: string[]) => 'N/A',
      diagnosis:
        'PostgreSQLde MVCC mimarisi nedeniyle COUNT(*) doğrudan tablonun görünür satırlarını tarar (Seq Scan). Üstelik products.service.ts içinde count ile findMany sırayla await edildiği için bu 130ms kullanıcının bekleme süresine doğrudan eklenir.',
      recommendation:
        '1) Promise.all([count, findMany]) ile count süresi gizlenmeli. 2) Birincil anahtar üzerinde index-only scan teşvik edilmeli.',
    },
  ];

  const results: DiagnosisResult[] = [];

  for (const item of targets) {
    console.log(`🔍 [Hedef ${item.target}] ${item.name} analiz ediliyor...`);
    const { plan, executionTimeMs, planningTimeMs } = await runExplain(item.query);
    const scanType = item.analyzeScan(plan);
    const sortType = item.analyzeSort(plan);

    results.push({
      target: item.target,
      name: item.name,
      query: item.query,
      plan,
      executionTimeMs,
      planningTimeMs,
      scanType,
      sortType,
      diagnosis: item.diagnosis,
      recommendation: item.recommendation,
    });

    console.log(`   -> Tarama Tipi: ${scanType}`);
    console.log(`   -> Sıralama Tipi: ${sortType}`);
    console.log(`   -> Yürütme Süresi: ${executionTimeMs ?? 'N/A'} ms (Planlama: ${planningTimeMs ?? 'N/A'} ms)`);
    console.log('   -> Execution Plan Snippet:');
    plan.forEach((l) => console.log(`      ${l}`));
    console.log('');
  }

  console.log('================================================================');
  console.log('📊 [FAZ 2.2 RÖNTGEN RAPORU TAMAMLANDI]');
  console.log('================================================================\n');

  for (const r of results) {
    console.log(`### HEDEF ${r.target}: ${r.name}`);
    console.log(`- Tarama: ${r.scanType} | Sıralama: ${r.sortType} | Yürütme: ${r.executionTimeMs} ms`);
    console.log(`- Teşhis: ${r.diagnosis}`);
    console.log(`- Çözüm Önerisi: ${r.recommendation}`);
    console.log('');
  }

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error('❌ Hata oluştu:', err);
  process.exit(1);
});
