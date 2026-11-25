// Kitabın yapısı: kısımlar, bölümler, insan okunur URL parçaları.
// URL şeması: /<kisim>/<bolum>/  — örn. /bilinemez/din-ve-bilim/
export type PartSlug = 'onsozler' | 'bilinemez' | 'bilinebilir' | 'ekler';

export interface Part {
  slug: PartSlug;
  title: string;
  titleEn: string;
  label: string; // "Kısım I" gibi
  intro: string;
}

export interface ChapterDef {
  unit: string; // çeviri birimi kimliği
  part: PartSlug;
  number: string; // Roma rakamı ya da boş
  slug: string;
  title: string;
  titleEn: string;
}

export const BOOK = {
  title: 'İlk İlkeler',
  titleEn: 'First Principles',
  author: 'Herbert Spencer',
  edition: 'Altıncı ve son baskı (1900), yazar tarafından gözden geçirilmiş',
  sourceUrl: 'https://archive.org/details/firstprinciples035476mbp',
  tagline: 'Sentetik Felsefe dizisinin ilk kitabı: Bilinemez ile Bilinebilir üzerine.',
};

export const PARTS: Part[] = [
  {
    slug: 'onsozler',
    title: 'Önsözler',
    titleEn: 'Prefaces',
    label: 'Önsözler',
    intro: 'Spencer’ın 1862, 1880 ve 1900 tarihli önsözleri; Sentetik Felsefe programının tam metni.',
  },
  {
    slug: 'bilinemez',
    title: 'Bilinemez',
    titleEn: 'The Unknowable',
    label: 'Kısım I',
    intro: 'Din ile bilimin ortak sınırı: insan bilgisinin ötesinde kalan nihai gerçeklik.',
  },
  {
    slug: 'bilinebilir',
    title: 'Bilinebilir',
    titleEn: 'The Knowable',
    label: 'Kısım II',
    intro: 'Felsefenin tanımı, verileri ve Evrim Yasası’nın madde ile hareket üzerinden türetilmesi.',
  },
  {
    slug: 'ekler',
    title: 'Ekler',
    titleEn: 'Appendices',
    label: 'Ekler',
    intro: 'Eleştirilere yanıtlar ve gaz bulutsularının oluşumu üzerine not.',
  },
];

export const CHAPTERS: ChapterDef[] = [
  { unit: 'preface-1st', part: 'onsozler', number: '', slug: 'birinci-baskiya-onsoz', title: 'Birinci Baskıya Önsöz', titleEn: 'Preface to the First Edition' },
  { unit: 'preface-4th', part: 'onsozler', number: '', slug: 'dorduncu-baskiya-onsoz', title: 'Dördüncü Baskıya Önsöz', titleEn: 'Preface to the Fourth Edition' },
  { unit: 'preface-6th', part: 'onsozler', number: '', slug: 'altinci-baskiya-onsoz', title: 'Altıncı Baskıya Önsöz', titleEn: 'Preface to the Sixth Edition' },

  { unit: 'p1-ch01', part: 'bilinemez', number: 'I', slug: 'din-ve-bilim', title: 'Din ve Bilim', titleEn: 'Religion and Science' },
  { unit: 'p1-ch02', part: 'bilinemez', number: 'II', slug: 'nihai-dini-fikirler', title: 'Nihai Dinî Fikirler', titleEn: 'Ultimate Religious Ideas' },
  { unit: 'p1-ch03', part: 'bilinemez', number: 'III', slug: 'nihai-bilimsel-fikirler', title: 'Nihai Bilimsel Fikirler', titleEn: 'Ultimate Scientific Ideas' },
  { unit: 'p1-ch04', part: 'bilinemez', number: 'IV', slug: 'butun-bilginin-goreliligi', title: 'Bütün Bilginin Göreliliği', titleEn: 'The Relativity of All Knowledge' },
  { unit: 'p1-ch05', part: 'bilinemez', number: 'V', slug: 'uzlasma', title: 'Uzlaşma', titleEn: 'The Reconciliation' },
  { unit: 'p1-postscript', part: 'bilinemez', number: '', slug: 'birinci-kisma-son-not', title: 'Birinci Kısma Son Not', titleEn: 'Postscript to Part I' },

  { unit: 'p2-ch01', part: 'bilinebilir', number: 'I', slug: 'felsefenin-tanimi', title: 'Felsefenin Tanımı', titleEn: 'Philosophy Defined' },
  { unit: 'p2-ch02', part: 'bilinebilir', number: 'II', slug: 'felsefenin-verileri', title: 'Felsefenin Verileri', titleEn: 'The Data of Philosophy' },
  { unit: 'p2-ch03', part: 'bilinebilir', number: 'III', slug: 'uzay-zaman-madde-hareket-ve-kuvvet', title: 'Uzay, Zaman, Madde, Hareket ve Kuvvet', titleEn: 'Space, Time, Matter, Motion, and Force' },
  { unit: 'p2-ch04', part: 'bilinebilir', number: 'IV', slug: 'maddenin-yok-edilemezligi', title: 'Maddenin Yok Edilemezliği', titleEn: 'The Indestructibility of Matter' },
  { unit: 'p2-ch05', part: 'bilinebilir', number: 'V', slug: 'hareketin-surekliligi', title: 'Hareketin Sürekliliği', titleEn: 'The Continuity of Motion' },
  { unit: 'p2-ch06', part: 'bilinebilir', number: 'VI', slug: 'kuvvetin-kaliciligi', title: 'Kuvvetin Kalıcılığı', titleEn: 'The Persistence of Force' },
  { unit: 'p2-ch07', part: 'bilinebilir', number: 'VII', slug: 'kuvvetler-arasindaki-iliskilerin-kaliciligi', title: 'Kuvvetler Arasındaki İlişkilerin Kalıcılığı', titleEn: 'The Persistence of Relations among Forces' },
  { unit: 'p2-ch08', part: 'bilinebilir', number: 'VIII', slug: 'kuvvetlerin-donusumu-ve-esdegerligi', title: 'Kuvvetlerin Dönüşümü ve Eşdeğerliği', titleEn: 'The Transformation and Equivalence of Forces' },
  { unit: 'p2-ch09', part: 'bilinebilir', number: 'IX', slug: 'hareketin-yonu', title: 'Hareketin Yönü', titleEn: 'The Direction of Motion' },
  { unit: 'p2-ch10', part: 'bilinebilir', number: 'X', slug: 'hareketin-ritmi', title: 'Hareketin Ritmi', titleEn: 'The Rhythm of Motion' },
  { unit: 'p2-ch11', part: 'bilinebilir', number: 'XI', slug: 'ozet-elestiri-ve-yeniden-baslangic', title: 'Özet, Eleştiri ve Yeniden Başlangıç', titleEn: 'Recapitulation, Criticism, and Recommencement' },
  { unit: 'p2-ch12', part: 'bilinebilir', number: 'XII', slug: 'evrim-ve-cozulme', title: 'Evrim ve Çözülme', titleEn: 'Evolution and Dissolution' },
  { unit: 'p2-ch13', part: 'bilinebilir', number: 'XIII', slug: 'basit-ve-bilesik-evrim', title: 'Basit ve Bileşik Evrim', titleEn: 'Simple and Compound Evolution' },
  { unit: 'p2-ch14', part: 'bilinebilir', number: 'XIV', slug: 'evrim-yasasi', title: 'Evrim Yasası', titleEn: 'The Law of Evolution' },
  { unit: 'p2-ch15', part: 'bilinebilir', number: 'XV', slug: 'evrim-yasasi-devam-1', title: 'Evrim Yasası (devam)', titleEn: 'The Law of Evolution (continued)' },
  { unit: 'p2-ch16', part: 'bilinebilir', number: 'XVI', slug: 'evrim-yasasi-devam-2', title: 'Evrim Yasası (devam)', titleEn: 'The Law of Evolution (continued)' },
  { unit: 'p2-ch17', part: 'bilinebilir', number: 'XVII', slug: 'evrim-yasasi-sonuc', title: 'Evrim Yasası (sonuç)', titleEn: 'The Law of Evolution (concluded)' },
  { unit: 'p2-ch18', part: 'bilinebilir', number: 'XVIII', slug: 'evrimin-yorumu', title: 'Evrimin Yorumu', titleEn: 'The Interpretation of Evolution' },
  { unit: 'p2-ch19', part: 'bilinebilir', number: 'XIX', slug: 'homojen-olanin-kararsizligi', title: 'Homojen Olanın Kararsızlığı', titleEn: 'The Instability of the Homogeneous' },
  { unit: 'p2-ch20', part: 'bilinebilir', number: 'XX', slug: 'etkilerin-cogalmasi', title: 'Etkilerin Çoğalması', titleEn: 'The Multiplication of Effects' },
  { unit: 'p2-ch21', part: 'bilinebilir', number: 'XXI', slug: 'ayrisma', title: 'Ayrışma', titleEn: 'Segregation' },
  { unit: 'p2-ch22', part: 'bilinebilir', number: 'XXII', slug: 'dengelenme', title: 'Dengelenme', titleEn: 'Equilibration' },
  { unit: 'p2-ch23', part: 'bilinebilir', number: 'XXIII', slug: 'cozulme', title: 'Çözülme', titleEn: 'Dissolution' },
  { unit: 'p2-ch24', part: 'bilinebilir', number: 'XXIV', slug: 'ozet-ve-sonuc', title: 'Özet ve Sonuç', titleEn: 'Summary and Conclusion' },

  { unit: 'app-a', part: 'ekler', number: 'A', slug: 'ek-a-xvii-ve-xix-bolumlere-not', title: 'XVII. ve XIX. Bölümlere Not', titleEn: 'Note to Chapters XVII and XIX' },
  { unit: 'app-b', part: 'ekler', number: 'B', slug: 'ek-b-bazi-elestirilere-yanit', title: 'Bazı Eleştirilere Yanıt', titleEn: 'Dealing with Certain Criticisms' },
  { unit: 'app-c', part: 'ekler', number: 'C', slug: 'ek-c-prof-wardin-elestirilerine-yanit', title: 'Prof. Ward’ın Bazı Eleştirilerine Yanıt', titleEn: 'Dealing with Some Criticisms of Prof. Ward' },
  { unit: 'app-d', part: 'ekler', number: 'D', slug: 'ek-d-gaz-bulutsularinin-olusumu', title: 'Gaz Bulutsularının Oluşumu', titleEn: 'The Genesis of Gaseous Nebulae' },
];

export function partOf(slug: PartSlug): Part {
  return PARTS.find((p) => p.slug === slug)!;
}

export function chapterPath(ch: { part: PartSlug; slug: string }): string {
  return `/${ch.part}/${ch.slug}/`;
}

export function chapterLabel(ch: ChapterDef): string {
  if (ch.part === 'ekler') return `Ek ${ch.number}`;
  return ch.number ? `Bölüm ${ch.number}` : '';
}

export function slugifyTr(input: string): string {
  const map: Record<string, string> = { ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u', İ: 'i', Ç: 'c', Ğ: 'g', Ö: 'o', Ş: 's', Ü: 'u', I: 'i' };
  return input
    .replace(/[çğıöşüİÇĞÖŞÜI]/g, (c) => map[c] ?? c)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
