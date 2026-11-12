# Değişiklik Günlüğü

Neuratal Code'un sürüm ve arayüz yenilemeleri bu dosyada tutulur.

---

## 2026-11-10 — Ayarlar, açılış ve sayacın güncellemesi

- Uygulama kapanıp yeniden açıldığı zaman her zaman Hoş Geldiniz sayfasıyla başlar.
- Sağlayıcılar ekranında Neuratal'ın kendi sağlayıcısının bağlantısı kesilemez; Modeller sayfasında Neuratal modelleri kapatılamaz.
- Tercihler sekmesi Görünüm sekmesi altında birleştirildi; tek bir Görünüm sayfası kaldı.
- Görünüm sekmesinden açık (light) modu kaldırıldı; renk şeması sadece sistem ve koyu.
- Hakkında sayfasına "OpenCode ekibine teşekkürler" satırı eklendi.
- What's new sayfasındaki ürün isimleri Neuratal Code ile uyumlu hale getirildi.
- Hamburger menüye "Ayarlar" son sıraya eklendi.
- Model picker'daki "Bu tamamı model kullan" işlevsiz toggle kaldırıldı; değişim yakında etiketi eklendi.
- Sağlayıcı logoları inline SVG olarak, marka renkleriyle gösteriliyor; anlaşılamayan sağlayıcılar baş harf avatarına düşüyor.
- Açılış ekranı Aurora temasıyla yeniden tasarlandı ve 2.5 sn minimum gösterilecek.

---
## 2026-11-10 — Wordmark Düzeltmesi

- Yeni sohbet ekranındaki Neuratal yazısı onaylı marka görseliyle değiştirildi;
  kelime logosu artık ortalanmış, doğru boyutta ve Nura maskotu ikinci "A"nın içinde.
- Kelime logosu açılırken üzerinden tek seferlik bir aurora parıltısı geçiyor;
  hareket azaltma tercihine saygı duyuyor.

---

## 2026-11-09 — Neuratal Code Yeniden Markalama

### Marka
- Uygulama genelinde eski marka adı Neuratal olarak yenilendi; görünen tüm başlık,
  düğme, bildirim, boş durum ve yasal metinler yeni markaya taşındı.
- Genel bağlantılar `neuratal.com` adresine yönlendirildi. Kimlik doğrulama,
  güncelleme ve sağlayıcı uç noktaları işlevsel adreslerinde bırakıldı.

### Neuratal Aurora
- Yeni varsayılan tema **Neuratal Aurora** oldu: derin uzay siyahı zemin,
  menekşe birincil renk, camgöbeği ikincil ve fuşya vurgu.
- Eski tema kimliği ve kayıtlı tercihler otomatik olarak yeni temaya taşınıyor.
- Tüm sabit turkuaz değerleri menekşe/camgöbeği paletine dönüştürüldü.

### Nura maskotu
- Nura, uygulamanın maskotu olarak eklendi: yeni oturum karşılama ekranında,
  ana ekran komuta güvertesinde, ilk asistan yanıtında ve boş durumlarda görünüyor.
- Maskot yavaşça süzülüyor, aurora parıltısı yayıyor ve ara ara göz kırpıyor;
  hareket azaltma tercihine saygı duyuyor.
- Wordmark, uygulama simgeleri, favicon ve web manifesti yeni kimlikle yenilendi.

### Başlatıcılar
- Linux ve Windows başlatıcıları `baslat_neuratal_code.sh` /
  `BASLAT_NEURATAL_CODE.bat` olarak yeniden adlandırıldı.

---

## 2026-11-07 — Son Sohbetler Rayı ve Canlı Aurora

### Son Sohbetler rayı
- Geçmiş sohbetler artık ana ekranın solunda sabit bir "Son Sohbetler" rayı olarak
  duruyor; hero'nun altına inmek için kaydırmak gerekmiyor.
- Ray en son mesaj zamanına göre sıralanıyor: en yeni sohbet tepede, en eski altta.
  Sohbetler Bugün / Dün / Daha eski olarak gruplanıyor.
- Raydaki arama alanı sohbetleri anında süzüyor; klavye ile gezinme, Enter ile açma
  ve Esc ile temizleme aynı şekilde çalışıyor.
- Satırlarda sohbet adı, proje adı ve ne kadar önce güncellendiği görünüyor.
- Ray kendi içinde kaydırılıyor; pencere daraldığında hero'nun altına iniyor.

### Aurora arka planı
- Hero arkasındaki düz renk ve keskin köşeli parlaklık kaldırıldı.
- Yerine yavaşça süzülen, bulanık turkuaz-mavi-mor aurora kütleleri geldi; renkler
  yumuşak geçişlerle akıyor ve kartın yuvarlak köşelerinde kesiliyor.
- Hareket azaltma ayarı açıksa animasyon duruyor, arka plan sabit kalıyor.

### Web erişimi
- Neuratal Code artık tarayıcıdan açılmıyor. Sunucu yalnızca API, eşleştirme ve
  oturum açma geri dönüşlerini sunuyor; uygulama kabuğunu web'e göndermiyor.
- Neuratal web sitesi ve web hesabıyla giriş aynı şekilde duruyor.

### Metin
- Akış listesi boş durumu artık "yukarıdaki güverte" demiyor.

---

## 2026-11-05 — Akış Başlatma Düzeltmesi ve Sade Güverte

### Düzeltmeler
- **"Yeni akış" düğmesi çalışmıyordu.** Tek akış moduna geçerken yeni sekme
  yazımı boş listeye erken dönüyordu; artık açılan akış her durumda kaydediliyor.
  Aynı hata son akışlardan bir sohbet açmayı da etkiliyordu.
- Çalışma alanı etiketi eksik çeviri anahtarı yüzünden boş görünüyordu; o blok
  kaldırıldı ve proje adı tek yerde, seçicide gösteriliyor.

### Ana ekran sadeleştirmesi
- Sağ üstteki "Neuratal / Stüdyo" rozeti, ayrı "Çalışma alanı ekle" düğmesi ve
  sağdaki yinelenen proje adı kaldırıldı.
- Proje yokken sol taraf artık boş kalmıyor: yerinde kesikli çerçeveli
  "Çalışma alanı ekle" düğmesi duruyor.
- Çalışma alanı seçici kalan genişliği dolduruyor; "Yeni akış" düğmesi sağında.
- Proje seçiliyken boş liste artık proje adını söylüyor ("X için henüz akış yok").
- Ana ekranda "akış" dili birleştirildi: arama, yeni akış ve eski akışlar
  başlığı artık "oturum" yerine "akış" diyor.

---

## 2026-11-04 — Tek Akış Modu ve Sade Başlık

Sekme (tab) mantığı kaldırıldı: Neuratal Code artık aynı anda tek sohbet tutuyor.

### Tek oturum
- Üst çubuktaki sekme şeridi ve "yeni oturum" artı düğmesi kaldırıldı.
- Aynı anda yalnızca **bir** sohbet açık kalabiliyor. Başka bir akış açıldığında
  önceki kapanıyor; sohbetler üst üste yığılmıyor.
- Sekme değiştirme, sekme kapatma ve "arka planda aç" davranışları kaldırıldı.
- Daha önce açık kalan sekmeler uygulama açılışında tek akışa indirgeniyor.

### Açılışta ana ekran
- Uygulama artık her açılışta **Komuta Güvertesi** ile başlıyor; yarım kalmış bir
  sohbet otomatik açılmıyor.
- Yalnızca Ayarlar ekranı son konumundan geri yükleniyor.

### Başlık çubuğu
- Sekmelerin yerine tek satırlık sakin bir bağlam göstergesi geldi:
  çalışma alanı / akış adı.
- Neuratal logosuna tıklamak ana ekrana döndürüyor; ayrı "artı" düğmesi yok.
- Mobil menü sadeleştirildi: Ana Sayfa, Ayarlar, Yardım.

### Ana ekran düzeni
- "Son akışlar" başlığı arama alanıyla aynı hizada, bölüm etiketi olarak yerleştirildi.
- Akış yokken gösterilen boş durum yeniden tasarlandı ve metinleri çeviriye taşındı.

---

## 2026-11-04 — Neuratal Studio Arayüz Yenilemesi

OpenCode / Codex / Antigravity düzenlerinden ayrışan, tek bir "komuta güvertesi"
etrafında kurulmuş yeni bir çalışma deneyimi.

### Yeni ana ekran: Komuta Güvertesi
- Eski "proje sütunu + oturum listesi" iki sütunlu düzeni kaldırıldı.
- Tek kolonlu, sakin bir **komuta güvertesi** eklendi: karşılama, canlı sunucu durumu,
  çalışma alanı seçici, büyük **Yeni akış** düğmesi ve çalışma alanı ekleme.
- Beş **hızlı başlangıç modu** eklendi: İnşa Et, Planla, İncele, Ayıkla, Araştır.
  Her mod, kendi niyet cümlesiyle yeni bir akış başlatır.
- Son akışlar, arama alanıyla birlikte aynı yüzeyde tam genişlikte listelenir.
- Alt bilgi çubuğunda ayarlar ve yardım bağlantıları toplandı.

### Oturum ekranı
- İnce başlık satırı yerine turkuaz vurgulu **görev çubuğu (mission bar)** eklendi.
- Proje, çalışma ağacı, oturum başlığı ve çalışma durumu tek satırda daha okunur hâle geldi.

### Komut dock'u
- Besteleyici (composer) **Neuratal komut** dock'una dönüştürüldü.
- Üstte canlı durum noktası ve kısayol ipucu; altta `/` Komutlar, `@` Dosyalar ve
  `$` Terminal kısayol çipleri eklendi.
- Odaklandığında turkuaz halka ve yumuşak gölge ile aktiflik geri bildirimi verilir.

### Görsel dil
- Derin siyah OLED yüzeyler, tek turkuaz sinyal rengi ve ince ayırıcı çizgiler.
- Ana ekranda hafif ızgara dokusu ve köşe ışıması; hareketler `prefers-reduced-motion`
  tercihine saygı duyar.
- Tüm yeni metinler i18n anahtarlarıyla eklendi (İngilizce kaynak + Türkçe çeviri).

### Teknik
- Yeni bileşen: `src/packages/app/src/home/studio/hero.tsx` ve `hero.css`.
- `home/route.tsx` yeni tek kolonlu düzene geçirildi.
- `SessionTitleHeader`, `Composer` ve oturum listesi yeni sınıflarla giydirildi.
- `bun run typecheck` ve `bun run build` temiz geçti (1.896 dosya, 0 tip hatası).
