
<div align="center">

# 🏛️ UNIVO
### *Kampüsün Dijital Kalbi*

[![Next.js](https://img.shields.io/badge/Next.js-15.0-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-Styling-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Sürüm](https://img.shields.io/badge/Sürüm-v1.3.0_Release-blue?style=for-the-badge&logo=github)](https://github.com/univo-tech-dev/univo-tech-dev)

<!-- Language Switcher -->
<p align="center">
  <a href="README.md">
    <img src="https://img.shields.io/badge/English-Switch_to_English-0056D2?style=for-the-badge&logo=google-translate&logoColor=white" alt="Switch to English">
  </a>
  <a href="README.TR.md">
    <img src="https://img.shields.io/badge/Türkçe-Aktif-2ea44f?style=for-the-badge&logo=google-translate&logoColor=white" alt="Türkçe">
  </a>
</p>

<p align="center">
  <img src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbmV3bWY3cW55cnZ5b3Z5b3Z5b3Z5b3Z5b3Z5b3Z5b3Z5b3Z5b3Z/xTiTnxpQ3ghPiB2Hp6/giphy.gif" width="100%" alt="Univo Banner Animation">
  <!-- (Placeholder for actual demo GIF if available in future) -->
</p>

---

## 🚀 Sürüm Notları: v1.3.0 → v1.3.1 (Veri Bütünlüğü ve Domain)
**📅 21 Ocak 2026**

Bu güncelleme, özel Veri Göçü Motoru, ODTÜClass entegrasyonu ve `univo.com.tr` alan adı altyapısının resmi açılışıyla platformun geleceğini güvence altına alıyor.

### ✨ Öne Çıkan Değişiklikler
- **💾 Veri Göçü Motoru (Legacy Recovery):**
    - **Sıfır Veri Kaybı:** Eski sistemden kalan verileri kurtaran ve yeni hesaplara bağlayan özel bir motor (`migrate-full-data.js`) geliştirildi.
    - **Akıllı Eşleştirme:** Kullanıcıları e-posta ile eşleştirerek "Yeni UUID" sorununu çözdü ve geçmiş verilerin sahipliğini geri kazandırdı.
- **🏛️ Derin ODTÜClass Entegrasyonu:**
    - **Canlı Ders Senkronizasyonu:** **Aktif Ders Programınızı** senkronize etmek için ODTÜClass'a bağlanır.
    - **Akıllı Kimlik:** Öğrenci durumunu doğrular ve bölüm/sınıf bilgilerini otomatik günceller.
- **🛡️ Kurumsal Domain Lansmanı:**
    - **univo.com.tr:** Özel alan adı resmen devreye alındı.
    - Yüksek teslimat oranlı e-postalar için DKIM/SPF doğrulamalı **Resend** entegrasyonu yapıldı.
- **🔐 Yetkilendirme Güçlendirmesi:**
    - **Büyük/Küçük Harf Düzeltmesi:** Çift hesap oluşumunu engellemek için giriş mantığı normalize edildi.
    - **Kimlik Füzyonu:** Üniversite kimlik bilgilerini Supabase oturumlarıyla sorunsuz birleştirir.

### 🛠️️ Teknik İyileştirmeler (Changelog)
> **v1.3.1**
> * `feat(migration)`: Yinelemeli tablo ve depolama göçü için `migrate-full-data.js` uygulandı.
> * `feat(integration)`: `metu/route.ts` dosyasına ODTÜClass scraper eklendi.
> * `feat(infra)`: `univo.com.tr` için Resend DNS kayıtları yapılandırıldı.
> * `style(ui)`: Profil verisi onayı için üniversite temalı "Tespit Kartı" eklendi.

---

## 🚀 Sürüm Notları: v1.2.0 → v1.3.0 (Küresel Genişleme)
**📅 20 Ocak 2026**

Bu güncelleme, **kurumsal düzeyde bir organizasyona** geçişimizi simgeler; ekosistemi birleştirir ve küresel erişimi başlatır.

### ✨ Öne Çıkan Değişiklikler
- **🏛️ Kapsamlı Göç ve Merkezi Yönetim:**
    - Kod tabanı `univo-tech-dev` **GitHub Organizasyonu** altında birleştirildi.
    - 29 senkronize tablosu olan özel bir **Supabase** örneğine geçildi.
- **👤 Üst Seviye Misafir Modu (Global Erişim):**
    - Kayıtlı olmayan kullanıcılar artık **Global** kampüs içeriğine göz atabilir.
    - Üniversiteye özel akışlar (ODTÜ/Bilkent) gizlilik için kısıtlı kalır.
- **🏫 Çoklu Üniversite Mimarisi:**
    - **Akıllı Üniversite Algılama:** Kayıt sırasında üniversite otomatik tanımlanır (`@metu.edu.tr`, `@bilkent.edu.tr`).
    - **Bilkent Entegrasyonu:** Bilkent Üniversitesi altyapısı için tam destek eklendi.
- **🛡️ Arayüz Kararlılığı:**
    - **Sıfır Beklemeli Yönlendirme:** "Yükleniyor ekranında takılma" sorunu giderildi.
    - **Bütünleşik İskeletler:** Premium bir his için yükleme ekranları harmonize edildi.

### 🛠️ Teknik İyileştirmeler (Changelog)
> **v1.3.0**
> * `feat(ux)`: `HomeContent` sonsuz yükleme döngülerini önleyecek şekilde yeniden yazıldı.
> * `style(views)`: Görünümler yetkisiz oturumlar için Global Modu zorunlu kılacak şekilde güncellendi.
> * `chore(github)`: Remote repo organizasyon deposuna taşındı.

---

## 🚀 Sürüm Notları: v1.1.0 → v1.2.0
**📅 18 Ocak 2026**

Bu güncelleme, **medya tüketimi** için dev bir adım atıyor; uyumluluk sorunlarını çözen ve birinci sınıf, sürükleyici bir akış deneyimi sunan stüdyo kalitesinde bir video motoru tanıtıyor.

### ✨ Öne Çıkan Değişiklikler
- **🎥 Evrensel Video Motoru (FFmpeg Wasm):**
    - "Format Desteklenmiyor" hatasına elveda. Artık iPhone (HEVC) ve yüksek bit hızlı videolar için **istemci taraflı transcoding** yapıyoruz.
    - Tüm yüklemeler, sunucuya ulaşmadan önce otomatik olarak evrensel uyumlu MP4/H.264 formatına dönüştürülür.
- **📱 Akıllı Otomatik Oynatma Akışı:**
    - Akış artık canlı hissettiriyor. Videolar ekranınızın merkezine geldiklerinde **otomatik olarak oynamaya** başlar.
    - **Tekil Odak:** Aynı anda sadece bir video oynar. Ekranı kaydırdığınız anda durur, veri ve pil tasarrufu sağlar.
    - **Nazik Oynatma:** Çevrenizi rahatsız etmemek için videolar varsayılan olarak sessiz başlar.
- **🎨 Adaptif Oynatıcı Arayüzü:**
    - Video oynatıcı artık "ruhsuz" değil. Kontroller (ses, ilerleme çubuğu) artık **Üniversitenizin Tema Rengini** (ODTÜ için Kırmızı, vb.) dinamik olarak benimser.
    - Sabit en-boy oranları sayesinde artık "kesilmiş kedi kafaları" yok—dikey videolar akıllı kapsama ile mükemmel görüntülenir.

### 🛠️ Teknik İyileştirmeler (Changelog)
> **v1.2.0**
> * `feat(video)`: Sağlam istemci taraflı dönüştürme için `ffmpeg.wasm` (20MB+ lazy-loaded) entegre edildi.
> * `feat(ux)`: Güvenilir otomatik oynatma/duraklatma için `useRef` kısıtlamalarına sahip `IntersectionObserver` mantığı uygulandı.
> * `style(player)`: `VideoPlayer`, temalı kontroller için CSS değişkenlerini (`--primary-color`) kullanacak şekilde yeniden düzenlendi.
> * `fix(build)`: FFmpeg uygulamasındaki `FileData` için TypeScript tip dönüşüm hataları çözüldü.
> * `fix(mobile)`: iOS/Chrome otomatik oynatma politikalarını karşılamak için katı tipli `muted` öznitelikleri zorunlu kılındı.

---

## 🚀 Sürüm Notları: v1.0.2 → v1.1.0
**📅 16 Ocak 2026**

Bu büyük güncelleme, topluluğun raporlama ve yasaklama sistemleri aracılığıyla güvende kalmasını sağlayan **Moderasyon Paketi**'nin yanı sıra önemli yönetici aracı iyileştirmelerini de içeriyor.

### ✨ Öne Çıkan Değişiklikler
- **🚩 İçerik Şikayet Sistemi:**
    - Kullanıcılar artık uygunsuz gönderi veya yorumları şikayet edebilir.
    - Yöneticilerin şikayetleri incelemesi ve çözmesi için özel bir **"Şikayetler"** paneli eklendi.
- **🚫 Kullanıcı Yasaklama Altyapısı:**
    - Kategorize edilmiş (Spam, Taciz, vb.) kapsamlı yasaklama sistemi.
    - Özel yasaklama nedenleri ve kısıtlanmış kullanıcılar için özel **Yasaklanma Ekranı**.
- **🛠️ Admin Paneli Evrimi:**
    - **Dinamik Sidebar:** Navigasyon linkleri artık odak vurgulaması ile aktif sayfayı doğru şekilde yansıtıyor.
    - **Merkezi Tasarım:** Sidebar başlıkları artık mükemmel hizalanmış, zarif serif tipografisi kullanıyor.
    - **Tema Uyumu:** Ayarlardaki "Yönetim Paneli" ikonu artık tamamen tema duyarlı (koyu/açık).
- **⚡ UX & Performans:**
    - **Sıfır Flash Skeletons:** Giriş ve admin sayfalarındaki "flicker" (iskelet yükleyici yanıp sönmesi) ortadan kaldırıldı.
    - **Auth Sync:** Sorunsuz giriş geçişleri sağlamak için yönetici çerezi (cookie) akışları senkronize edildi.

### 🛠️ Teknik İyileştirmeler (Changelog)
> **v1.1.0**
> * `feat(mod)`: `ReportContext`, `ReportModal` ve yönetici şikayet çözüm akışı uygulandı.
> * `feat(auth)`: `univo_admin_session` çerez promosyonu ve oturum senkronizasyonu eklendi.
> * `feat(admin)`: Dinamik yol takibi için `AdminSidebar` istemci bileşeni oluşturuldu.
> * `fix(ui)`: İstenmeyen Suspense geri dönüşlerini önlemek için `pathname` kontrolleri üst seviye `Header`'a taşındı.
> * `refactor`: `AdminLayout` ve `DashboardLayout` genelinde kenar çubuğu başlığı düzenleri birleştirildi.

---

## 🚀 Sürüm Notları: v1.0.1 → v1.0.2
**📅 11 Ocak 2026**

Bu güncelleme; tam kararlılık, sosyal özellikler ve görsel mükemmeliyet üzerine odaklanmaktadır.

### ✨ Öne Çıkan Değişiklikler
- **🔍 Kapsamlı Encoding Denetimi (%100 Temiz):**
    - Kritik tüm dosyalarda (`VoiceView.tsx`, `CommentSystem.tsx`, `VoiceStatsWidget.tsx`) satır satır manuel denetim uygulandı.
    - Tüm karakter bozulması kalıntıları tamamen temizlendi.
- **👥 Sosyal Entegrasyon & Profil Erişimi:**
    - Paylaşımların ve yorumların 3 nokta menüsüne **"Arkadaş Ekle"** ve **"Profili Gör"** butonları eklendi.
    - Standart Sosyal UI: Profil ziyaret butonu, uygulama genelindeki sosyal aksiyon butonlarıyla estetik olarak eşitlendi.
- **🛡️ Güçlendirilmiş Sahiplik Kontrolü:**
    - "Düzenle" ve "Sil" seçenekleri, karmaşayı önlemek ve yanlış tetiklemeleri engellemek için sadece içerik sahiplerine görünür kılındı.
- **🎨 Threading ve Arayüz Düzeltmeleri:**
    - **Dinamik Bağlantılar**: Yorum dallarındaki dikey çizgi uzama sorunu (rail bleeding) giderildi; çizgi artık içeriğe göre dinamik ölçekleniyor.
    - **Dayanıklı Hashtagler**: Regex yapıları Unicode kaçış dizileriyle (`\uXXXX`) güncellenerek kalıcı encoding kararlılığı sağlandı.

### 🛠️ Teknik İyileştirmeler (Changelog)
> **v1.0.2**
> * `feat(social)`: `FriendButton` ve Profil linkleri ortak 3 nokta menülerine entegre edildi.
> * `fix(ui)`: `VoiceView` avatar sütunundaki `h-56` kısıtı kaldırılarak dikey çizgi taşma sorunu çözüldü.
> * `fix(encoding)`: Kapsamlı manuel audit tamamlandı; tüm bozuk karakterler UTF-8 karşılıklarıyla güncellendi.
> * `refactor`: `CommentItem` ve `VoiceItem` arasındaki buton stilleri ve isimlendirmeleri (casing) tek tipleştirildi.



## 🚀 Sürüm Notları: v1.0.0 → v1.0.1
**📅 10 Ocak 2026**

Bugünkü güncellemeyle **Univo** çok daha stabil, hızlı ve kullanıcı dostu hale geldi. İşte **v1.0.1** ile gelen yenilikler:

### ✨ Öne Çıkan Değişiklikler
- **🎨 Kristal Netliğinde UI (Header Sync):**
    - PC başlığındaki (Header) ve sayfa gövdesi arasındaki milisaniyelik gecikme **tamamen yok edildi**.
    - Artık sayfa yüklenirken "beyaz flash" veya kayma olmuyor; `HeaderSkeleton` ve `!transition-none` optimizasyonları ile yağ gibi akan bir deneyim.
- **📝 Sorunsuz Post Düzenleme:**
    - Gönderilerinizi ve **#hashtaginizi** artık güvenle düzenleyebilirsiniz.
    - Sunucu tabanlı doğrulama sistemi eklendi: Sizin ekranınızda gördüğünüz, veritabanına giren veriyle birebir aynı.
- **⚡ Akıllı Gündem (Smart Agenda):**
    - Bir postu güncellediğinizde "Kampüste Gündem" (Sidebar) kartları anında, sayfa yenilenmesine gerek kalmadan kendini günceller.
- **🧹 Proje Temizliği:**
    - Kök dizindeki onlarca geçici dosya ve log temizlendi. SQL dosyaları `database/` altına, eski assetler `archive/` altına taşındı.

### 🛠️ Teknik İyileştirmeler (Changelog)
> **v1.0.1**
> * `fix(ui)`: PC Header geçiş animasyonları kaldırılarak senkronizasyon sağlandı.
> * `feat(skeleton)`: `HeaderSkeleton`, `VoiceViewSkeleton`, `CommunityViewSkeleton` bileşenleri eklendi.
> * `fix(api)`: `PUT /api/voices/[id]` endpoint'inden `.single()` kaldırılarak "Cannot coerce..." hatası çözüldü.
> * `fix(frontend)`: `VoiceView` içinde edit sonrası anlık state güncellemesi (Optimistic Update -> Server Confirmation).
> * `chore`: Proje dosya yapısı temizlendi, gereksiz `.sql` ve loglar ayrıştırıldı.

---

## 🎉 İlk Sürüm: v1.0.0 (MVP)
**📅 9 Ocak 2026**

Univo'nun doğuşu. Kampüs deneyimini dijitalleştiren ilk kararlı sürüm.

### 🏛️ Çekirdek Özellikler (Initial Release)
- **Kimlik Doğrulama:**
    - Google ile Tek Tıkla Giriş (Supabase Auth).
    - `@metu.edu.tr` e-posta doğrulama desteği.
    - Profil oluşturma (Takma ad, Bölüm, Avatar).
- **Kampüsün Sesi (Beta):**
    - Anonim veya açık kimlikle gönderi paylaşımı.
    - Beğeni (Like/Dislike) ve Yorum sistemi.
    - "Editörün Seçimi" ve "Sıcak Gündem" filtreleri.
- **Topluluk Meydanı:**
    - Etkinlik listeleme ve detay görüntüleme.
    - "Katıl" butonu ile etkinliklere kayıt (RSVP).
    - Etkinlik kategorileri (Seminer, Parti, Kariyer).
- **Resmi Gündem:**
    - Yemekhane menüsü entegrasyonu (Anlık Veri).
    - Üniversite duyuruları ve akademik takvim.
- **Arayüz:**
    - Modern, duyarlı (Responsive) tasarım.
    - Karanlık/Aydınlık Mod desteği.
    - Alt navigasyon çubuğu ile kolay erişim (Mobil).

---

## 🌟 Temel Özellikler

### 📢 Kampüsün Sesi (Voices)
Öğrencilerin anonim veya açık kimlikle fikirlerini paylaştığı özgür alan.
- **Anonim Mod:** Kimliğinizi gizleyerek tartışmalara katılın.
- **Hashtag Desteği:** `#vize`, `#festival` gibi etiketlerle gündemi belirleyin.
- **Moderasyon:** Güvenli bir kampüs ortamı için otomatik ve manuel filtreler.

### 🏘️ Topluluk Meydanı (Community)
Kulüpler, topluluklar ve etkinliklerin buluşma noktası.
- **Etkinlik Kartları:** Tarih, yer ve detayları içeren şık kartlar.
- **Rozet Sistemi:** Katıldığınız etkinliklerle profilinizi "Topluluk Yıldızı"na dönüştürün.
- **Kategoriler:** Müzik, Bilim, Spor... İlgi alanınıza göre filtreleyin.

### 🏛️ Resmi Gündem (Official Agenda)
Üniversitemizden en son duyurular, yemekhane menüsü ve resmi haberler.
- **Yemek Menüsü:** Günün menüsünü fotoğraflı ve kalorili görün.
- **Akademik Takvim:** Kritik tarihleri asla kaçırmayın.
- **Önbellek (Caching):** İnternetiniz yavaş olsa bile son görüntülenen duyurulara anında erişin.

---

## 💻 Tech Stack
Bu proje modern web teknolojilerinin en güncel sürümleriyle inşa edilmiştir.

| Alan | Teknoloji | Notlar |
| :--- | :--- | :--- |
| **Frontend** | [Next.js 15 (App Router)](https://nextjs.org) | Server Components & Suspense |
| **Dil** | [TypeScript](https://www.typescriptlang.org/) | Tip güvenliği ve ölçeklenebilirlik |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) | Utility-first design & animate-shimmer |
| **Backend / DB** | [Supabase](https://supabase.com/) | PostgreSQL, Auth, Realtime, Storage |
| **State** | React Hooks & Context | Lightweight client state management |

---

## 🚀 Kurulum (Local Development)

Projeyi kendi bilgisayarınızda çalıştırmak için:

1.  **Repoyu Klonlayın:**
    ```bash
    git clone https://github.com/keremdogan1/univo-mvp.git
    cd univo-mvp
    ```

2.  **Bağımlılıkları Yükleyin:**
    ```bash
    npm install
    # veya
    bun install
    ```

3.  **Çevresel Değişkenler (.env.local):**
    Proje kök dizininde `.env.local` oluşturun ve Supabase anahtarlarınızı girin:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Uygulamayı Başlatın:**
    ```bash
    npm run dev
    ```
    Tarayıcınızda `http://localhost:3000` adresine gidin.

---

</div>
