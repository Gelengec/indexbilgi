# INDEXBİLGİ – Kurumsal Teknoloji E-Ticaret Platformu

INDEXBİLGİ (indexbilgi.com) için geliştirilmiş tam kapsamlı e-ticaret uygulaması. Bilgisayar donanımı, barkod otomasyon, POS sistemleri, ticari yazılım, yazıcı ve güvenlik kamerası ürünlerinin satışına yöneliktir.

- **Teknoloji:** Next.js 15 (App Router) + React 19 + TypeScript, Tailwind CSS, PostgreSQL, Prisma ORM
- **Dil / para birimi:** Türkçe, ₺ (TRY), Europe/Istanbul saat dilimi
- **Mimari:** Sunucu bileşenleri + Server Actions, JWT oturum çerezleri, rol tabanlı yetkilendirme, denetim kayıtları

## 1. Hızlı Başlangıç (Geliştirme)

Ön koşullar: Node.js 22+ ve PostgreSQL 15+.

```bash
cp .env.example .env
# .env içindeki DATABASE_URL, AUTH_SECRET ve SEED_* değerlerini düzenleyin

npm install
npx prisma migrate dev        # şemayı uygular
npm run db:seed               # roller, izinler, ayarlar, demo veri
npm run dev                   # http://localhost:3000
```

Yerel geliştirmede proje ile birlikte gelen gömülü PostgreSQL'i kullanmak için:

```bash
npm run db:local              # 5433 portunda yerel veritabanını başlatır
```

### Demo hesapları (seed sonrası)

| Rol | E-posta | Şifre |
| --- | --- | --- |
| Süper yönetici | `SEED_ADMIN_EMAIL` (varsayılan `admin@indexbilgi.com`) | `SEED_ADMIN_PASSWORD` |
| Demo müşteri | `ayse@example.com` | `Musteri!2026` |
| Demo bayi | `bayi@example.com` | `Bayi!2026` |

Yönetim paneli giriş adresi: `/admin/login`.

> Demo veri yalnızca `SEED_DEMO_DATA="true"` iken veya üretim dışı ortamda (değişken tanımsızken) yüklenir. Üretimde (`NODE_ENV=production`) varsayılan olarak **kapalıdır**; demo hesaplar canlıya taşınmaz. Süper yönetici yalnızca `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` tanımlıysa oluşturulur; üretimde şifre en az 12 karakter olmalıdır ve seed sonrası `SEED_ADMIN_PASSWORD` ortamdan kaldırılmalıdır (şifre hashli olarak saklanır, değiştirmek için paneldeki "Hesabım" ekranını kullanın).

## 2. Komutlar

| Komut | Açıklama |
| --- | --- |
| `npm run dev` | Geliştirme sunucusu |
| `npm run build` | Prisma client üretimi + üretim derlemesi |
| `npm start` | Üretim sunucusu (`APP_HOST`, varsayılan `127.0.0.1:3000`; üretimde yalnızca reverse proxy erişimi) |
| `npm run typecheck` | TypeScript tip kontrolü |
| `npm test` | Birim testleri (Excel eşleme/ayrıştırma, fiyat/KDV, stok, barkod, teklif, bayi fiyatı, rapor aralığı, yetkiler, form doğrulama) |
| `npm run check:prod` | Canlı ortam değişkeni/güvenlik ön kontrolü (`NODE_ENV=production` ile çalıştırın) |
| `npm run db:migrate` | Geliştirme migration'ı oluşturur/uygular |
| `npm run db:deploy` | Bekleyen migration'ları uygular (üretim) |
| `npm run db:seed` | Seed verisini çalıştırır |
| `npm run db:studio` | Prisma Studio |
| `npm run db:local` | Gömülü PostgreSQL'i başlatır |

## 3. Klasör Yapısı

```
prisma/                Prisma şeması, migration'lar, seed
scripts/local-db.mjs   Geliştirme için gömülü PostgreSQL
src/app/(site)/        Mağaza (ana sayfa, ürünler, sepet, ödeme, hesap, yardım, iletişim)
src/app/admin/         Yönetim paneli (/admin) ve giriş ekranı
src/app/actions/       Server Actions (sepet, sipariş, ödeme, admin işlemleri)
src/app/api/           API rotaları (görsel yükleme, ödeme callback, oturum)
src/components/admin/  Yönetim paneli bileşenleri
src/components/site/   Mağaza bileşenleri
src/lib/               Auth, sipariş, ödeme, e-posta, ayarlar, doğrulama, yardımcılar
public/uploads/        Yüklenen görseller (yazılabilir dizin)
tests/                 Node test runner ile birim testleri (npm test)
```

## 4. Veritabanı

Şema `prisma/schema.prisma` içindedir. Başlıca tablolar: `User`, `Role`, `Permission`, `RolePermission`, `Customer`, `CustomerGroup`, `CustomerProductPrice`, `Address`, `Category`, `Brand`, `Product`, `ProductImage`, `ProductVariant`, `ProductBarcode`, `StockMovement`, `Warehouse`, `WarehouseStock`, `StockTransfer`, `StockTransferItem`, `StockCount`, `StockCountItem`, `PriceList`, `ProductPrice`, `PriceHistory`, `PriceChangeRequest`, `ImportJob`, `Quote`, `QuoteItem`, `IntegrationSyncLog`, `Cart`, `CartItem`, `Order`, `OrderItem`, `OrderStatusHistory`, `Payment`, `Shipment`, `ShippingCarrier`, `Coupon`, `SupportTicket`, `TicketMessage`, `ContactMessage`, `Banner`, `Page`, `Faq`, `Counter`, `Setting`, `AuditLog`.

Önemli iş kuralları:

- Sipariş oluşturma tek bir transaction içinde fiyat, stok, kupon ve sayaç işlemlerini yapar.
- Stok düşümü koşullu (`stock >= adet`) yapılır; yetersiz stokta sipariş oluşmaz.
- İptal/iade durumunda stok geri eklenir ve stok hareketi yazılır.
- Ödeme **yalnızca doğrulanmış** callback veya yöneticinin referansla onayı sonrası `PAID` olur.
- Kart bilgisi hiçbir yerde saklanmaz; ödeme sağlayıcısına yönlendirme akışı kullanılır.

## 5. Gelişmiş Yönetim Modülleri (Faz 2)

Tüm modüller gerçek PostgreSQL verisiyle çalışır; sahte başarı ekranı veya işlevsiz buton yoktur. Her admin Server Action'ı `assertAdmin(izin)` ile backend tarafında korunur, kritik işlemler `AuditLog`'a yazılır.

| # | Modül | Durum | Kapsam |
| --- | --- | --- | --- |
| 1 | Gelişmiş ürün kartı | Tamamlandı | Genel, fiyat, stok, barkod, teknik özellikler, görseller, SEO sekmeleri |
| 2 | Excel / CSV içe aktarma | Tamamlandı | Şablon, otomatik kolon eşleme, satır doğrulama, önizleme, transaction, geri alma, hata raporu |
| 3 | Gelişmiş fiyatlandırma | Tamamlandı | Fiyat listeleri, fiyat geçmişi, toplu güncelleme, KDV dahil/hariç hesap, onay akışı |
| 4 | Stok / depo | Tamamlandı | Giriş, çıkış, depo transferi, sayım, düzeltme, kritik stok, hareket geçmişi, depo bazlı rapor |
| 5 | Barkod / etiket | Tamamlandı | Çoklu barkod, EAN-13/EAN-8/Code128/QR, PDF etiket, yapılandırılabilir boyut |
| 6 | B2B / bayi / kurumsal | Tamamlandı | Müşteri türleri, bayi başvuru/onay akışı, bayi kodu, grup fiyat listesi, müşteriye özel fiyat, bayi paneli, toplu sipariş, toplu teklif |
| 7 | Teklif yönetimi | Tamamlandı | Web teklif talebi, panelden teklif, PDF, e-posta, siparişe dönüştürme, müşteri takip ekranı |
| 8 | Sysmond TDS hazırlığı | Bilinçli olarak pasif | Ayar/log ekranı, env tabanlı kimlik, alan kaynağı eşleme varsayılanları; gerçek API dokümanı olmadan istek gönderilmez |
| 9 | Raporlama | Tamamlandı | 14 rapor (satış, kâr, stok, bayi, müşteri, Sysmond), Excel/CSV/PDF dışa aktarma, KDV–maliyet–kâr ayrımı |
| 10 | Modül yetkileri / denetim | Tamamlandı | İzin anahtarları, rol hazır ayarları, backend zorlaması, audit kayıtları |
| 11 | Modern admin arayüzü | Tamamlandı | Sabit menü, hızlı arama, bildirimler, profil menüsü, filtre/sıralama/sayfalama, mobil/tablet |
| 12 | Test ve kalite | Tamamlandı | 50 birim testi, TypeScript tip kontrolü, üretim derlemesi |

### Fiyat ve bayi önceliği

Fiyatlar KDV dahil saklanır; net tutar `brüt − indirim − KDV` olarak hesaplanır. Bayi fiyatı şu sırayla uygulanır:

1. Müşteriye özel fiyat (`CustomerProductPrice`)
2. Aktif grup fiyat listesi (`PriceList` / `ProductPrice`)
3. Grup indirim yüzdesi
4. Perakende indirimli/satış fiyatı

Aynı sıra vitrin, sepet ve sipariş oluşturma adımlarında kullanılır; sipariş kalemine maliyet anlık görüntüsü de yazılır. Bayi fiyat grubu fiyatları yalnızca `DEALER` / `AUTHORIZED_DEALER` türündeki müşterilere uygulanır; normal müşteriye bayi fiyatı hiçbir ekranda gösterilmez.

### Bayi başvurusu ve bayi paneli

- Herkese açık `/bayi-basvuru` formu şirket, vergi ve iletişim bilgilerini alır; numara `BY-YYYY-01000…` biçimindedir ve aynı e-posta için bekleyen başvuru tekrar oluşturulamaz.
- Yönetici `/admin/bayiler` ekranında başvuruyu inceler, bir bayi fiyat grubu seçerek onaylar veya gerekçeyle reddeder. Onay `b2b.manage` yetkisi, transaction ve denetim kaydı gerektirir.
- Onay sırasında e-posta ile eşleşen müşteri hesabı bayiye dönüştürülür; hesap yoksa şifresiz oluşturulur ve bayi kodu `BY-YYYY-00001` biçiminde atanır. Bayi, şifre sıfırlama akışıyla hesabına erişir.
- Bayi paneli `/hesabim/bayi`: özel fiyatlar, ürün arama, stok durumu, `ÜRÜN_KODU;ADET` toplu sipariş, sipariş geçmişi, teklifler ve fiyat avantajı özeti.
- Bayi olmayan hesaplar bayi panelini ve bayi fiyatlarını göremez; API üzerinden fiyat sorgulama da aynı sunucu tarafı kurala tabidir.

### Excel / CSV içe aktarma notları

- SKU ve ürün adı yeni kayıtta zorunludur; mevcut SKU güncellenir.
- Türkçe ve İngilizce başlıklar eşlenir; `1.234,56` ve `1,234.56` biçimleri ayrıştırılır.
- Sysmond/TDS başlıkları otomatik tanınır: `STOCKNO`, `STOCKNAME`, `BARCODE`, `BRAND`, `MODEL`, `FIYAT1`, `FIYAT2`, `QUANTITY`.
- Maliyet, indirimli fiyat, KDV, stok ve kritik stok sayısal doğrulanır; hatalı satırlar raporlanır.
- İçe aktarma transaction içinde çalışır; hata durumunda geri alınır ve işlem `ImportJob` altında izlenir.

### Teklif akışı

- Herkese açık `/teklif-al` formu `ÜRÜN_KODU;ADET` biçiminde satır kabul eder; katalogda bulunamayan kodlar fiyatsız satır olarak işaretlenir.
- Teklif numarası `TK-YYYY-#####` biçimindedir. Yönetici teklifi düzenleyip PDF olarak e-posta ile gönderebilir.
- Siparişe dönüştürme, teklifin bir müşteri hesabına bağlı olmasını ve teslimat adresi girilmesini gerektirir; stok bu adımda transaction içinde düşülür.
- Müşteri, `/hesabim/teklifler` altında yalnızca kendi tekliflerini görür.

### Sysmond TDS

İlk sürümde **aktif değildir** ve dışarıya istek gönderilmez. Gerçek API dokümanı gelene kadar endpoint/şema uydurulmaz. Kimlik bilgileri panelde saklanmaz; yalnızca `SYSMOND_BASE_URL`, `SYSMOND_USERNAME`, `SYSMOND_API_KEY` ortam değişkenlerinden okunur ve panelde sadece "Tanımlı / Eksik" durumu gösterilir.

Panelde belgelenen önerilen alan kaynağı eşlemesi: ürün kodu, ürün adı, barkod, maliyet ve fiziksel stok Sysmond'dan; web satış fiyatı, bayi fiyatı, görseller, açıklamalar ve siparişler INDEXBİLGİ'den gelir. Web rezervasyonu fiziksel stoktan ayrıca düşülür. Bu tablo yalnızca tasarım kararını belgeler; gerçek alan adları doğrulanmadığı için çalıştırıcı yoktur.

Entegrasyonun tamamlanması için gereken ve henüz sağlanmamış girdiler:

- Sysmond tarafından verilmiş güncel API dokümanı (endpoint, istek/yanıt şemaları, hata kodları)
- Test (sandbox) ortamı adresi ve test kimlik bilgileri
- Kimlik doğrulama ve token yenileme yöntemi
- Senkronizasyon sıklığı, çakışma ve idempotency politikası
- Canlıya geçiş ve geri alma planı

Bu bilgiler sağlanana kadar entegrasyon "tamamlandı" olarak işaretlenmez; mevcut sipariş, stok ve fiyat akışları yerel veritabanıyla çalışır.

## 6. Ödeme Altyapısı

- **Havale/EFT:** Sipariş `PAYMENT_PENDING` olarak açılır. Yönetici banka hesabında doğruladıktan sonra referans numarasıyla "Ödemeyi Onayla" der; bu işlem denetim kaydına yazılır.
- **Kredi/banka kartı:** Sağlayıcı bağımsız modüler yapı. Geliştirme/test için `PAYMENT_MOCK_ENABLED="true"` iken HMAC imzalı mock callback çalışır. **Üretimde bu değer `false` olmalıdır.**
- **iyzico / PayTR:** Anahtar ve entegrasyon kodları sağlanmadığı için canlı entegrasyon **yapılmamıştır**. `.env.example` içindeki alanlar hazırdır; gerçek anahtarlar ve sağlayıcı SDK/API dokümanı geldiğinde `src/lib/payments/` altına eklenmelidir. Test ve canlı ortam anahtarları ayrı tutulmalıdır.

## 7. E-posta

SMTP ayarları ortam değişkenlerinden okunur. `SMTP_HOST` boşsa e-posta gönderilmez, sunucu günlüğüne yazılır ve kullanıcıya yanıltıcı başarı mesajı verilmez (destek yanıtında "e-posta gönderimi denendi" ifadesi kullanılır).

## 8. Güvenlik

- Şifreler bcrypt (12 tur) ile hashlenir; oturumlar HS256 imzalı JWT ve `httpOnly`, `SameSite=Lax`, üretimde `Secure` çerezlerle taşınır.
- `/admin` ve `/hesabim` middleware ile korunur; her admin action'ı ayrıca `assertAdmin(izin)` çağırır.
- Tüm form girdileri zod ile doğrulanır; Prisma parametreli sorgular kullanılır; istemci çıktıları React tarafından kaçırılır.
- Görsel yükleme: yalnızca `products.manage` / `content.manage`, 8 MB sınırı, sharp ile WebP dönüşümü, rastgele dosya adı, kullanıcı başına hız sınırı. Yüklenen dosyalar `UPLOAD_DIR` altına yazılır ve `/uploads/...` rotasıyla (yol dışına çıkma engelli, yalnızca WebP) sunulur; `next start` üretimde derleme sonrası yazılan dosyaları public'ten otomatik sunmadığı için bu rota zorunludur.
- Giriş, kayıt, şifre sıfırlama, sepet, ödeme ve destek formlarında bellek içi hız sınırlama vardır. Tek sunucu/VPS için yeterlidir; yatay ölçeklemede Redis tabanlı sınırlayıcıya taşınmalıdır.
- Kritik işlemler `AuditLog` tablosuna kullanıcı, IP ve detayla yazılır.
- Üretimde HSTS, CSP (`default-src 'self'`, `object-src 'none'`, `base-uri 'self'`, `frame-ancestors 'self'`, `form-action 'self'`), `nosniff`, `SAMEORIGIN`, `Referrer-Policy` ve `Permissions-Policy` başlıkları gönderilir (`next.config.ts`). Google Analytics etkinleştirilirse CSP'de ilgili alan adları zaten tanımlıdır.
- iyzico/PayTR gibi harici ödeme sağlayıcısı eklenirken CSP `form-action`/`connect-src` ve `NEXT_PUBLIC_SITE_URL` callback adresi sağlayıcının dokümanına göre güncellenmelidir.
- `/api/health` yalnızca veritabanı bağlantısını bildirir; gizli bilgi döndürmez.

## 9. Üretim Kurulumu (VPS)

Aşağıdaki adımlar Ubuntu 22.04/24.04 + Nginx + systemd içindir.

```bash
# 1) Sistem paketleri
sudo apt update && sudo apt install -y nginx postgresql git curl
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# 2) Veritabanı
sudo -u postgres psql -c "CREATE USER indexbilgi WITH PASSWORD 'GUCLU_SIFRE';"
sudo -u postgres psql -c "CREATE DATABASE indexbilgi OWNER indexbilgi;"

# 3) Uygulama
sudo mkdir -p /var/www/indexbilgi && sudo chown $USER /var/www/indexbilgi
git clone <depo-adresi> /var/www/indexbilgi
cd /var/www/indexbilgi
cp .env.example .env
nano .env      # DATABASE_URL, AUTH_SECRET, NEXT_PUBLIC_SITE_URL, SMTP, SEED_*

npm ci
npx prisma migrate deploy
# İlk kurulumda: güçlü SEED_ADMIN_PASSWORD ile. Demo veri üretimde varsayılan kapalıdır.
NODE_ENV=production npm run db:seed
NODE_ENV=production npm run check:prod
npm run build
```

> `npm run db:seed` yalnızca ilk kurulumda çalıştırılmalıdır. Seed'i tekrar çalıştırmak süper yöneticinin şifresini değiştirmez; rolleri/ayarları günceller ve demo veri kapalıyken katalog verisine dokunmaz. `pg_dump` sunucuda kurulu olmalıdır (`postgresql-client` paketi); yedekleme betiği bu aracı kullanır.

`.env` üretim örneği:

```env
DATABASE_URL="postgresql://indexbilgi:GUCLU_SIFRE@localhost:5432/indexbilgi?schema=public"
AUTH_SECRET="<openssl rand -base64 48>"
NEXT_PUBLIC_SITE_URL="https://indexbilgi.com"
APP_HOST="127.0.0.1"
SEED_ADMIN_EMAIL="admin@alanadiniz.com"
SEED_ADMIN_PASSWORD="<ilk seed için güçlü şifre; seed sonrası satırı silin>"
SEED_DEMO_DATA="false"
PAYMENT_MOCK_ENABLED="false"
UPLOAD_DIR="/var/lib/indexbilgi/uploads"
BACKUP_DIR="/var/backups/indexbilgi"
```

Canlıya alma kontrolü:

1. `NODE_ENV=production npm run check:prod` — hata yoksa devam edin.
2. `npm run build` ve servisi yeniden başlatın.
3. `curl -fsS https://indexbilgi.com/api/health` → `{"ok":true,"db":"up",...}` dönmeli.
4. `curl -sI https://indexbilgi.com | grep -i strict-transport` → HSTS başlığı görünmeli.
5. `/admin/login` ile giriş yapın, panelde "Hesabım"dan ilk şifreyi değiştirin.
6. Sunucu güvenlik duvarında yalnızca 80/443 açık olsun; 3000 portu dışarıya kapalı kalsın (uygulama zaten `127.0.0.1`'e bağlanır).

systemd servisi (`/etc/systemd/system/indexbilgi.service`):

```ini
[Unit]
Description=INDEXBILGI Next.js
After=network.target postgresql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/indexbilgi
Environment=NODE_ENV=production
EnvironmentFile=/var/www/indexbilgi/.env
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=5
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=full

[Install]
WantedBy=multi-user.target
```

```bash
sudo mkdir -p /var/lib/indexbilgi/uploads && sudo chown -R www-data:www-data /var/lib/indexbilgi/uploads
sudo systemctl daemon-reload
sudo systemctl enable --now indexbilgi
```

Nginx reverse proxy (`/etc/nginx/sites-available/indexbilgi`):

```nginx
server {
    listen 80;
    server_name indexbilgi.com www.indexbilgi.com;

    client_max_body_size 12M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/indexbilgi /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d indexbilgi.com -d www.indexbilgi.com
```

### Yedekleme

`npm run db:backup`, `DATABASE_URL` ile `pg_dump` çalıştırır, çıktıyı gzip'ler ve `BACKUP_DIR` (varsayılan `./backups`) altına yazar. `BACKUP_RETENTION_DAYS` (varsayılan 14) süresinden eski `indexbilgi-*.sql.gz` dosyaları silinir. Bağlantı adresi ve parola günlüğe yazılmaz.

```bash
# Elle yedek
npm run db:backup

# Günlük yedek (cron, proje dizininde)
0 2 * * * cd /var/www/indexbilgi && BACKUP_DIR=/var/backups/indexbilgi /usr/bin/npm run db:backup >> /var/log/indexbilgi-backup.log 2>&1

# systemd timer kullanıyorsanız aynı komutu bir oneshot servisine yazın:
# ExecStart=/usr/bin/npm run db:backup

# Görseller
rsync -a /var/lib/indexbilgi/uploads/ /var/backups/uploads/
```

Geri yükleme: `gunzip -c yedek.sql.gz | psql "$DATABASE_URL"`. Yedek dosyalarını ayrı bir sunucuda/nesne depolamada saklayın ve geri yükleme tatbikatı yapın.

## 10. SEO ve Analitik

- `sitemap.xml` ve `robots.txt` otomatik üretilir (`src/app/sitemap.ts`, `src/app/robots.ts`).
- Ürün sayfalarında Schema.org `Product` + `Offer`, ana sayfada `Organization` JSON-LD bulunur.
- Ürün/kategori/sayfa başlıkları ve açıklamaları yönetimden düzenlenebilir; canonical ve OpenGraph etiketleri üretilir.
- Google Analytics ve Search Console doğrulama kodu **Yönetim → Site Ayarları → SEO** alanından girilir.

## 11. Yasal Metinler

Gizlilik, KVKK, mesafeli satış, iade ve çerez metinleri örnek içerikle gelir. **Yayına almadan önce işletmenin gerçek ticari unvanı, adresi, vergi bilgileri ve iletişim bilgileriyle doldurulmalı ve hukuki açıdan kontrol ettirilmelidir.** Bu metinler hukuki danışmanlık yerine geçmez.

## 12. Bilinen Eksikler / Sonraki Adımlar

- iyzico ve PayTR canlı entegrasyonları (anahtarlar ve sağlayıcı bağlantı bilgileri bekleniyor). Test/canlı anahtarları ayrı tutulmalıdır.
- Kargo firması API entegrasyonları (mevcut yapı manuel takip numarası ve takip bağlantısı destekler).
- Sysmond TDS entegrasyonu bilinçli olarak pasiftir; gerçek API endpoint/şema dokümanı geldiğinde ayrı bir adaptör olarak eklenmelidir.
- Depo stok takibi ürün düzeyindedir; varyant bazlı depo stoku ayrıca modellenmemiştir.
- Satış raporlarında sipariş düzeyi kupon indirimi kalemlere dağıtılmaz. Maliyetin KDV hariç olduğu varsayılır; maliyeti tanımsız eski kalemler raporda işaretlenir.
- PDF Türkçe karakterleri için `src/assets/fonts/DejaVuSans.ttf` paket içindedir; gerekirse `PDF_FONT_PATH` ile değiştirilebilir.
- `npm audit --omit=dev` sonucunda kalan uyarılar: `xlsx@0.18.5` için npm'de düzeltme yayınlanmamıştır (yalnızca yetkili admin içe aktarma ekranında kullanılır; dosya boyutu/satır sınırı vardır, yine de güvenilmeyen dosyaları yalnızca yöneticiler yüklemelidir), `zod` 4.x'e yükseltme major değişiklik olduğu için ertelenmiştir, `postcss` uyarısı Next.js'in paketlediği sürümden kaynaklanır (derleme zamanı, çalışma zamanı girişi yoktur).
- Yönetici hesaplarında iki adımlı doğrulama (2FA) ve oturumların merkezi iptali (JWT anında geçersiz kılma) yoktur; şüpheli durumda kullanıcıyı pasifleştirin ve `AUTH_SECRET`'i döndürün (tüm oturumlar kapanır).
- Yedekleme betiği (`npm run db:backup`) hazırdır; zamanlanmış çalışma (cron/systemd timer) ve yedeklerin ayrı sunucuya kopyalanması sunucu tarafında kurulmalıdır.
