# Kern Craft 🎨 — A Letter Spacing Game

**Kern Craft**, ünlü tipografi oyunu **Kern Type**'ın (https://type.method.ac) modernleştirilmiş, zenginleştirilmiş ve **sınırsız (sonsuz) oynanışa** sahip bir sürümüdür. 

---

## 🎯 Projenin Amacı ve Hikayesi

Orijinal **Kern Type** oyunu, tipografi meraklıları ve tasarımcılar için harika bir pratik aracı olsa da çok önemli bir eksikliğe sahipti: **Çok kısa ve sınırlıydı.** Oyunda yalnızca sabit 10 adet statik seviye bulunuyordu. Bunlar bir kez bitirildiğinde oyunun tekrar oynanabilirliği kalmıyordu ve yeni fontlar veya kelimelerle pratik yapmak mümkün olmuyordu.

Biz bu projeyi geliştirirken bu eksikliği gidermeyi hedefledik. **Kern Craft**, dinamik yazı tipi ayrıştırma motoru sayesinde:
- Kelime ve font sayısı sınırlamasını tamamen ortadan kaldırır.
- Google Fonts kütüphanesini ve dinamik bir kerning kelime listesini kullanarak her oyunda size **rastgele seçilmiş binlerce farklı İngilizce kelime ve popüler yazı tipi** sunar.
- Böylece sonsuz bir döngüde, her seferinde farklı bir zorluk seviyesinde kerning (harf aralığı hizalama) pratiği yapabilirsiniz.

---

## ✨ Özellikler

1. **Sonsuz Mod (Infinite Mode)**: Her seferinde tamamen rastgele bir font ve kelime eşleşmesi ile sınırsız oyun keyfi.
2. **Challenge Modu**: 10 seviyelik hedeflenmiş bir oyun serisi. Seviyelerin sonunda detaylı bir skor tablosu ve istatistik özeti.
3. **Dinamik Vektör Ayrıştırma (opentype.js)**: Font dosyalarını (`.ttf`) gerçek zamanlı olarak indirip glif şekillerini ve tasarımcının belirlediği ideal kerning değerlerini doğrudan tarayıcıda işler. SVG render sayesinde pikselleşme yaşanmaz.
4. **Minimalist ve Modern Arayüz**: Orijinal arayüzün sade slate tonlarına sadık kalınarak tasarlanan, kilitler veya dikkat dağıtıcı göstergeler barındırmayan tamamen pürüzsüz bir oynanış deneyimi.
5. **Klavye & Fare Kontrolleri**: Hassas hizalamalar için klavye ok tuşları (`Shift` ile hızlı kaydırma) ve fare/dokunmatik sürükle-bırak desteği.
6. **İstatistik Takibi**: Ortalama skorunuz ve rekorlarınız tarayıcınızın `localStorage` alanında saklanır.

---

## 💻 Yerel Olarak Çalıştırma

Projeyi yerel bilgisayarınızda çalıştırmak için aşağıdaki adımları takip edebilirsiniz:

1. Bağımlılıkları yükleyin:
   ```bash
   npm install
   ```
2. Geliştirici sunucusunu başlatın:
   ```bash
   npm run dev
   ```
3. Tarayıcınızda açın: **[http://localhost:5173](http://localhost:5173)**

---

## 🚀 GitHub Pages Üzerinde Ücretsiz Yayınlama (Publish)

Bu oyunu GitHub sunucularını kullanarak tamamen ücretsiz bir şekilde tüm dünyaya açmak için aşağıdaki adımları sırayla uygulayabilirsiniz:

### 1. Adım: GitHub üzerinde Yeni Bir Repo Oluşturun
1. [GitHub](https://github.com/) sayfanıza gidin.
2. Sağ üstteki **+** butonuna tıklayıp **New repository** (Yeni depo) seçeneğini seçin.
3. Depo adına örneğin `kern-craft` yazın.
4. Diğer ayarları varsayılan bırakıp (Public seçili olmalı) **Create repository** butonuna tıklayın.

### 2. Adım: Yerel Projeyi GitHub Reposuna Bağlayın
Terminalinizde bu proje klasöründeyken aşağıdaki komutları sırasıyla çalıştırın (kullanıcı adınızı ve oluşturduğunuz depo adını kendinize göre güncelleyin):

```bash
# Değişiklikleri yerel git deposuna ekleyin ve ilk commit'i yapın
git add .
git commit -m "İlk kurulum ve Kern Craft özellikleri"

# GitHub reponuzu uzak sunucu (remote) olarak tanımlayın
git remote add origin https://github.com/Lowuentos/kern-craft.git

# Ana dalın adını main yapın
git branch -M main

# Kodları GitHub'a gönderin
git push -u origin main
```

### 3. Adım: GitHub Pages'a Yayınlama (Deploy)
Projede `gh-pages` entegrasyonu ve gerekli scriptler zaten hazır durumdadır. Sadece şu komutu çalıştırmanız yeterlidir:

```bash
npm run deploy
```

Bu komut:
1. Projeyi otomatik olarak en iyi performans ayarlarıyla derler (`dist` klasörü oluşturulur).
2. Derlenen dosyaları GitHub reponuzda otomatik olarak `gh-pages` adında yeni bir dala (branch) yükler.

### 4. Adım: GitHub Pages Ayarlarını Kontrol Etme
1. GitHub'daki reponuza gidin.
2. Üst menüden **Settings** (Ayarlar) > Sol menüden **Pages** kısmına tıklayın.
3. **Build and deployment** altında Source kısmının **Deploy from a branch** olduğunu, Branch kısmının ise **`gh-pages`** (ve `/root`) olarak seçili olduğunu doğrulayın (otomatik olarak seçilmiş olmalıdır).
4. Birkaç dakika içinde sayfanın üst kısmında sitenizin canlı linki görünecektir. Örneğin:
   `https://Lowuentos.github.io/kern-craft/`

---

## 🛠️ Teknolojiler

- **Core**: React 19, TypeScript, Vite
- **Grafik/Yazı Tipi İşleme**: `opentype.js` (TrueType/OpenType parser)
- **İkonlar**: `lucide-react`
- **Yayınlama**: `gh-pages`
