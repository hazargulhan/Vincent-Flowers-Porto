# DEVAM — Vincent Flowers Porto (yapay zeka asistanı için devir notu)

> Kullanıcı "devam edelim" dediğinde bu dosyayı oku ve **"ŞU AN NEREDEYİZ"** bölümündeki
> ilk tamamlanmamış adımdan devam et. Başka bir şey sorma, plan yapmadan önce bu dosyayı
> baştan sona oku.

**Son güncelleme:** 2026-09-03

---

## 0. Kullanıcı hakkında (önce bunu oku)

Kullanıcının adı Hazar. **Teknik biri değil.**

- Her cevabın sonunda **sadece ona düşen işleri**, sade Türkçe, numaralandırılmış şekilde yaz.
  Nereye tıklayacak, ekranda ne görecek, ne yazacak — adım adım.
- Çıplak komut listesi verme. Bir komutu gerçekten onun çalıştırması gerekiyorsa, önce
  **ne işe yaradığını ve ekranda ne olacağını** bir cümleyle anlat.
- Teknik detay cevabın başında olabilir (neyin neden yapıldığını bilmek istiyor), ama
  günlük dille yazılmalı.
- `SIZIN-YAPMANIZ-GEREKENLER.md` onun gerçekten okuduğu dosya. Her turun sonunda güncelle.

**Şifre / kart / hesap bilgisi girme.** `wrangler secret put` gibi komutlarda değeri
kullanıcı yazar. Ona komutu ver, ne olacağını anlat, sen çalıştırma.

---

## 1. Proje nedir

Porto'daki bir çiçekçinin sitesi. Buket tasarlama, hazır buket satışı, abonelik,
etkinlik/B2B talep formları. İngilizce + Avrupa Portekizcesi.

- `frontend/` — React 19 + Vite + TypeScript → **Cloudflare Pages**
- `backend/` — Hono → **Cloudflare Workers**, veri **KV**'de, fotoğraflar **R2**'de

Ödeme adımı yok: her sipariş bir taleptir, sunucuda saklanır ve e-postayla mağazaya gider.
Detaylı kurulum/çalıştırma bilgisi için `README.md`.

---

## 2. Hesaplar

| Ne | Değer |
|---|---|
| Cloudflare hesabı | `vincent.flowers.porto@gmail.com` — Account ID `3c2a3d9cf4b7a29183669f8ef6f334d2` |
| Worker adı | `vincent-flowers-backend` |
| Canlı API adresi | `https://vincent-flowers-backend.vincent-flowers-porto.workers.dev` |
| KV namespace (canlı) | `f1e6af9a68a94d7e9cfc13e09bf812e9` — içinde gerçek katalog (49 çiçek türü), kapanışlar ve dinamik ayarlar var |
| KV namespace (preview) | `35bf31b0a19d44f9814519f464d279c5` |
| R2 kovası | `vincent-flowers-media` — 62 çiçek ve buket fotoğrafı yüklü, 1 yıl önbellekli aktif |
| GitHub deposu | `hazargulhan/Vincent-Flowers-Porto` (hesap: `hazarglhn@gmail.com`) |
| Çalışma dalı | `main` — güncel, tüm değişiklikler merge edildi ve commit/push yapıldı |

**Dikkat:** GitHub hesabı (`hazarglhn@gmail.com`) ile Cloudflare hesabı
(`vincent.flowers.porto@gmail.com`) **farklı**. Bu normal, kullanıcı böyle istedi.

---

## 3. ŞU AN NEREDEYİZ

**Tüm sistemler canlıda sorunsuz çalışıyor ve deploy edildi.** (Workers ve Pages güncel).

### Tamamlananlar

- [x] **ADIM 1 & 2:** Admin secret'ları (`ADMIN_PASSWORD`, `ADMIN_TOKEN_SECRET`) güvenli kasaya taşındı.
- [x] **ADIM 3 & 4:** Backend deploy edildi ve 49 çiçek ile doğrulandı.
- [x] **ADIM 5 & 6:** Frontend Cloudflare Pages'e deploy edildi (`vincentflowersporto.com`).
- [x] **ADIM 7:** Resend DKIM DNS kaydı Cloudflare üzerinde doğrulandı.
- [x] **ADIM 8:** Kapanış uyarısı sadeleştirildi (üst siyah şerit kaldırıldı, sol şerit yumuşatıldı).
- [x] **ADIM 9:** 62 adet çiçek ve buket fotoğrafı Cloudflare R2'ye aktarıldı, KV kataloğu R2 URL'leri ile güncellendi.
- [x] **ADIM 10:** Görsel optimizasyonu yapıldı: 11.4 MB atıl dosya silindi, WebP formatına çevrildi, 81 görsel optimize edildi (101.8 MB -> 21.2 MB).
- [x] **ADIM 11:** Sayfa içi tüm görsellere `loading="lazy"` ve `decoding="async"` eklendi; Admin sayfası `React.lazy` ile kod ayrıştırmasına uğratıldı (ilk JS paketi 500 KB altına düşürüldü).
- [x] **ADIM 12:** Sekme ikonu (Favicon) düzeltildi. Mor Vite şimşek ikonu yerine logonun çoklu boyutlu ICO ve PNG formatları yerleştirildi.
- [x] **ADIM 13:** Admin paneli telefona tam uyumlu (responsive) hale getirildi (siparişler için mobil kart görünümü, kaydırmasız renk varyantları ve esnek butonlar).
- [x] **ADIM 14:** Admin paneline ve sipariş geçmişine tam Portekizce dil desteği eklendi (üst menüdeki global dil seçicisi ile entegre).
- [x] **ADIM 15:** İşletme fiyatları ve ayarları (Abonelikler, minimum sepet tutarı, buket montaj ücreti, teslimat şehirleri ve çalışma saatleri) Cloudflare KV'ye bağlandı, Admin panelinde "Business Settings" kartı eklendi ve tüm sitede dinamik senkronize edildi.
- [x] **ADIM 16:** Events (Düğün & Etkinlik) sayfası SEO'su güçlendirildi (Google için `<h1>` ana başlığı ve Porto odaklı arama metinleri eklendi).
- [x] **ADIM 17:** Site geneli Form ve Modal erişilebilirliği tamamlandı (Tüm fotoğraf büyütme pencerelerine klavyeden `Escape` tuşu desteği, mobil menü butonuna ve tüm sipariş/iletişim formlarına ekran okuyucu ve otomatik doldurma etiketleri eklendi).
- [x] **ADIM 18:** Admin paneli Build Your Own çiçek kartlarındaki taşma ve "Delete Type" butonunun sığmama sorunu düzeltildi (Görsel ve URL alanı tam genişliğe alındı; mobilde çiçek adı, aktiflik anahtarı ve Delete Type butonu esnek satırlara ayrılarak taşmalar önlendi).

### Gelecek Oturumda Yapılabilecekler (Aday İşler)
1. **Canlıda Uçtan Uca Sipariş Doğrulaması:**
   - Canlı siteden test siparişi verilerek admin panelindeki yeni kart görünümünün ve bildirim e-postasının kontrol edilmesi.
2. **Otomatik Test Paketi (Vitest):**
   - Fiyat hesaplama, tarih doğrulama ve kapatma dönemi kuralları için birim testler yazılması.
3. **CI / CD GitHub Actions:**
   - Her push/PR işleminde build, lint ve tip kontrollerini otomatik koşan iş akışı eklenmesi.

## 4. Adımların ayrıntısı

### ADIM 1 ve 2 — Secret'lar (kullanıcı çalıştırır)

Neden gerekli: `ADMIN_PASSWORD` şu an Cloudflare panelinde **düz metin değişken (Text)**
olarak duruyor, şifreli secret olarak değil. Kanıt: `wrangler secret list` sadece
`RESEND_API_KEY` gösteriyor, ama canlı `/api/admin/login` ucu yanlış şifreye 401 dönüyor
(500 "not configured" değil) — yani değer var ama secret değil.

**`wrangler deploy`, `wrangler.toml`'da tanımlı olmayan düz metin değişkenleri siler.**
Secret'lar korunur. Yani önce secret'a taşınmazsa deploy sonrası admin paneline
girilemez.

Kullanıcının çalıştıracağı komutlar:

```
npx wrangler secret put ADMIN_PASSWORD
```
Ekranda `Enter a secret value:` çıkar; kullanıcı **mevcut admin şifresini** yazar.

```
npx wrangler secret put ADMIN_TOKEN_SECRET
```
Rastgele uzun bir metin. Kullanıcı şununla üretebilir:
`node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`

Kontrol (sen çalıştırabilirsin) — üç isim de listede görünmeli:
```
cd backend && npx wrangler secret list --name vincent-flowers-backend
```

### ADIM 3 — Backend deploy

```
cd backend && npx wrangler deploy
```

Deploy sonrası çıkan adresin `.env.production` içindekiyle **aynı** olması gerekiyor
(`vincent-flowers-backend.vincent-flowers-porto.workers.dev`). Farklıysa
`frontend/.env.production` güncellenmeli ve frontend yeniden build edilmeli.

### ADIM 4 — Canlı backend doğrulaması

`<ADRES>` = canlı API adresi.

1. Katalog bozulmamış mı — **49 çiçek türü** dönmeli, 3 değil.
   `curl -s <ADRES>/api/catalog` → `makeYourOwn` dizisi 49 elemanlı olmalı.
   **3 dönerse felaket:** KV bağlantısı yanlış, katalog varsayılana düşmüş. Hemen dur.
2. Yeni sipariş uçları var mı: `curl -s -o /dev/null -w "%{http_code}" <ADRES>/api/admin/orders`
   → **401** dönmeli (404 değil). 401 = uç var, yetki yok, doğru.
3. Admin girişi: kullanıcının şifresiyle `/api/admin/login` → 200 + token.
   (Şifreyi sen giremezsin; kullanıcıdan tarayıcıda `/admin`'e girip denemesini iste.)
4. Sipariş göndermeyi **canlıda test etme** — gerçek e-posta gider ve mağaza sahibine
   sahte sipariş düşer.

### ADIM 5 — Frontend yayını

Backend doğrulandıktan **sonra** yapılmalı. Sebebi: Pages `main` dalına bağlı ve otomatik
build alıyor. `main`'e önce push edersen yeni admin paneli eski backend'e bağlanır ve
sipariş listesi kırık görünür.

```
git checkout main && git merge order-persistence-and-launch-fixes && git push origin main
```

Push sonrası Cloudflare Pages otomatik build alır (2-3 dakika). Pages ayarları
kontrol edilmeli: kök dizin `frontend`, build komutu `npm run build`, çıktı `dist`.
Pages'e ayrıca ortam değişkeni eklemeye gerek yok — `.env.production` depoda duruyor ve
Vite build sırasında onu okuyor.

### ADIM 6 — Canlı site doğrulaması

`https://vincentflowersporto.com` üzerinde:

1. Olmayan bir adres (`/deneme123`) → düzgün "sayfa bulunamadı" ekranı, beyaz sayfa değil.
2. `/shop` sayfasında sayfa kaynağında **tek** `<link rel="canonical">` olmalı ve
   `.../shop` göstermeli. İki tane varsa SEO düzeltmesi çalışmamış demektir.
3. `/admin` → giriş → **Orders** bölümü görünmeli, katalog ve kapanış tarihleri yerinde.
4. Alt kısımdaki mesaj formunu gönder → "Message sent!" yazmalı, `footer.msg_sent` değil.
5. Tarayıcı konsolunda hata olmamalı.

### ADIM 7 — Resend

`noreply@vincentflowersporto.com` adresinin Resend'de doğrulanmış olması gerekiyor.
Doğrulanmamışsa her sipariş e-postası reddedilir. **Yeni davranış:** sipariş yine de
kaydedilir ve admin panelinde kırmızı **"email failed"** rozetiyle görünür. Yani
e-posta çalışmasa bile sipariş kaybolmaz — ama kullanıcıya günde bir kez admin
panelindeki Orders bölümüne bakmasını hatırlat.

---

## 5. Bu turda ne değişti (kod)

### Siparişlerin kalıcı olarak saklanması (en önemlisi)
Önceden sipariş **sadece e-postaydı**; Resend hata verirse sipariş tamamen kayboluyordu.
Artık `/api/order`, e-postadan **önce** KV'ye yazıyor.

- Anahtar: `order:<ters zaman damgası>-<rastgele>` — KV sözlük sırasıyla listelediği için
  zaman damgasını tersten sayarak **en yeni en üstte** sıralama bedavaya geliyor.
- Özet bilgi KV **metadata**'sında; böylece admin listesi tek KV çağrısı.
- Müşteri referansı `VF-XXXXXX`, e-posta konusunda da geçiyor.
- Saklama 730 gün, **mutlak `expiration`** ile (`expirationTtl` olsaydı her güncellemede
  süre sıfırlanırdı).
- E-posta başarısızsa müşteriye `success:true, emailSent:false` dönülüyor — sipariş
  kayıtlıyken "tekrar deneyin" demek mükerrer sipariş üretirdi.

Yeni uçlar: `GET /api/admin/orders` (sayfalamalı), `GET /api/admin/orders/:id`,
`POST /api/admin/orders/:id/status` (`new` / `handled` / `archived`).
Arayüz: `frontend/src/components/AdminOrders.tsx`.

### Güvenlik ve doğrulama (`backend/src/index.ts`)
- `escapeHtml` — müşteri metinleri e-postaya kaçışlanarak giriyor. Öncesinde ham
  giriyordu ve e-posta hem mağazaya hem alıcıya gittiği için doğrulanmış alan adından
  oltalama e-postası gönderilebiliyordu.
- Fiyatlar katalogdan yeniden hesaplanıyor; istemcinin gönderdiği `total` artık
  güvenilmiyor (önce `0.01 €` iddia edilebiliyordu).
- `deliveryDate` zorunlu — yoksa kapanış kontrolü tamamen atlanabiliyordu.
- Bilinmeyen `type` reddediliyor (önce boş gövdeli e-posta üretiyordu).
- Admin girişine hız sınırı (15 dk / 5 yanlış deneme).

### Frontend düzeltmeleri
- İki dilde de tanımsız olan **6 çeviri anahtarı** eklendi. `t('x') || 'yedek'` deyimi
  çalışmıyor (i18next anahtarın kendisini döndürür), bu yüzden kullanıcılar başarı
  ekranında `b2b.inquiry_sent` gibi ham yazılar görüyordu.
- 5 sipariş formuna çift-gönderim koruması (`submitting` + `disabled`).
- 404 sayfası (`NotFound.tsx`) + `public/_redirects`.
- Sayfa bazlı canonical/OG (`components/Seo.tsx`).
- API adresi 10 dosyadan `src/lib/api.ts`'e toplandı, `VITE_API_BASE` ile.
- Yüklenen görseller göreli `/media/...` olarak saklanıyor (önce mutlak URL yazılıyordu;
  API adresi değişse tüm eski fotoğraflar kırılırdı).

---

## 6. TUZAKLAR — bunları bilmeden dokunma

1. **`wrangler` hesap önbelleği.** Hesap değiştirdikten sonra wrangler eskisini kullanmaya
   devam edip `Authentication error [code: 10000]` verebiliyor. Çözüm:
   `rm -f backend/node_modules/.cache/wrangler/wrangler-account.json`

2. **Deploy düz metin değişkenleri siler.** Panelden "Text" olarak eklenmiş değişkenler
   `wrangler deploy` sonrası kaybolur; secret'lar kalır. Bkz. ADIM 1.

3. **KV namespace id'leri hesaba özeldir.** `wrangler.toml`'daki id'ler yalnızca
   `vincent.flowers.porto@gmail.com` hesabında geçerli. Yanlış hesaptan deploy edilirse
   katalog boş kalır ve site koddaki 3 çiçeklik varsayılana düşer.

4. **`react-helmet-async` 3.0.0 statik etiketleri değiştiremiyor.** İstemcide `data-rh`
   yazmadığı için `index.html`'deki etiketleri ne sahiplenir ne siler. Bu yüzden
   canonical/OG etiketleri `index.html`'den **kasten çıkarıldı**; sahibi `Seo.tsx`.
   Oraya geri eklersen sayfa iki canonical ile yayınlanır ve Google ikisini de yok sayar.

5. **`.env.production` build anında koda gömülür.** Sonradan değiştirilemez; değişirse
   frontend yeniden build edilmeli.

6. **Backend her zaman frontend'den önce deploy edilmeli.** Bkz. ADIM 5.

7. **Yerel test gerçek e-posta göndermemeli.** `wrangler dev` varsayılan olarak yereldir
   (Miniflare, KV/R2 taklit edilir), ama `.dev.vars` içindeki **gerçek** Resend anahtarını
   okur. Test ederken sahte değerlerle ez:
   ```
   npx wrangler dev --var RESEND_API_KEY:re_invalid_local_test --var ADMIN_PASSWORD:testpass123 --var ADMIN_TOKEN_SECRET:local_test_secret
   ```
   `--var`, `.dev.vars`'ı geçersiz kılar. Bu aynı zamanda "e-posta çökerse sipariş
   kaydediliyor mu?" senaryosunu test etmenin tek yolu.

8. **Canlıda sipariş formu doldurma.** Mağaza sahibine gerçek sahte sipariş e-postası gider.

---

## 7. Yapılmayanlar (bilinçli — sonraki turlar için)

Öncelik sırasıyla:

1. **Görsel yükü.** `frontend/public/images` **98 MB**. Tek başına kullanılmayan
   `About/IMG_5663.JPG` **11.4 MB** (aynı fotoğrafın `.webp` hâli zaten var ve o
   kullanılıyor). 4 adet PNG fotoğraf 11.7 MB, WebP'ye çevrilse ~%95 küçülür.
   Hiçbir görselde `loading="lazy"` ve `width`/`height` yok → mobilde yavaş açılış ve
   düzen kayması. Route bazlı code-splitting yok: ana sayfaya giren ziyaretçi admin
   panelini de indiriyor (tek parça 500 KB JS).
2. **Erişilebilirlik.** Sipariş formlarında hiç `<label>` yok (sadece placeholder).
   Modallarda focus tuzağı ve Escape yok. Hata mesajları ekran okuyucuya duyurulmuyor
   (`aria-live` yok). Mobil menüde `aria-expanded` yok. `#888` metin kontrastı yetersiz.
3. **Sahibin kontrolü.** Abonelik fiyatları (30/55/75 €), buket %25 ücreti, 15 € minimum,
   teslimat şehirleri ve saat aralıkları kodda sabit — admin panelinden düzenlenemiyor.
   Stok adedi takibi yok (sadece açık/kapalı). Admin paneli tamamen İngilizce ve
   telefonda kullanılamıyor (sabit sütunlu tablolar).
4. **Events sayfasında `<h1>` yok** — SEO'yu zayıflatıyor. İki dilde başlık metni
   gerektiği için kullanıcıya sorulmalı.
5. **Hiç otomatik test yok.** İlk yazılacaklar: `lib/dates.ts`, kapanış doğrulayıcıları,
   `escapeHtml`, fiyat yeniden hesaplama.
6. **CI yok.** `.github/` klasörü hiç yok.
7. **Analitik ve gizlilik.** Analitik yok, çerez bildirimi yok, gizlilik politikası
   sayfası yok. AB işletmesi için eksik.
8. **Portekizce ayrı URL yok.** Dil sadece tarayıcıda değişiyor, `/pt/...` gibi ayrı
   adresler olmadığı için Portekizce sürüm Google'da ayrıca indekslenmiyor. Porto'daki
   yerel bir çiçekçi için en büyük organik arama kaybı bu.

---

## 8. Kontrol komutları

```
cd frontend && npm run build && npm run lint
```
```
cd backend && npm run typecheck
```

Yerel çalıştırma (önce backend):
```
cd backend && npx wrangler dev
```
```
cd frontend && npm run dev
```
