# Vincent Flowers Porto - Project Context

Bu dosya, projenin mevcut durumunu, mimari kararları ve gelecek planlarını takip etmek amacıyla oluşturulmuştur.

## 1. Projenin Amacı
Vincent Flowers, Porto merkezli yerel bir çiçekçinin (Vincent Flowers) dijital dünyadaki yüzüdür. Projenin temel amacı, müşterilere "botanik bir kitap" estetiğinde, minimalist ve premium bir alışveriş deneyimi sunmaktır. 

**Temel Vizyon:**
- Minimalist ve temiz bir "Botanical Book" estetiği (Times New Roman, Marcellus fontları).
- Kullanıcıların kendi buketlerini tasarlayabildiği ("Make Your Own") interaktif bir platform.
- Cloudflare ekosistemi kullanılarak düşük maliyetli ve yüksek performanslı çalışma.

---

## 2. Teknoloji Yığını (Tech Stack)

### Frontend
- **Framework:** React 19 (Vite)
- **Dil:** TypeScript
- **Stil Yönetimi:** Vanilla CSS (Özel tasarlanmış, premium animasyonlar ve responsive layout).
- **Yönlendirme:** React Router DOM v7
- **Uluslararasılaştırma (i18n):** i18next (İngilizce ve Avrupa Portekizcesi).
- **İkonlar:** Lucide React

### Backend
- **Platform:** Cloudflare Workers
- **Framework:** Hono
- **Dil:** TypeScript
- **Araçlar:** Wrangler (CLI)

---

## 3. Şu Ana Kadar Tamamlanan Özellikler

### Kullanıcı Arayüzü (UI/UX)
- [x] **Premium Tasarım:** Marcellus serif font kullanımı, yumuşak geçişler ve "Noise Filter" arka plan efekti.
- [x] **Responsive Tasarım:** Mobil öncelikli (Mobile-first) yaklaşım. Tüm sayfalar mobil ve masaüstü uyumlu.
- [x] **Landing Page:** Dikkat çekici giriş ekranı.
- [x] **Frozen Scrolling:** Shop ve Subscription sayfalarında aşamalı ("donmuş") kaydırma deneyimi.

### Sayfalar ve Modüller
- [x] **Shop:** Hazır aranjmanlar listesi ve satın alma akışı.
- [x] **Subscription:** Çiçek aboneliği (haftalık/aylık) seçenekleri.
- [x] **Events & B2B:** Kurumsal hizmetler ve etkinlikler için özel sayfalar.
- [x] **Bouquet Builder (Home/Shop):** Kullanıcıların interaktif olarak çiçek seçip buket oluşturabildiği modül.
- [x] **About & FAQ:** Bilgilendirme sayfaları.

### Altyapı
- [x] **Bilingual Support:** Tüm metinlerin i18next kancalarıyla (t hooks) sistemize edilmesi (EN/PT).
- [x] **API Entegrasyonu:** Hono tabanlı temel backend endpoint'leri (Envanter, Sipariş süreci).
- [x] **Gerçek E-posta Entegrasyonu:** Resend üzerinden çift dilli (EN/PT) sipariş bildirim sisteminin aktif hale getirilmesi.
- [x] **Git & GitHub:** Projenin GitHub reposuna aktarılması ve CI/CD süreçleri için hazır hale getirilmesi.
- [x] **Admin Girişi:** Temel şifre korumalı (admin auth) ön hazırlık.

---

## 4. Bilinen Mevcut Hatalar / Eksikler
- [ ] **Canlı Ödeme Sistemi:** Ödeme altyapısı (Stripe vb.) henüz entegre edilmedi (Siparişler şu an form tabanlı/iletişim odaklı).
- [ ] **Envanter Yönetimi Arayüzü:** Admin panelinin envanter güncelleme (fiyat/stok) kısmı henüz tam işlevsel değil.
- [ ] **SEO Meta Tagları:** Her sayfa için dinamik meta verileri (OpenGraph/SEO) eklenmeli.

---

## 5. Bir Sonraki Adımda Yapılacaklar
1. **Deploy Süreci:** Frontend'in Cloudflare Pages'e, Backend'in Cloudflare Workers'a kalıcı olarak dağıtılması.
2. **SEO Optimizasyonu:** Sayfa bazlı meta descriptions ve title tag'lerinin optimize edilmesi.

---

## 6. Kodlama Standartlarımız
- **Dil:** Standart olarak İngilizce (Kod, yorum satırları ve değişken isimleri).
- **React:** Fonksiyonel bileşenler (Functional Components) ve Hook kullanımı.
- **CSS:** BEM benzeri isimlendirme veya modüler yapı yerine merkezi ve hiyerarşik Vanilla CSS. Global değişkenler (`--accent-color` vb.) kullanımı zorunludur.
- **TypeScript:** `any` kullanımından kaçınılmalı, tip tanımlamaları (`interface`/`type`) her zaman yapılmalıdır.
- **i18n:** JSX içinde hardcoded string kesinlikle bırakılmamalı, her metin `i18n.t()` üzerinden çağrılmalıdır.
- **Clean Code:** DRY (Don't Repeat Yourself) prensibi bileşen bazlı mimaride korunmalıdır.
