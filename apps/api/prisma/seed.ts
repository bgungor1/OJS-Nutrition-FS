import { PrismaClient, Role, AuthProvider } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('🌱 Seed işlemi başlatılıyor...');

  // 1. KULLANICILAR (ADMIN & MÜŞTERİ)
  console.log('👤 Kullanıcılar oluşturuluyor...');
  const passwordHashAdmin = await bcrypt.hash('Admin123!', 10);
  const passwordHashCustomer = await bcrypt.hash('Customer123!', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@ojsnutrition.com' },
    update: {},
    create: {
      email: 'admin@ojsnutrition.com',
      passwordHash: passwordHashAdmin,
      authProvider: AuthProvider.local,
      role: Role.admin,
      firstName: 'Admin',
      lastName: 'OJS',
      phoneNumber: '05550000001',
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: 'customer@ojsnutrition.com' },
    update: {},
    create: {
      email: 'customer@ojsnutrition.com',
      passwordHash: passwordHashCustomer,
      authProvider: AuthProvider.local,
      role: Role.customer,
      firstName: 'Berkant',
      lastName: 'Müşteri',
      phoneNumber: '05550000002',
    },
  });
  console.log(`✅ Kullanıcılar hazır: Admin (${admin.email}), Müşteri (${customer.email})`);

  // 2. LOKASYONLAR (ÜLKE, İLLER VE İLÇELER)
  console.log('📍 Lokasyon referans verisi ekleniyor...');
  const turkey = await prisma.country.upsert({
    where: { id: 1 },
    update: { name: 'Türkiye' },
    create: { id: 1, name: 'Türkiye' },
  });

  const cities = [
    {
      id: 1,
      name: 'İstanbul',
      subregions: [
        { id: 1, name: 'Kadıköy' },
        { id: 2, name: 'Beşiktaş' },
        { id: 3, name: 'Üsküdar' },
        { id: 4, name: 'Şişli' },
        { id: 5, name: 'Bakırköy' },
      ],
    },
    {
      id: 2,
      name: 'Ankara',
      subregions: [
        { id: 6, name: 'Çankaya' },
        { id: 7, name: 'Yenimahalle' },
        { id: 8, name: 'Keçiören' },
      ],
    },
    {
      id: 3,
      name: 'İzmir',
      subregions: [
        { id: 9, name: 'Konak' },
        { id: 10, name: 'Karşıyaka' },
        { id: 11, name: 'Bornova' },
      ],
    },
    {
      id: 4,
      name: 'Bursa',
      subregions: [
        { id: 12, name: 'Nilüfer' },
        { id: 13, name: 'Osmangazi' },
      ],
    },
    {
      id: 5,
      name: 'Antalya',
      subregions: [
        { id: 14, name: 'Muratpaşa' },
        { id: 15, name: 'Konyaaltı' },
      ],
    },
  ];

  for (const city of cities) {
    await prisma.region.upsert({
      where: { id: city.id },
      update: { name: city.name, countryId: turkey.id },
      create: { id: city.id, name: city.name, countryId: turkey.id },
    });

    for (const sub of city.subregions) {
      await prisma.subregion.upsert({
        where: { id: sub.id },
        update: { name: sub.name, regionId: city.id },
        create: { id: sub.id, name: sub.name, regionId: city.id },
      });
    }
  }
  console.log('✅ Lokasyonlar eklendi (5 il, 15 ilçe).');

  // 3. SSS (FAQ) MADDELERİ
  console.log('❓ SSS (FAQ) maddeleri ekleniyor...');
  const faqs = [
    {
      question: 'OJS Nutrition ürünlerinin menşei neresi?',
      answer:
        'OJS Nutrition ürünleri, dünya çapında tanınmış ve güvenilir üreticilerden temin edilmektedir. Tüm ürünlerimiz kalite sertifikalarına sahiptir ve uluslararası standartlarda üretilmiştir.',
      category: 'genel',
      sortOrder: 1,
    },
    {
      question: 'Hangi sertifikalarınız var?',
      answer:
        'ISO 9001 Kalite Yönetim Sistemi, GMP (Good Manufacturing Practice), FDA onayı, HACCP sertifikası ve diğer uluslararası kalite belgelerimiz mevcuttur.',
      category: 'genel',
      sortOrder: 2,
    },
    {
      question: 'Satılan ürünler garantili midir? Değişim var mı?',
      answer:
        'Evet, tüm ürünlerimiz %100 orijinallik garantisi ile satılmaktadır. Hasarlı veya hatalı ürünler için 14 gün içinde değişim yapılır.',
      category: 'genel',
      sortOrder: 3,
    },
    {
      question: 'Sipariş verirken sorun yaşıyorum, ne yapmam gerekir?',
      answer:
        'Sipariş verme sırasında teknik bir sorun yaşıyorsanız, müşteri hizmetlerimizi arayabilir veya destek hattımızdan yardım alabilirsiniz.',
      category: 'genel',
      sortOrder: 4,
    },
    {
      question: 'Taksit seçeneği neden yok?',
      answer:
        'Kredi kartı ile yapılan ödemelerde 2, 3, 6, 9 ve 12 aya varan taksit seçenekleri mevcuttur. Taksit seçenekleri ödeme sayfasında kartınıza göre görüntülenir.',
      category: 'urunler',
      sortOrder: 5,
    },
    {
      question: 'Siparişimi nasıl iptal edebilirim?',
      answer:
        'Henüz kargoya verilmemiş siparişleri müşteri panelinden iptal edebilirsiniz. Kargoya verilmiş siparişler için kargo iade sürecini başlatmanız gerekir.',
      category: 'urunler',
      sortOrder: 6,
    },
    {
      question: 'Sattığınız ürünler ilaç mıdır?',
      answer:
        'Hayır, satışını yaptığımız ürünler gıda takviyesidir. İlaç değildir ve hastalık tedavisinde kullanılmaz. Beslenme programınızı destekleyici niteliktedir.',
      category: 'urunler',
      sortOrder: 7,
    },
    {
      question: 'Kapıda ödeme hizmetiniz var mı?',
      answer:
        'Evet, kapıda ödeme seçeneğimiz mevcuttur. Ancak bu seçenek sadece belirli şehirler için geçerlidir.',
      category: 'kargo',
      sortOrder: 8,
    },
    {
      question: 'Sipariş takibimi nasıl yapabilirim?',
      answer:
        'Siparişiniz kargoya verildikten sonra size SMS ve e-posta ile takip numarası gönderilir.',
      category: 'kargo',
      sortOrder: 9,
    },
    {
      question: 'İptal ve iade ettiğim ürünlerin tutarı hesabıma ne zaman aktarılır?',
      answer:
        'İade onaylandıktan sonra kredi kartına iadeler 2-5 iş günü, banka hesabına iadeler 3-7 iş günü içinde gerçekleşir.',
      category: 'kargo',
      sortOrder: 10,
    },
  ];

  for (const faq of faqs) {
    const existing = await prisma.faqItem.findFirst({
      where: { question: faq.question },
    });
    if (!existing) {
      await prisma.faqItem.create({ data: faq });
    }
  }
  console.log('✅ SSS maddeleri eklendi.');

  // 4. KATEGORİLER VE ALT KATEGORİLER
  console.log('📂 Kategoriler ve alt kategoriler oluşturuluyor...');
  const categoriesData = [
    {
      slug: 'protein',
      name: 'Protein',
      subCategories: [
        { slug: 'whey', name: 'Whey Protein' },
        { slug: 'isolate', name: 'İzole Protein' },
        { slug: 'pea', name: 'Bitkisel Protein' },
        { slug: 'casein', name: 'Kazein' },
        { slug: 'egg', name: 'Yumurta Proteini' },
        { slug: 'milk', name: 'Süt Proteini' },
        { slug: 'soya', name: 'Soya Proteini' },
        { slug: 'gainer', name: 'Kilo & Hacim Gainer' },
      ],
    },
    {
      slug: 'vitamin',
      name: 'Vitamin & Sağlık',
      subCategories: [
        { slug: 'multivitamin', name: 'Multivitamin' },
        { slug: 'mineral', name: 'Mineraller' },
      ],
    },
    {
      slug: 'performans',
      name: 'Performans & Güç',
      subCategories: [
        { slug: 'kreatin', name: 'Kreatin' },
        { slug: 'pre-workout', name: 'Pre-Workout' },
        { slug: 'fitness', name: 'Fitness Paketleri' },
      ],
    },
    {
      slug: 'gida',
      name: 'Sağlıklı Gıda & Atıştırmalık',
      subCategories: [
        { slug: 'bar', name: 'Protein Barlar' },
        { slug: 'rice-cream', name: 'Pirinç Kreması' },
        { slug: 'kahve', name: 'Fonksiyonel Kahve' },
      ],
    },
  ];

  const categoryMap = new Map<string, string>(); // category slug -> id
  const subCategoryMap = new Map<string, string>(); // subCategory slug -> id

  for (const cat of categoriesData) {
    const category = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name },
      create: { slug: cat.slug, name: cat.name },
    });
    categoryMap.set(cat.slug, category.id);

    for (const sub of cat.subCategories) {
      const subCategory = await prisma.subCategory.upsert({
        where: {
          categoryId_slug: {
            categoryId: category.id,
            slug: sub.slug,
          },
        },
        update: { name: sub.name },
        create: {
          categoryId: category.id,
          slug: sub.slug,
          name: sub.name,
        },
      });
      subCategoryMap.set(sub.slug, subCategory.id);
    }
  }
  console.log('✅ Kategoriler ve alt kategoriler hazır.');

  // 5. KATALOG ÜRÜNLERİ VE VARYANTLARI (16 ÜRÜN)
  console.log('📦 Katalog ürünleri ve varyantları oluşturuluyor...');

  const productsData = [
    {
      slug: 'whey-protein',
      name: 'WHEY PROTEIN',
      shortExplanation: 'EN ÇOK TERCİH EDİLEN PROTEİN TAKVİYESİ',
      categorySlug: 'protein',
      subCategorySlug: 'whey',
      isBestSeller: true,
      bestSellerRank: 1,
      commentCount: 10880,
      averageStar: 5,
      tags: ['PROTEİN', 'WHEY', 'KAS GELİŞİMİ', 'GLUTENSİZ'],
      usage:
        '1 ölçek (30g) ürünü 200-250 ml soğuk su veya süt ile karıştırınız. Antrenmandan hemen sonra veya gün içinde protein ihtiyacınıza göre 1-2 servis tüketebilirsiniz.',
      features:
        'Yüksek protein içeriği (24g/servis)\nKolay karışan mikro filtre formül\nZengin BCAA ve Glutamin öncüleri\nGluten içermez\nDüşük şeker ve yağ oranı',
      description:
        'OJS Nutrition Whey Protein, en yüksek kalite standartlarında üretilmiş konsantre ve izole peynir altı suyu proteinidir. Kas kütlesinin artışına ve korunmasına katkıda bulunur.',
      nutritionalContent: {
        ingredients: [
          { aroma: 'Bisküvi', value: 'Peynir Altı Suyu Konsantresi, Bisküvi Aroması, Ksantan Gam, Sukraloz.' },
          { aroma: 'Çikolata', value: 'Peynir Altı Suyu Konsantresi, Kakao Tozu, Çikolata Aroması, Sukraloz.' },
          { aroma: 'Muz', value: 'Peynir Altı Suyu Konsantresi, Doğal Muz Aroması, Beta Karoten, Sukraloz.' },
          { aroma: 'Çilek', value: 'Peynir Altı Suyu Konsantresi, Çilek Aroması, Pancar Kökü Kırmızısı, Sukraloz.' },
          { aroma: 'Salted Caramel', value: 'Peynir Altı Suyu Konsantresi, Karamel Aroması, Deniz Tuzu, Sukraloz.' },
        ],
        nutrition_facts: {
          ingredients: [
            { name: 'Enerji', amounts: ['120 kcal', '502 kJ'] },
            { name: 'Yağ', amounts: ['1.5 g', '0.9 g Doymuş'] },
            { name: 'Karbonhidrat', amounts: ['2.5 g', '1.2 g Şeker'] },
            { name: 'Protein', amounts: ['24.0 g', '80%'] },
            { name: 'Tuz', amounts: ['0.15 g', '0.06 g Sodyum'] },
          ],
          portion_sizes: ['30 g (1 Ölçek)', '100 g'],
        },
        amino_acid_facts: {
          ingredients: [
            { name: 'L-Leucine (BCAA)', amounts: ['2.6 g'] },
            { name: 'L-Isoleucine (BCAA)', amounts: ['1.4 g'] },
            { name: 'L-Valine (BCAA)', amounts: ['1.3 g'] },
            { name: 'L-Glutamine', amounts: ['4.2 g'] },
          ],
          portion_sizes: ['30 g Servis Başına'],
        },
      },
      variants: [
        {
          gram: 400,
          pieces: 1,
          totalServings: 16,
          aroma: 'Bisküvi',
          totalPrice: 549,
          discountedPrice: null,
          pricePerServing: 34.31,
          photoSrc: 'media/products/whey-protein-biscuit-400g.jpg',
        },
        {
          gram: 1600,
          pieces: 1,
          totalServings: 64,
          aroma: 'Bisküvi',
          totalPrice: 2196,
          discountedPrice: 1899,
          pricePerServing: 29.67,
          photoSrc: 'media/products/whey-protein-biscuit-1600g.jpg',
        },
        {
          gram: 400,
          pieces: 1,
          totalServings: 16,
          aroma: 'Çikolata',
          totalPrice: 549,
          discountedPrice: null,
          pricePerServing: 34.31,
          photoSrc: 'media/products/whey-protein-chocolate-400g.jpg',
        },
        {
          gram: 1600,
          pieces: 1,
          totalServings: 64,
          aroma: 'Çikolata',
          totalPrice: 2196,
          discountedPrice: 1899,
          pricePerServing: 29.67,
          photoSrc: 'media/products/whey-protein-chocolate-1600g.jpg',
        },
        {
          gram: 400,
          pieces: 1,
          totalServings: 16,
          aroma: 'Muz',
          totalPrice: 549,
          discountedPrice: null,
          pricePerServing: 34.31,
          photoSrc: 'media/products/whey-protein-banana-400g.jpg',
        },
        {
          gram: 400,
          pieces: 1,
          totalServings: 16,
          aroma: 'Çilek',
          totalPrice: 549,
          discountedPrice: null,
          pricePerServing: 34.31,
          photoSrc: 'media/products/whey-protein-strawberry-400g.jpg',
        },
      ],
    },
    {
      slug: 'whey-isolate',
      name: 'WHEY ISOLATE',
      shortExplanation: 'EN YÜKSEK SAF PROTEİN ORANI',
      categorySlug: 'protein',
      subCategorySlug: 'isolate',
      isBestSeller: false,
      bestSellerRank: null,
      commentCount: 8450,
      averageStar: 5,
      tags: ['PROTEİN', 'İZOLAT', 'SAF KAS', 'SIFIR ŞEKER'],
      usage: '1 ölçek (25g) ürünü 200 ml soğuk su ile karıştırarak antrenman sonrasında tüketiniz.',
      features: '%90+ saf protein oranı\nSıfıra yakın laktoz ve yağ\nUltra hızlı sindirim\nGluten içermez',
      description: 'Cross-flow mikro filtrasyon teknolojisi ile üretilmiş en saf formdaki izole peynir altı suyu proteini.',
      nutritionalContent: {
        ingredients: [{ aroma: 'Çikolata', value: 'İzole Peynir Altı Suyu Proteini (Süt), Doğal Kakao, Sukraloz.' }],
        nutrition_facts: {
          ingredients: [
            { name: 'Enerji', amounts: ['105 kcal'] },
            { name: 'Protein', amounts: ['23.5 g'] },
            { name: 'Yağ', amounts: ['0.2 g'] },
          ],
          portion_sizes: ['25 g (1 Ölçek)'],
        },
        amino_acid_facts: {
          ingredients: [{ name: 'BCAA', amounts: ['6.1 g'] }],
          portion_sizes: ['25 g'],
        },
      },
      variants: [
        {
          gram: 500,
          pieces: 1,
          totalServings: 20,
          aroma: 'Çikolata',
          totalPrice: 749,
          discountedPrice: null,
          pricePerServing: 37.45,
          photoSrc: 'media/products/whey-isolate-500g.jpg',
        },
      ],
    },
    {
      slug: 'fitness-paketi',
      name: 'FITNESS PAKETİ',
      shortExplanation: 'EN POPÜLER ÜRÜNLER BİR ARADA',
      categorySlug: 'performans',
      subCategorySlug: 'fitness',
      isBestSeller: true,
      bestSellerRank: 2,
      commentCount: 7650,
      averageStar: 5,
      tags: ['PAKET', 'FITNESS', 'EKONOMİK', 'KOMBİNASYON'],
      usage: 'Paket içeriğindeki ürünleri kendi servis talimatlarına uygun olarak tüketiniz.',
      features: 'Komple sporcu destek paketi\n%29 avantajlı paket fiyatı\nWhey Protein + Creatine + Shaker',
      description: 'Fitness yolculuğunuza güçlü bir başlangıç yapmanız için en popüler ürünleri bir araya getirdik.',
      nutritionalContent: {
        ingredients: [{ aroma: 'Standart', value: 'Whey Protein 1.6kg, Creatine 300g, Shaker.' }],
        nutrition_facts: {
          ingredients: [{ name: 'Protein', amounts: ['24 g / servis'] }],
          portion_sizes: ['Kombinasyon'],
        },
        amino_acid_facts: {
          ingredients: [{ name: 'BCAA', amounts: ['8.5 g'] }],
          portion_sizes: ['Servis Başına'],
        },
      },
      variants: [
        {
          gram: 2200,
          pieces: 3,
          totalServings: 90,
          aroma: 'Bisküvi + Karışık',
          totalPrice: 1126,
          discountedPrice: 799,
          pricePerServing: 8.87,
          photoSrc: 'media/products/fitness-paketi.png',
        },
      ],
    },
    {
      slug: 'pea-protein',
      name: 'PEA PROTEIN (BEZELYE PROTEİNİ)',
      shortExplanation: '%100 BİTKİSEL PROTEİN',
      categorySlug: 'protein',
      subCategorySlug: 'pea',
      isBestSeller: false,
      bestSellerRank: null,
      commentCount: 3240,
      averageStar: 5,
      tags: ['VEGAN', 'BİTKİSEL', 'BEZELYE', 'LAKTOZSUZ'],
      usage: '1 ölçek (30g) ürünü 300 ml su veya bitkisel süt ile karıştırınız.',
      features: '%100 Vegan formül\nYüksek lif içeriği\nKolay sindirilebilir',
      description: 'Sarı bezelyeden elde edilen saf bitkisel protein tozu.',
      nutritionalContent: {
        ingredients: [{ aroma: 'Doğal', value: 'Bezelye Proteini İzolatı.' }],
        nutrition_facts: {
          ingredients: [{ name: 'Protein', amounts: ['24 g'] }],
          portion_sizes: ['30 g'],
        },
        amino_acid_facts: {
          ingredients: [{ name: 'Arjinin', amounts: ['2.1 g'] }],
          portion_sizes: ['30 g'],
        },
      },
      variants: [
        {
          gram: 400,
          pieces: 1,
          totalServings: 13,
          aroma: 'Doğal',
          totalPrice: 399,
          discountedPrice: null,
          pricePerServing: 30.69,
          photoSrc: 'media/products/pea-protein.jpg',
        },
      ],
    },
    {
      slug: 'micellar-casein',
      name: 'MICELLAR CASEIN',
      shortExplanation: 'YAVAŞ SİNDİRİLEN GECE PROTEİNİ',
      categorySlug: 'protein',
      subCategorySlug: 'casein',
      isBestSeller: false,
      bestSellerRank: null,
      commentCount: 4150,
      averageStar: 5,
      tags: ['KAZEİN', 'GECE PROTEİNİ', 'UZUN EMİLİM'],
      usage: 'Gece yatmadan önce 1 ölçek (30g) ürünü su ile karıştırarak tüketiniz.',
      features: '7-8 saat süren amino asit salınımı\nAnti-katabolik koruma',
      description: 'Kaslarınızı uyku boyunca besleyen misellar kazein proteini.',
      nutritionalContent: {
        ingredients: [{ aroma: 'Vanilya', value: 'Misellar Kazein (Süt), Aroma, Sukraloz.' }],
        nutrition_facts: {
          ingredients: [{ name: 'Protein', amounts: ['23 g'] }],
          portion_sizes: ['30 g'],
        },
        amino_acid_facts: {
          ingredients: [{ name: 'Glutamin', amounts: ['4.5 g'] }],
          portion_sizes: ['30 g'],
        },
      },
      variants: [
        {
          gram: 700,
          pieces: 1,
          totalServings: 23,
          aroma: 'Vanilya',
          totalPrice: 599,
          discountedPrice: null,
          pricePerServing: 26.04,
          photoSrc: 'media/products/micellar-casein.jpg',
        },
      ],
    },
    {
      slug: 'egg-white-powder',
      name: 'EGG WHITE POWDER',
      shortExplanation: 'YÜKSEK BİYOYARARLANIMLI YUMURTA AKI',
      categorySlug: 'protein',
      subCategorySlug: 'egg',
      isBestSeller: false,
      bestSellerRank: null,
      commentCount: 2890,
      averageStar: 5,
      tags: ['YUMURTA', 'EGG WHITE', 'LAKTOZSUZ'],
      usage: '1 ölçek tozu su veya tariflerinize ekleyerek tüketebilirsiniz.',
      features: 'Tam yumurta akı proteini\nSıfır yağ ve kolesterol',
      description: 'Pasteurize edilmiş yumurta beyazından üretilen yüksek kaliteli protein tozu.',
      nutritionalContent: {
        ingredients: [{ aroma: 'Doğal', value: 'Yumurta Beyazı Tozu.' }],
        nutrition_facts: {
          ingredients: [{ name: 'Protein', amounts: ['25 g'] }],
          portion_sizes: ['30 g'],
        },
        amino_acid_facts: {
          ingredients: [{ name: 'BCAA', amounts: ['5.3 g'] }],
          portion_sizes: ['30 g'],
        },
      },
      variants: [
        {
          gram: 500,
          pieces: 1,
          totalServings: 16,
          aroma: 'Doğal',
          totalPrice: 479,
          discountedPrice: null,
          pricePerServing: 29.93,
          photoSrc: 'media/products/egg-white.jpg',
        },
      ],
    },
    {
      slug: 'milk-protein',
      name: 'MILK PROTEIN (SÜT PROTEİNİ)',
      shortExplanation: '%80 KAZEİN, %20 WHEY PROTEİN',
      categorySlug: 'protein',
      subCategorySlug: 'milk',
      isBestSeller: false,
      bestSellerRank: null,
      commentCount: 1980,
      averageStar: 5,
      tags: ['SÜT PROTEİNİ', 'DENGELİ EMİLİM'],
      usage: 'Öğün aralarında 1 ölçek su ile tüketiniz.',
      features: 'Doğal süt oranı: %80 Kazein + %20 Whey\nKoyu kıvam ve tokluk hissi',
      description: 'Filtrelenmiş sütten elde edilen dengeli protein kaynağı.',
      nutritionalContent: {
        ingredients: [{ aroma: 'Çikolata', value: 'Süt Proteini Konsantresi, Kakao, Sukraloz.' }],
        nutrition_facts: {
          ingredients: [{ name: 'Protein', amounts: ['24 g'] }],
          portion_sizes: ['30 g'],
        },
        amino_acid_facts: {
          ingredients: [{ name: 'BCAA', amounts: ['4.8 g'] }],
          portion_sizes: ['30 g'],
        },
      },
      variants: [
        {
          gram: 600,
          pieces: 1,
          totalServings: 20,
          aroma: 'Çikolata',
          totalPrice: 529,
          discountedPrice: null,
          pricePerServing: 26.45,
          photoSrc: 'media/products/milk-protein.png',
        },
      ],
    },
    {
      slug: 'soya-protein',
      name: 'SOYA PROTEIN',
      shortExplanation: 'ZENGİN AMİNO ASİT PROFİLLİ BİTKİSEL PROTEİN',
      categorySlug: 'protein',
      subCategorySlug: 'soya',
      isBestSeller: false,
      bestSellerRank: null,
      commentCount: 1750,
      averageStar: 4.8,
      tags: ['SOYA', 'VEGAN', 'BİTKİSEL'],
      usage: '1 ölçek su ile karıştırarak tüketiniz.',
      features: 'Komple amino asit profili\nKolesterol içermez',
      description: 'GDO içermeyen soyadan elde edilen saf izole bitkisel protein.',
      nutritionalContent: {
        ingredients: [{ aroma: 'Doğal', value: 'Soya Proteini İzolatı.' }],
        nutrition_facts: {
          ingredients: [{ name: 'Protein', amounts: ['26 g'] }],
          portion_sizes: ['30 g'],
        },
        amino_acid_facts: {
          ingredients: [{ name: 'Glutamin', amounts: ['5.0 g'] }],
          portion_sizes: ['30 g'],
        },
      },
      variants: [
        {
          gram: 500,
          pieces: 1,
          totalServings: 16,
          aroma: 'Doğal',
          totalPrice: 369,
          discountedPrice: null,
          pricePerServing: 23.06,
          photoSrc: 'media/products/soya-protein.png',
        },
      ],
    },
    {
      slug: 'protein-bar-2li',
      name: "PROTEİN BAR 2'Lİ",
      shortExplanation: 'PRATİK VE YÜKSEK PROTEİNLİ ATIŞTIRMALIK',
      categorySlug: 'gida',
      subCategorySlug: 'bar',
      isBestSeller: false,
      bestSellerRank: null,
      commentCount: 4890,
      averageStar: 5,
      tags: ['BAR', 'ATIŞTIRMALIK', 'PRATİK PROTEİN'],
      usage: 'Gün içinde ara öğün olarak veya antrenman öncesi/sonrası tüketebilirsiniz.',
      features: '20g Protein / Bar\nİlave şeker içermez\nYüksek lif',
      description: 'Lezzetli ve pratik protein bar ikilisi.',
      nutritionalContent: {
        ingredients: [{ aroma: 'Karamel Fıstık', value: 'Süt Proteini, Çikolata Kaplama, Fıstık, Sukraloz.' }],
        nutrition_facts: {
          ingredients: [
            { name: 'Protein', amounts: ['20 g'] },
            { name: 'Lif', amounts: ['8 g'] },
          ],
          portion_sizes: ['60 g Bar'],
        },
        amino_acid_facts: {
          ingredients: [],
          portion_sizes: [],
        },
      },
      variants: [
        {
          gram: 120,
          pieces: 2,
          totalServings: 2,
          aroma: 'Karamel Fıstık',
          totalPrice: 119,
          discountedPrice: 99,
          pricePerServing: 49.5,
          photoSrc: 'media/products/protein-bar-2-li.png',
        },
      ],
    },
    {
      slug: 'mass-gainer',
      name: 'MASS GAINER',
      shortExplanation: 'YÜKSEK KALORİ VE KARBONHİDRAT TOZU',
      categorySlug: 'protein',
      subCategorySlug: 'gainer',
      isBestSeller: false,
      bestSellerRank: null,
      commentCount: 6320,
      averageStar: 5,
      tags: ['GAINER', 'HACİM', 'KİLO ALDIRICI', 'KARBONHİDRAT'],
      usage: '2 ölçek (100g) ürünü 400ml süt veya su ile günde 1-2 kez tüketiniz.',
      features: 'Kompleks karbonhidrat + Whey Protein\nYüksek kalori formülü\nVitamin ve mineral takviyeli',
      description: 'Kilo alma ve hacim kazanma dönemlerinde kalori açığını kapatmak için özel formül.',
      nutritionalContent: {
        ingredients: [{ aroma: 'Çikolata', value: 'Maltodekstrin, Yulaf Unu, Whey Protein Konsantresi, Kakao, Vitamin Karışımı.' }],
        nutrition_facts: {
          ingredients: [
            { name: 'Kalori', amounts: ['385 kcal'] },
            { name: 'Karbonhidrat', amounts: ['70 g'] },
            { name: 'Protein', amounts: ['20 g'] },
          ],
          portion_sizes: ['100 g Servis'],
        },
        amino_acid_facts: {
          ingredients: [],
          portion_sizes: [],
        },
      },
      variants: [
        {
          gram: 3000,
          pieces: 1,
          totalServings: 30,
          aroma: 'Çikolata',
          totalPrice: 649,
          discountedPrice: null,
          pricePerServing: 21.63,
          photoSrc: 'media/products/mass-gainer.png',
        },
      ],
    },
    {
      slug: 'gunluk-vitamin-paketi',
      name: 'GÜNLÜK VİTAMİN PAKETİ',
      shortExplanation: 'EN SIK TÜKETİLEN TAKVİYELER',
      categorySlug: 'vitamin',
      subCategorySlug: 'multivitamin',
      isBestSeller: true,
      bestSellerRank: 3,
      commentCount: 5013,
      averageStar: 5,
      tags: ['VİTAMİN', 'BAĞIŞIKLIK', 'SAĞLIK', 'GÜNLÜK'],
      usage: 'Günde 2 kapsülü sabah veya öğle yemeğinden sonra bol su ile alınız.',
      features: '24 temel vitamin ve mineral\nBağışıklık sistemini destekler\nKolay yutulabilir kapsül',
      description: 'Yoğun antrenman ve tempolu yaşamda vücudun ihtiyaç duyduğu tüm mikro besin öğelerini karşılar.',
      nutritionalContent: {
        ingredients: [{ aroma: 'Kapsül', value: 'Vitamin A, C, D3, E, B-Kompleks, Çinko, Magnezyum, Selenyum.' }],
        nutrition_facts: {
          ingredients: [
            { name: 'C Vitamini', amounts: ['250 mg'] },
            { name: 'D3 Vitamini', amounts: ['1000 IU'] },
            { name: 'Çinko', amounts: ['15 mg'] },
          ],
          portion_sizes: ['2 Kapsül'],
        },
        amino_acid_facts: {
          ingredients: [],
          portion_sizes: [],
        },
      },
      variants: [
        {
          gram: 120,
          pieces: 60,
          totalServings: 30,
          aroma: 'Kapsül',
          totalPrice: 747,
          discountedPrice: 549,
          pricePerServing: 18.3,
          photoSrc: 'media/products/gunluk-vitamin-paketi.png',
        },
      ],
    },
    {
      slug: 'pre-workout-supreme',
      name: 'PRE-WORKOUT SUPREME',
      shortExplanation: 'ANTRENMAN ÖNCESİ TAKVİYE',
      categorySlug: 'performans',
      subCategorySlug: 'pre-workout',
      isBestSeller: true,
      bestSellerRank: 4,
      commentCount: 6738,
      averageStar: 5,
      tags: ['PRE-WORKOUT', 'GÜÇ', 'ODAKLANMA', 'KAFEİN'],
      usage: 'Antrenmandan 20-30 dakika önce 1 ölçek (10g) ürünü 250ml soğuk su ile içiniz.',
      features: '300mg Kafein & 3.2g Beta-Alanin\n6g L-Citrulline Malat ile maksimum pompa\nYüksek odaklanma\nŞeker içermez',
      description: 'Zorlu antrenmanlarda sınırlarınızı zorlamanız için patlayıcı antrenman öncesi takviye.',
      nutritionalContent: {
        ingredients: [{ aroma: 'Ekşi Elma', value: 'L-Citrulline, Beta Alanin, Kafein, Taurin, Malik Asit, Sukraloz.' }],
        nutrition_facts: {
          ingredients: [
            { name: 'L-Citrulline', amounts: ['6000 mg'] },
            { name: 'Beta-Alanin', amounts: ['3200 mg'] },
            { name: 'Kafein', amounts: ['300 mg'] },
          ],
          portion_sizes: ['10 g'],
        },
        amino_acid_facts: {
          ingredients: [],
          portion_sizes: [],
        },
      },
      variants: [
        {
          gram: 300,
          pieces: 1,
          totalServings: 30,
          aroma: 'Ekşi Elma',
          totalPrice: 399,
          discountedPrice: null,
          pricePerServing: 13.3,
          photoSrc: 'media/products/preworkout.png',
        },
      ],
    },
    {
      slug: 'cream-of-rice',
      name: 'CREAM OF RICE',
      shortExplanation: 'EN LEZZETLİ PİRİNÇ KREMASI',
      categorySlug: 'gida',
      subCategorySlug: 'rice-cream',
      isBestSeller: true,
      bestSellerRank: 5,
      commentCount: 5216,
      averageStar: 5,
      tags: ['PİRİNÇ KREMASI', 'TEMİZ KARBONHİDRAT', 'KOLAY SİNDİRİM'],
      usage: '1 porsiyon (50g) tozu 150-200ml kaynar su veya süt ile karıştırıp 1-2 dakika dinlendiriniz.',
      features: 'Hızlı ve kolay sindirilen karbonhidrat kaynağı\nGluten içermez\nLezzetli ve pratik',
      description: 'Sporcular için harika bir antrenman öncesi veya sonrası temiz karbonhidrat öğünü.',
      nutritionalContent: {
        ingredients: [{ aroma: 'Bisküvi', value: 'Öğütülmüş Pirinç Unu, Aroma, Sukraloz.' }],
        nutrition_facts: {
          ingredients: [
            { name: 'Karbonhidrat', amounts: ['40 g'] },
            { name: 'Şeker', amounts: ['0.1 g'] },
            { name: 'Protein', amounts: ['3.8 g'] },
          ],
          portion_sizes: ['50 g Servis'],
        },
        amino_acid_facts: {
          ingredients: [],
          portion_sizes: [],
        },
      },
      variants: [
        {
          gram: 1000,
          pieces: 1,
          totalServings: 20,
          aroma: 'Bisküvi',
          totalPrice: 239,
          discountedPrice: null,
          pricePerServing: 11.95,
          photoSrc: 'media/products/rice-of-cream.png',
        },
      ],
    },
    {
      slug: 'creatine',
      name: 'CREATINE',
      shortExplanation: 'EN POPÜLER SPORCU TAKVİYESİ',
      categorySlug: 'performans',
      subCategorySlug: 'kreatin',
      isBestSeller: true,
      bestSellerRank: 6,
      commentCount: 8558,
      averageStar: 5,
      tags: ['KREATİN', 'GÜÇ', 'KAS', 'MONOHİDRAT'],
      usage: 'Günde 1 ölçek (5g) ürünü 200 ml su veya meyve suyu ile karıştırarak içiniz.',
      features: '%100 Saf Mikronize Kreatin Monohidrat\nPatlayıcı kuvvet ve kas hacmi\nAromasız, her içeceğe karışır',
      description: 'Dünya çapında en çok araştırılmış ve etkinliği kanıtlanmış sporcu gıdası takviyesi.',
      nutritionalContent: {
        ingredients: [{ aroma: 'Aromasız', value: 'Mikronize Kreatin Monohidrat (200 Mesh).' }],
        nutrition_facts: {
          ingredients: [{ name: 'Kreatin Monohidrat', amounts: ['5000 mg'] }],
          portion_sizes: ['5 g Servis'],
        },
        amino_acid_facts: {
          ingredients: [],
          portion_sizes: [],
        },
      },
      variants: [
        {
          gram: 300,
          pieces: 1,
          totalServings: 60,
          aroma: 'Aromasız',
          totalPrice: 239,
          discountedPrice: null,
          pricePerServing: 3.98,
          photoSrc: 'media/products/creatine.png',
        },
      ],
    },
    {
      slug: 'collagen-coffee',
      name: 'COLLAGEN COFFEE',
      shortExplanation: 'TİP 1 VE TİP 3 KOLAJEN İÇEREN KAHVE',
      categorySlug: 'gida',
      subCategorySlug: 'kahve',
      isBestSeller: false,
      bestSellerRank: null,
      commentCount: 2450,
      averageStar: 5,
      tags: ['KOLAJEN', 'KAHVE', 'CİLT SAĞLIĞI', 'EKLEM'],
      usage: '1 tatlı kaşığı (10g) ürünü sıcak suya ekleyerek karıştırınız.',
      features: '5000mg Hidrolize Peptit Kolajen / Servis\nPremium Granül Kahve\nŞeker ilavesiz',
      description: 'Sabah kahvenizi cildinize, saçlarınıza ve eklemlerinize faydalı kolajen takviyesi ile birleştirin.',
      nutritionalContent: {
        ingredients: [{ aroma: 'Klasik Kahve', value: 'Hidrolize Kolajen Peptitleri, Çözünebilir Kahve.' }],
        nutrition_facts: {
          ingredients: [
            { name: 'Kolajen Peptit', amounts: ['5000 mg'] },
            { name: 'Protein', amounts: ['4.6 g'] },
          ],
          portion_sizes: ['10 g'],
        },
        amino_acid_facts: {
          ingredients: [],
          portion_sizes: [],
        },
      },
      variants: [
        {
          gram: 200,
          pieces: 1,
          totalServings: 20,
          aroma: 'Klasik Kahve',
          totalPrice: 349,
          discountedPrice: null,
          pricePerServing: 17.45,
          photoSrc: 'media/products/collagen-coffe.png',
        },
      ],
    },
    {
      slug: 'protein-bar',
      name: 'PROTEİN BAR',
      shortExplanation: 'TEKLİ PROTEİN BAR ATIŞTIRMALIK',
      categorySlug: 'gida',
      subCategorySlug: 'bar',
      isBestSeller: false,
      bestSellerRank: null,
      commentCount: 3120,
      averageStar: 4.9,
      tags: ['BAR', 'ATIŞTIRMALIK', 'PROTEİN'],
      usage: 'İstediğiniz an pratik ara öğün olarak tüketebilirsiniz.',
      features: '15g Protein\nDüşük kalori ve yüksek lif',
      description: 'Çantanızda kolayca taşıyabileceğiniz tekli lezzetli protein bar.',
      nutritionalContent: {
        ingredients: [{ aroma: 'Çikolata Fındık', value: 'Süt Proteini, Kakao, Fındık Parçaları, Sukraloz.' }],
        nutrition_facts: {
          ingredients: [
            { name: 'Protein', amounts: ['15 g'] },
            { name: 'Kalori', amounts: ['180 kcal'] },
          ],
          portion_sizes: ['50 g'],
        },
        amino_acid_facts: {
          ingredients: [],
          portion_sizes: [],
        },
      },
      variants: [
        {
          gram: 50,
          pieces: 1,
          totalServings: 1,
          aroma: 'Çikolata Fındık',
          totalPrice: 59,
          discountedPrice: null,
          pricePerServing: 59.0,
          photoSrc: 'media/products/protein-bar.png',
        },
      ],
    },
  ];

  for (const item of productsData) {
    const categoryId = categoryMap.get(item.categorySlug);
    const subCategoryId = subCategoryMap.get(item.subCategorySlug);

    if (!categoryId || !subCategoryId) {
      console.warn(`Uyarı: Kategori bulunamadı (${item.categorySlug}/${item.subCategorySlug})!`);
      continue;
    }

    const product = await prisma.product.upsert({
      where: { slug: item.slug },
      update: {
        name: item.name,
        shortExplanation: item.shortExplanation,
        usage: item.usage,
        features: item.features,
        description: item.description,
        nutritionalContent: item.nutritionalContent,
        tags: item.tags,
        mainCategoryId: categoryId,
        subCategoryId: subCategoryId,
        isBestSeller: item.isBestSeller,
        bestSellerRank: item.bestSellerRank,
        commentCount: item.commentCount,
        averageStar: item.averageStar,
      },
      create: {
        slug: item.slug,
        name: item.name,
        shortExplanation: item.shortExplanation,
        usage: item.usage,
        features: item.features,
        description: item.description,
        nutritionalContent: item.nutritionalContent,
        tags: item.tags,
        mainCategoryId: categoryId,
        subCategoryId: subCategoryId,
        isBestSeller: item.isBestSeller,
        bestSellerRank: item.bestSellerRank,
        commentCount: item.commentCount,
        averageStar: item.averageStar,
      },
    });

    // Varyantlar
    for (const v of item.variants) {
      // Varyantı bul veya oluştur (aroma ve gram bazında)
      const existingVariant = await prisma.productVariant.findFirst({
        where: {
          productId: product.id,
          aroma: v.aroma,
          gram: v.gram,
        },
      });

      if (existingVariant) {
        await prisma.productVariant.update({
          where: { id: existingVariant.id },
          data: {
            pieces: v.pieces,
            totalServings: v.totalServings,
            totalPrice: v.totalPrice,
            discountedPrice: v.discountedPrice,
            pricePerServing: v.pricePerServing,
            photoSrc: v.photoSrc,
            stockQuantity: 100,
            isAvailable: true,
          },
        });
      } else {
        await prisma.productVariant.create({
          data: {
            productId: product.id,
            aroma: v.aroma,
            gram: v.gram,
            pieces: v.pieces,
            totalServings: v.totalServings,
            totalPrice: v.totalPrice,
            discountedPrice: v.discountedPrice,
            pricePerServing: v.pricePerServing,
            photoSrc: v.photoSrc,
            stockQuantity: 100,
            isAvailable: true,
          },
        });
      }
    }
  }

  console.log(`✅ ${productsData.length} ürün ve varyantları başarıyla oluşturuldu/güncellendi.`);
  console.log('🎉 Seed işlemi başarıyla tamamlandı!');
}

main()
  .catch((error) => {
    console.error('❌ Seed sırasında hata oluştu:', error);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
