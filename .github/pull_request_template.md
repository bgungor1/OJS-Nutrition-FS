## 📌 Açıklama (Description)
Bu PR neyi değiştiriyor veya hangi özelliği ekliyor? Arka plan bağlamı ve motivasyonu kısaca açıklayınız.

---

## 🏷️ Değişiklik Türü (Type of Change)
- [ ] `feat`: Yeni bir özellik
- [ ] `fix`: Bir hata düzeltmesi
- [ ] `refactor`: İşlevselliği değiştirmeyen kod iyileştirmesi
- [ ] `docs`: Dokümantasyon güncellemesi
- [ ] `test`: Test ekleme veya güncelleme
- [ ] `chore`: Bağımlılık, CI/CD veya yapılandırma değişikliği

---

## 🎯 İlgili Modül / Faz
- **Faz:** Faz 1 / Faz 2 / Faz 3 / Faz 4 / Faz 5
- **İlgili Adım:** (Örn: Adım 1.2: Katalog & Ürünler Modülü)

---

## 🛡️ Mühendislik Standartları Kontrol Listesi (Review Checklist)
Lütfen bu PR'ı açmadan önce [ENGINEERING_STANDARDS.md](../ENGINEERING_STANDARDS.md) kurallarına göre aşağıdaki maddeleri kontrol ediniz:

### Backend & Veritabanı
- [ ] Response zarfı `ResponseInterceptor` üzerinden mi dönüyor? (Controller elle sarmamalıdır)
- [ ] Tüm request gövdeleri `class-validator` decorator'larına sahip bir DTO ile doğrulanıyor mu?
- [ ] N+1 sorgu kontrol edildi mi? (Döngü içinde `await prisma.*` sorgusu olmamalıdır)
- [ ] Liste endpoint'lerinde sayfalama zorunlu tutuldu mu? (`limit` / `offset` / `cursor`)
- [ ] Sorgularda hassas veya gereksiz alanlar (`passwordHash` vb.) `select` ile dışlandı mı?
- [ ] Backend servisi tek bir domain'e mi odaklanıyor? (God-service anti-pattern'i önlendi mi?)
- [ ] Yeni veya değişen endpoint'ler Swagger decorator'ları (`@ApiOperation`, `@ApiResponse`) ile dokümante edildi mi?

### Güvenlik (Security)
- [ ] Authentication ve Authorization (IDOR) ayrı ayrı kontrol edildi mi?
- [ ] Log satırlarında şifre, token, kart bilgisi veya PII sızıntısı var mı?
- [ ] Dinamik sıralama/filtreleme parametreleri DTO seviyesinde açık bir whitelist (`@IsIn`) ile kısıtlandı mı?
- [ ] Sessizce yutulan hata (`catch {}` / sessiz mock fallback) var mı? Hatalar yüzeye çıkarılıyor mu?

### Kod Kalitesi & Standartlar
- [ ] TypeScript strict mode kurallarına uyuldu mu? (`any` kullanımı yasaktır, gereksiz `as` cast'i yapılmadı)
- [ ] Kullanılmayan import, değişken veya ölü kod temizlendi mi?
- [ ] Commit mesajları ve PR başlığı **Conventional Commits** formatına uyuyor mu?

### Frontend & Test Standartları
- [ ] Yeni pure utility veya Zod şeması için `*.test.ts` eklendi mi?
- [ ] Yeni interaktif UI bileşenleri için `*.test.tsx` (RTL, `getByRole` öncelikli) eklendi mi?
- [ ] Testlerde kırılgan snapshot veya `getByTestId` kirliliğinden kaçınıldı mı?
- [ ] Frontend bileşenleri ~150 satır sınırını aşıyor mu? (Aşıyorsa mantıklı alt bileşenlere bölündü mü?)

---

## 🧪 Nasıl Doğrulandı? (Verification)
- [ ] `pnpm --filter api run lint` başarıyla geçti.
- [ ] `pnpm --filter api run build` (TypeScript derlemesi) hatasız tamamlandı.
- [ ] `pnpm --filter api run test` (Backend birim testleri) yeşil yandı.
- [ ] `pnpm --filter web run lint` (Frontend lint) 0 hata ile geçti.
- [ ] `pnpm --filter web run typecheck` (Frontend typecheck) 0 hata ile geçti.
- [ ] `pnpm --filter web run test` (Frontend Vitest birim/bileşen testleri) yeşil yandı.
- [ ] `pnpm --filter web run build` (Next.js üretim derlemesi) hatasız tamamlandı.
- [ ] Yerel manuel testler gerçekleştirildi (Swagger / cURL / Tarayıcı).
