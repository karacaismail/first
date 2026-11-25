# İlk İlkeler

Bu depo Herbert Spencer'ın *First Principles* kitabının Türkçe çevirisidir.

Çeviri kitabın 6. baskısından yapıldı. Bu baskı 1900 yılında çıktı.

Spencer 1903 yılında öldü. Bu yüzden özgün metin kamu malıdır.

## Depoda ne var?

- `translations` klasöründe çeviri metinleri var. Her bölüm ayrı bir klasördedir.
- `ilk-ilkeler` klasöründe okuma sitesi var. Site Astro, React ve Mantine ile yapıldı.

## Site nerede?

Site şu adreste yayında: https://karacaismail.github.io/first/

`main` dalına her gönderimde site yeniden yayınlanır. Bu işi GitHub Actions yapar.

## Sitede ne var?

- Kitabın 37 bölümünün tamamı var.
- Teknik terimlere dokununca kısa bir açıklama açılır.
- Terimler sözlüğünde 689 terim var.
- Kitabın içinde arama yapabilirsiniz.
- Site önce telefon ekranı için tasarlandı.

## Siteyi bilgisayarda açmak

Bilgisayarda Node.js 22.18 ya da daha yeni sürüm gerekir.

1. `ilk-ilkeler` klasörüne girin.
2. `npm install` komutunu çalıştırın.
3. `npm run content` komutunu çalıştırın. Bu komut çevirileri siteye aktarır.
4. `npm run dev` komutunu çalıştırın.
5. Tarayıcıda `http://localhost:4321/first/` adresini açın.

Arama yalnız derlenmiş sitede çalışır. Derlemek için `npm run build` komutunu çalıştırın.

## Testler

Testleri `npm test` komutu çalıştırır. Testler Chromium ve WebKit tarayıcılarında koşar.

## Kaynak

Özgün metin Internet Archive'daki bir taramadan alındı:
https://archive.org/details/firstprinciples035476mbp

Bozuk okunan yerler aynı baskının ikinci bir taramasıyla karşılaştırıldı:
https://archive.org/details/dli.ernet.236217

## Lisans

Bu çevirinin ve kodun lisansı henüz seçilmedi.
