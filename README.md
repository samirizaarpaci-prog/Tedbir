# Tedbir

**Planla, olanı teyid et, muhasebe yap.** SRA Atölye'nin planlama uygulaması.

Gün, hafta, ay ve yıl için tedbir (plan) yapılır; sonra **Teyid** bölümünde ne kadarının gerçekleştiği yüzde ve gerçek süreyle işaretlenir;
en sonunda **Muhasebe** bölümünde gün puanlanır, ders çıkarılır ve mühürlenir. Çıkan ders bir sonraki planın başında karşına çıkar.
İstenen tedbir rutine dönüştürülüp kendiliğinden tekrarlatılabilir.

## Telefona kurmak

Deponun **Releases** sayfasındaki en yeni `tedbir-…-deneme.apk` dosyasını telefonda indirip aç.
"Bilinmeyen uygulamalar" uyarısı çıkarsa **Ayarlar**'dan bu kaynağa izin ver ve **Yükle**'ye bas.
Yeni sürüm eskisinin üstüne kurulur; kayıtlar silinmez.

## Depodaki dosyalar

| Dosya / klasör | Ne işe yarar |
|---|---|
| `web/tedbir.html` | Uygulamanın kendisi: ekranlar, hesaplar, kayıt. Tek dosya. |
| `scripts/hazirla.mjs` | `web/tedbir.html` dosyasını telefona hazırlar (`www/`), yazı tiplerini pakete gömer |
| `native-entry.js` | Telefona özel bağlantılar: geri tuşu, arka plana geçerken kaydetme |
| `scripts/patch-android.mjs` | Android projesine sürüm numarasını ve deneme imzasını yazar |
| `capacitor.config.json` | Uygulama adı, kimliği ve zemin rengi |
| `assets/` | Uygulama simgesi ve açılış ekranı (`tools/simgeler.mjs` üretir) |
| `keys/` | Deneme APK'larının sabit test anahtarı |
| `.github/workflows/android.yml` | Android paketini GitHub'ın bilgisayarlarında derler |

## Android paketi nasıl oluşur?

Bu depoya her yeni değişiklik geldiğinde GitHub paketi kendiliğinden derler (yaklaşık 5-10 dakika).
Bitince **Releases** sayfasında yeni `tedbir-…-deneme.apk` dosyası olur. Yalnızca son iki deneme sürümü tutulur.
Derleme hata verirse ayrıntısı **Issues** sayfasına "Derleme hatası" başlığıyla yazılır.

Derlemeyi elle başlatmak için: **Actions → Android paketi → Run workflow**.

## Kayıtlar nerede durur?

Telefon uygulamasında bütün kayıtlar telefonun içinde, uygulamanın kendi alanında durur. Sunucu yoktur.
Uygulamayı kaldırmak ya da uygulama verilerini silmek kayıtları da siler.

## Uygulama kimliği

`com.sraatolye.tedbir`. Google Play'de yayınlandıktan sonra değiştirilemez.
