# İlk İlkeler: okuma sitesi

Bu klasör Herbert Spencer'ın *First Principles* kitabının Türkçe okuma sitesidir.

Site Astro 7, React 19 ve Mantine 9 ile yapıldı. Arama için Pagefind kullanılır.

## Komutlar

Komutları bu klasörün içinde çalıştırın.

| Komut | Ne yapar? |
| --- | --- |
| `npm run dev` | Geliştirme sunucusunu açar. Adres `http://localhost:4321` olur. |
| `npm run content` | Çevirileri siteye aktarır. Bir sorun varsa durur. |
| `npm run build` | Siteyi `dist` klasörüne derler. Arama dizinini de kurar. |
| `npm run preview` | Derlenmiş siteyi bilgisayarda açar. |
| `npm run check` | TypeScript ve Astro tiplerini denetler. |
| `npm test` | Tarayıcı testlerini çalıştırır. |

## Çeviriler siteye nasıl gelir?

1. Çeviriler üst klasördeki `translations` klasöründedir.
2. Her bölümde iki dosya vardır. `body.md` çeviri metnidir. `meta.json` özet ve terim bilgisidir.
3. `npm run content` komutu bu dosyaları okur.
4. Komut bölüm dosyalarını `src/content/bolumler` klasörüne yazar.
5. Komut sözlüğü de `src/data` klasörüne yazar.

Bu üretilen dosyaları elle düzeltmeyin. Düzeltmeyi `translations` klasöründe yapın.

Çeviri metninde üç özel işaret vardır:

- `{{görünen|KEY}}` bir terimdir. Site bu işareti açıklama düğmesine çevirir.
- `⟦166⟧` özgün baskının sayfa numarasıdır. Site bunu `#sayfa-166` bağlantısına çevirir.
- `§ 12.` ile başlayan paragraf bir kesimdir. Site bunu `#paragraf-12` bağlantısına çevirir.

## Sayfa adresleri

- Bölüm adresi `/kisim/bolum/` biçimindedir. Örnek: `/bilinemez/din-ve-bilim/`
- Sözlük adresi `/sozluk/` biçimindedir.
- Tek terimin adresi `/sozluk/terim-adi/` biçimindedir.
- Arama adresi `/arama/` biçimindedir. Aranan sözcük adreste `?q=` olarak durur.

Sitenin internet adresi `SITE_URL` değişkeninden gelir. Değişken yoksa `astro.config.mjs` içindeki değer kullanılır.

## Tasarım kuralları

- Renkler, boşluklar ve süreler `src/styles/tokens.css` dosyasındadır. Bileşenlere sabit değer yazmayın.
- Yazı tipi Outfit'tir.
- Hiçbir yazı 14 pikselden küçük olmaz.
- Odak için çevreleyen çerçeve kullanılmaz.
- Klavye ile Tab tuşuna basınca odak altı çizili görünür.
- Fare ya da dokunma bu görünümü kapatır.
- Geçişler aynı eğriyi kullanır: `cubic-bezier(.65, 0, .35, 1)`.
- Kullanıcı hareketi azaltmak isterse geçişler kapanır.
- Yuvarlak köşeli kutulara renkli kenar çizgisi konmaz.
