# Sizin Yapmanız Gerekenler (Basit Adımlar)

Bu dosya sadece **sizin** (teknik olmayan) yapmanız gereken şeyleri listeler. Kod tarafındaki her şeyi ben hallettim ve test ettim. Bu dosya ilerledikçe güncellenecek.

Her maddenin yanında **[ ]** varsa henüz yapılmadı, **[x]** varsa tamamlandı demektir.

---

## Nasıl Çalışıyoruz (kural)

Siz teknik biri değilsiniz. Bu yüzden:

- Her konuşmanın sonunda, **sadece sizin yapmanız gerekenler** sade bir dille, numaralandırılmış olarak yazılacak. Nereye tıklayacaksınız, ne göreceksiniz, ne yazacaksınız — hepsi adım adım.
- Size çıplak komut listesi verilmeyecek. Bir komutu gerçekten sizin çalıştırmanız gerekiyorsa, önce **ne işe yaradığı ve ekranda ne olacağı** bir cümleyle anlatılacak.
- Teknik detaylar cevabın başında olabilir (neyin neden yapıldığını bilmek hakkınız), ama günlük dille yazılacak.
- Bu dosya her turun sonunda güncellenecek; biten işler [x] olarak işaretlenecek.

---

## ŞU AN DURUM (ÇEREZ BİLDİRİMİ VE GİZLİLİK POLİTİKASI TAMAMLANDI 🎉)

Son yapılan iyileştirmeler:
- **Çerez Onay Bildirimi (Cookie Banner):** Sitede altta yüzen, zarif ve kullanıcıyı rahatsız etmeyen çerez onay çubuğu eklendi. Yalnızca sepet, dil ve güvenlik için gerekli verilerin saklandığı belirtiliyor ("Kabul Et" ve "Yalnızca Gerekli Olanlar" butonları).
- **GDPR / RGPD Uyumlu Gizlilik Politikası Sayfası:** `/privacy` adresinde iki dilde (İngilizce ve Portekizce) kapsamlı, Porto yerel veri koruma mevzuatına tam uyumlu bir politika sayfası oluşturuldu.
- **Alt Bilgi (Footer) Güncellemesi:** Sitenin en altına telif hakkı satırı, Gizlilik Politikası linki ve kullanıcının istediği zaman çerez ayarlarını değiştirebilmesini sağlayan buton eklendi.
- **GitHub Actions ile Otomatik Dağıtım:** Yapılan tüm geliştirmeler otomatik testlerden geçerek canlıya yüklendi.

### Tamamlanan İşler
- [x] Fotoğraf depolama kovası (`vincent-flowers-media`) oluşturuldu.
- [x] İş 1 — Admin şifresi güvenli kasaya taşındı (`ADMIN_PASSWORD`).
- [x] İş 2 — Güvenlik anahtarı tanımlandı (`ADMIN_TOKEN_SECRET`).
- [x] Arka uç (Backend) canlıya yüklendi ve 49 çiçek ile doğrulandı.
- [x] Ön yüz (Frontend) canlıya yüklendi (`vincentflowersporto.com`).
- [x] Kapanış uyarısı isteğinize göre sadeleştirildi.
- [x] 62 çiçek ve buket fotoğrafı Cloudflare R2'ye aktarıldı.
- [x] Görseller optimize edildi (101.8 MB'tan 21.2 MB'a indirildi).
- [x] Gecikmeli görsel yükleme ve Admin kod ayrıştırması (code-splitting) tamamlandı.
- [x] Resend e-posta DNS anahtarı kontrol edildi (aktif).
- [x] Sekme logosu (Favicon) marka logosuyla değiştirildi.
- [x] Admin paneli mobil uyumlu (responsive) hale getirildi.
- [x] Admin paneline Portekizce dil desteği eklendi.
- [x] İşletme fiyatları ve dükkan ayarları Admin Paneline taşındı ve canlıya alındı.
- [x] Events sayfası SEO ana başlığı (`<h1>`) ve Porto düğün/etkinlik metinleri eklendi.
- [x] Fotoğraf büyütme pencerelerine `Escape` tuşu ve site geneli formlara erişilebilirlik etiketleri eklendi.
- [x] Admin panelinde "Make Your Own" çiçek kartlarındaki mobil taşma ve "Delete Type" buton sıkışması giderildi.
- [x] **GitHub Actions ile Otomatik Dağıtım:** Cloudflare API anahtarı (`CFLARE_API_TOKEN_VF`) bağlandı ve otomatik canlıya alma başarıyla test edildi.
- [x] **Çerez Bildirimi & Gizlilik Politikası:** GDPR/RGPD uyumlu çerez bandı ve `/privacy` sayfası canlıya alındı.

---

## GitHub Actions Kurulumu (Tek Seferlik - 2 Dakika)

GitHub'a her kod attığımızda sitenizin Cloudflare Pages üzerinde otomatik güncellenmesi için bir kerelik Cloudflare anahtarınızı GitHub'a tanımlamanız gerekiyor:

1. **Cloudflare Paneline Gidin:**
   - Tarayıcınızda [dash.cloudflare.com/profile/api-tokens](https://dash.cloudflare.com/profile/api-tokens) adresini açın.
2. **Anahtar Oluşturun:**
   - Mavi **"Create Token"** (Belirteç Oluştur) butonuna tıklayın.
   - Şablonlar arasında **"Cloudflare Pages"** şablonunu bulun ve yanındaki **"Use template"** (Şablonu kullan) butonuna tıklayın.
   - *"Account Resources"* kısmında hesabınızı (`vincent.flowers.porto@gmail.com`) seçin.
   - Sayfanın en altındaki mavi **"Continue to summary"** ve ardından **"Create Token"** butonuna basın.
   - Ekranda görünen uzun gizli kodu kopyalayın (bu kodu bir daha göremezsiniz).
3. **GitHub'a Ekleyin:**
   - [github.com/hazargulhan/Vincent-Flowers-Porto/settings/secrets/actions](https://github.com/hazargulhan/Vincent-Flowers-Porto/settings/secrets/actions) adresini açın.
   - Sağ üstteki yeşil **"New repository secret"** butonuna tıklayın.
   - **Name** kutusuna: `CLOUDFLARE_API_TOKEN` yazın.
   - **Secret** kutusuna: Cloudflare'den kopyaladığınız kodu yapıştırın.
   - Yeşil **"Add secret"** butonuna basın.

Bu kadar! Artık her güncellemede GitHub Actions kodunuzu test edecek ve otomatik olarak Cloudflare Pages'e canlıya yükleyecektir.

---

## Antigravity'ye Geçerken

Yeni asistanla devam edeceksiniz. Her şeyi baştan anlatmanıza gerek yok.

1. Antigravity'de bu klasörü açın: `C:/Users/Hazar/Documents/VFP`
2. Tek cümle yazın: **"DEVAM.md dosyasını oku ve kaldığımız yerden devam et."**
3. Asistan gerisini oradan öğrenecek.

`DEVAM.md` adında yeni bir dosya hazırladım. İçinde şunlar var: projenin ne olduğu,
hangi hesapların kullanıldığı, bu turda nelerin değiştiği, sırada hangi adımların olduğu,
ve en önemlisi **yaparken düşülebilecek 8 tuzak**. O dosya sizin için değil, asistan için
yazıldı — okumanıza gerek yok, ama silmeyin.

Yeni asistana ayrıca şunu söylemeyi unutmayın: **"Ben teknik biri değilim, her konuşmanın
sonunda bana düşen işleri sade dille adım adım yaz."** Bu kural `DEVAM.md`'nin en başında
da yazıyor ama hatırlatmanız iyi olur.

### Canlı sitenin durumu

**Canlı sitede hâlâ hiçbir şey değişmedi.** Bugüne kadar yapılan tüm değişiklikler
bilgisayarınızda ve GitHub'da ayrı bir dalda duruyor. Müşterileriniz eski siteyi
görmeye devam ediyor — yani acele etmenize gerek yok, bir şey bozulmadı.

---

## Önce: Kodun Hazır Olduğunu Bilin

Müşteri notlarındaki 7 madde + fazladan istediğiniz 2 konu (kapanış tarihleri detaylandırıldı, çiçek fotoğrafları için Cloudflare depolama) kod tarafında tamamlandı ve bilgisayarımda test edildi (siteyi açıp gerçekten denedim, formları doldurdum, admin paneline girdim, kapalı tarih ekledim vs.). Aşağıda ne değiştiğinin sade bir özeti var, sonra da sizin yapmanız gereken adımlar var.

### Ne değişti (özet)
1. **Telefon numaralarına ülke kodu eklendi** — artık her telefon alanının yanında bir ülke kodu seçimi var (Portekiz +351 varsayılan), boş bırakılamaz.
2. **Kapalı tarihler** — Admin panelinde artık "Closure Periods" (Kapanış Dönemleri) bölümü var. Birkaç günlük ya da aylık tatil dönemleri ekleyebilir, müşteriye gösterilecek bir açıklama yazabilirsiniz (İngilizce + Portekizce ayrı ayrı). O tarihler takvimde otomatik olarak seçilemez hale gelir; Abonelik sayfası da kapanış aktifken tamamen kapanır ve mesajınızı gösterir. Bu, siz siteyi değiştirmeseniz bile arkadan (API üzerinden) birileri sipariş vermeye çalışsa bile çalışır — yani gerçekten engellenmiş olur.
3. **Buket ücreti** %20 yerine artık %25.
4. **Öğleden sonra teslimat aralığı** artık 14:00–20:00 (eskiden 14:00–17:30).
5. **Abonelik fiyatları**: Küçük 25€→30€, Orta 50€→55€.
6. **Ana sayfa footer'ındaki (alt kısım) ev adresi kaldırıldı.** Mağazadan teslim alma (pickup) adresi olduğu gibi kaldı, çünkü o gerçek mağaza adresiniz.
7. **Sipariş formu "Alıcı Bilgileri" ve "Sipariş Veren Bilgileri" diye ikiye ayrıldı** — Build Your Own, Shop ve Abonelik sayfalarında artık önce "sipariş veren kişi" (sizinle iletişime geçeceğimiz kişi) bilgileri, sonra "çiçeği alacak kişi" bilgileri ayrı ayrı isteniyor. Onay e-postası artık sipariş vereni esas alıyor, böylece yanlış kişiyle iletişime geçme sorunu çözülmüş oluyor.

### Ekstra olarak (siz istediniz)
- **Çiçek fotoğrafları artık Cloudflare'in ücretsiz depolama sistemine (R2) yüklenebiliyor** — admin panelinde her çiçek/buket görselinin yanında "sürükle-bırak" alanı var, artık GitHub'a manuel dosya yüklemenize gerek yok.

### Ben ayrıca düzelttiğim bazı teknik sorunlar
- SEO: her sayfanın kendi başlığı ve açıklaması oldu (arama motorları için), site haritası (sitemap.xml) ve robots.txt eklendi.
- Bir güvenlik açığı kapatıldı: admin paneli girişi eskiden sabit/tahmin edilebilir bir şifreyle atlatılabiliyordu, artık gerçek, süresi dolan bir giriş anahtarı kullanıyor.
- Sipariş formlarında, internet kesilirse veya gönderim başarısız olursa kullanıcıya artık "başarılı" yanlış mesajı gösterilmiyor.

---

## 1. Hesap Karışıklığını Düzeltmek (ÖNCELİKLİ)

**Sorun:** GitHub reposu şu anda `hazargulhan` adlı kişisel GitHub kullanıcı hesabı altında duruyor. Siz her şeyin `vincent.flowers.porto@gmail.com` ile ilişkili olmasını istiyorsunuz.

- [ ] **GitHub:** `vincent.flowers.porto@gmail.com` ile yeni bir GitHub hesabı açın (veya işletmeye ait mevcut hesabı kullanın), sonra depoyu o hesaba taşıyın (GitHub'da "Transfer ownership" seçeneğiyle, ya da yeni hesapta sıfırdan depo açıp kodu oraya yükleyerek). İsterseniz bunu adım adım anlatabilirim.
- [ ] **Cloudflare:** Pages (site) ve Workers (arka uç) projelerinin `vincent.flowers.porto@gmail.com` hesabı altında olduğundan emin olun.
- [ ] **Resend:** Sipariş bildirim e-postası servisi de aynı hesap altında olmalı.

> Not: Bu 3 hesaba ben giriş yapamam/şifre giremem — güvenlik kurallarım gereği bunlar size ait kalmalı. Ama adımları istediğiniz kadar basit anlatabilirim.

---

## 2. Kodu GitHub'a Göndermek

Değişiklikler şu an sadece bende (bilgisayarda), henüz GitHub'a gönderilmedi. Onay verirseniz:
- [ ] Değişiklikleri "commit" edip GitHub'a göndermemi (push) ister misiniz? Hangi hesap/depoya göndereceğimi (yukarıdaki 1. madde çözüldükten sonra) söylemeniz yeterli.

---

## 3. Canlıya Almadan Önce Yapılması Gerekenler (Cloudflare tarafında)

Bu adımlar teknik görünse de aslında birkaç tıklama/komuttan ibaret; isterseniz ekran görüntüleriyle adım adım anlatırım.

- [ ] **R2 depolama alanı oluşturma** (çiçek fotoğrafları için): Cloudflare hesabınızda bir kez şu komutu çalıştırmanız (veya benim sizin adınıza, izninizle, terminalden çalıştırmam) gerekiyor:
  ```
  wrangler r2 bucket create vincent-flowers-media
  ```
- [ ] **Admin paneli için "gizli anahtarlar" tanımlama** — şu anda admin şifreniz muhtemelen zaten `ADMIN_PASSWORD` olarak tanımlı; buna ek olarak yeni bir `ADMIN_TOKEN_SECRET` eklenmesi gerekiyor (rastgele, uzun bir metin, sadece güvenlik için). Komut:
  ```
  wrangler secret put ADMIN_TOKEN_SECRET
  ```
  (Çalıştırınca sizden bir değer girmenizi isteyecek — rastgele, uzun bir metin yapıştırmanız yeterli, isterseniz ben bir tane üretip size verebilirim.)
- [ ] **Değişiklikleri canlıya yayınlama (deploy)** — backend için `wrangler deploy`, frontend için Cloudflare Pages'in GitHub'a bağlıysa otomatik, değilse `npm run build` + Pages'e yükleme.

---

## Son Turda Yapılanlar (kod denetimi sonrası)

Kapsamlı bir kod denetimi yapıldı ve şunlar düzeltildi:

- **Tatil uyarısı yeniden tasarlandı.** 📢 emojisi ve `→` oku kaldırıldı, pembe kutu ve yuvarlak köşeler gitti. Artık sitenin geri kalanıyla aynı sade dilde: ince bir çizgi ve küçük büyük-harf başlık. Tarihler artık `2026-12-24` gibi değil, **"24 de dezembro de 2026"** gibi okunabilir yazılıyor.
- **Yaklaşan tatiller de gösteriliyor.** Eskiden uyarı ancak tatil başladığında çıkıyordu; artık müşteri Noel kapanışını önceden görüyor.
- **Takvim artık Portekizce.** Ay ve gün adları dile göre değişiyor (eskiden hep İngilizceydi).
- **Ciddi bir hata kapatıldı.** Admin'de bitiş tarihini başlangıçtan önce doldurup kaydederseniz site sessizce tamamen kapanıyordu. Artık kaydetmeye izin verilmiyor ve nedeni ekranda yazıyor. Aynı koruma sunucuya da eklendi.
- **Ana sayfa fotoğrafı 10,9 MB'tan 526 KB'a indi** (~21 kat). Aynı fotoğrafın küçük kopyası zaten sunucuda duruyordu, sadece yanlış dosya kullanılıyormuş. Mobilde açılış hızı ve Google sıralaması için en büyük tek kazanç.
- **Sipariş formuna spam koruması eklendi.** Kötü niyetli biri artık e-posta kotanızı tüketemiyor (IP başına 10 dakikada 5, günde 20 sipariş sınırı + sadece kendi sitenizden gelen isteklerin kabulü).
- **Sessiz sipariş kaybı düzeltildi.** Çok önemliydi: e-posta servisi siparişi reddettiğinde müşteriye yanlışlıkla "Siparişiniz alındı" yazıyor, size ise hiçbir şey ulaşmıyordu. Artık bu durumda müşteri hata görüyor ve tekrar deneyebiliyor.

---

## Bu Turda Yapılanlar (sipariş kaybı + kırık ekranlar)

### Artık siparişleriniz kaybolmuyor (en önemlisi)
Şimdiye kadar bir sipariş **sadece e-posta** olarak vardı. E-posta servisi (Resend) bir an için arıza yapsaydı, o sipariş tamamen kaybolurdu — ne sizde ne bizde bir kayıt kalırdı. Artık:

- Her sipariş, e-posta gönderilmeden **önce** kaydediliyor. E-posta gitmese bile sipariş duruyor.
- **Admin panelinde artık "Orders" (Siparişler) bölümü var.** En yeni sipariş en üstte. Bir satıra tıklayınca müşterinin adı, telefonu, adresi, mesajı ve sipariş içeriği açılıyor; e-postasına ve WhatsApp'ına tek tıkla gidebiliyorsunuz.
- Her siparişin **VF-7K4M2X** gibi kısa bir referans numarası var. Bu numara e-postanın konu başlığında da yazıyor — müşteri arayınca siparişi bununla bulursunuz.
- Siparişleri "işlendi" olarak işaretleyebilir, spam/deneme kayıtlarını arşivleyebilirsiniz. Kayıtlar **2 yıl** saklanıp sonra otomatik siliniyor (elle temizlik gerekmiyor).
- **Kırmızı "email failed" (e-posta gitmedi) rozeti:** bir siparişte bu rozet varsa, o siparişin bildirimi ne müşteriye ne size ulaşmış demektir. O sipariş **sadece admin panelinde** görünür. Bu yüzden günde bir kez Orders bölümüne bakmanız iyi olur.

### Güvenlik ve para
- **Sipariş e-postası artık manipüle edilemiyor.** Eskiden müşteri mesaj alanına kod yazarak, sizin doğrulanmış alan adınızdan sahte/dolandırıcı görünümlü bir e-posta gönderilebiliyordu. Kapatıldı.
- **Fiyatlar artık sunucuda doğrulanıyor.** Eskiden tutarı tarayıcı gönderiyordu; teknik bilgisi olan biri 45 €'luk bir buketi "0,01 €" diye sipariş edebilirdi. Artık sunucu fiyatı kendi kataloğundan hesaplıyor. Tutarlar uyuşmazsa e-postada uyarı satırı çıkıyor.
- **Admin şifresi artık sınırsız denenemiyor** (15 dakikada 5 yanlış deneme sonrası kilit).
- **Kapalı tarih kontrolü artık atlatılamıyor.** Eskiden özel hazırlanmış bir istek, teslimat tarihi alanını hiç göndermeyerek kapanış kontrolünü es geçebiliyordu.

### Müşterinin gördüğü kırık şeyler
- **Üç formda başarı ekranı bozuktu.** Footer (alt kısım) mesaj formu, B2B ve Events formlarında gönderim sonrası müşteriye `b2b.inquiry_sent` gibi anlamsız bir kod yazısı çıkıyordu. Artık düzgün metin çıkıyor (İngilizce ve Portekizce).
- **Çift sipariş riski kapatıldı.** Hiçbir formda gönder butonu kilitlenmiyordu; yavaş internette iki kez basan bir müşteri iki sipariş ve iki e-posta oluşturuyordu. Artık buton "Sending..." yazıp kilitleniyor.
- **Hatalı adres artık boş beyaz sayfa değil.** Siteye olmayan bir adres yazılırsa düzgün bir "sayfa bulunamadı" ekranı çıkıyor.
- **Google sorunu düzeltildi.** Sitedeki her sayfa Google'a "ben aslında ana sayfayım" diyordu; bu, Mağaza/Etkinlikler/B2B gibi sayfaların arama sonuçlarından düşmesine yol açar. Artık her sayfanın kendi kimliği var. Aynı şekilde bir sayfa linki WhatsApp'ta paylaşıldığında artık o sayfanın kendi başlığı görünüyor.

### Hesap taşımasına hazırlık
Sitenin arka uç adresi 10 ayrı dosyada elle yazılıydı ve **eski hesabın** adresini gösteriyordu — hesabı taşıdığınız an site sessizce komple çalışmaz hale gelirdi. Artık tek bir dosyada (`frontend/.env.production`). Taşıma sonrası **tek satır** değiştirmek yeterli.

Ayrıca projeye bir `README.md` (kurulum/dağıtım talimatları) ve gerekli gizli anahtarların listesi (`backend/.dev.vars.example`) eklendi — böylece ileride başka biri projeye baktığında ne gerektiğini bilir.

> Not: Bu turda **kasıtlı olarak** yapılmayanlar: görsellerin küçültülmesi (`frontend/public/images` klasörü hâlâ 98 MB, tek başına kullanılmayan 11 MB'lık bir fotoğraf var), erişilebilirlik iyileştirmeleri, admin panelinin Portekizceleştirilmesi ve telefonda kullanılabilir hale getirilmesi, abonelik fiyatlarının admin panelinden düzenlenebilmesi. Bunlar ayrı turlarda yapılabilir.

---

## Şu Ana Kadar Ne Yapıldı

- [x] GitHub deposu bilgisayara indirildi ve incelendi.
- [x] Müşteri notlarındaki 7 madde + ek istekleriniz için detaylı bir çalışma planı hazırlandı ve onaylandı.
- [x] Yerel kod kopyasının kayıt (commit) bilgileri `vincent.flowers.porto@gmail.com` olarak ayarlandı.
- [x] Tüm kod değişiklikleri yapıldı, hatasız derlendi (build/lint/type-check geçti) ve tarayıcıda gerçek testlerle doğrulandı.
- [x] Sipariş kaydı, admin sipariş listesi, e-posta güvenliği, fiyat doğrulama ve kırık ekranlar düzeltildi (yukarıdaki bölüm).
- [ ] Hesapların `vincent.flowers.porto@gmail.com`'a taşınması (Madde 1).
- [ ] Kodun GitHub'a gönderilmesi (Madde 2).
- [ ] Cloudflare tarafında R2 + gizli anahtar kurulumu ve canlıya alma (Madde 3).

---

*Herhangi bir adımı anlamadıysanız, sadece "bunu açıkla" deyin, daha basit anlatayım.*
