# İlk İlkeler: proje notları

- Site Astro 7, React 19, Mantine 9 ve Pagefind ile yapıldı.
- Komutlar ve dosya akışı `README.md` dosyasındadır.
- Çeviriler üst klasördeki `translations` klasöründedir.
- Site içeriğini `npm run content` komutu üretir. Üretilen dosyaları elle düzeltmeyin.
- Arayüz testlerini `npm test` komutu çalıştırır.
- Testler Chromium ve WebKit ile 320, 375, 390 piksel ve masaüstü genişliğinde koşar.
- Firefox testi bu projede çalıştırılmaz.
- Testler önce siteyi derler. Sonra derlenmiş siteyi 4323 portunda açar.
- Odak, hareket, yazı boyutu ve kenar kuralları `README.md` dosyasındadır. Testler bu kurallar bozulunca başarısız olur.
- Sitenin internet adresi `SITE_URL` değişkeniyle verilir.
