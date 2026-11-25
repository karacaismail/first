// Site bir alt adreste yayınlanabilir (GitHub Pages: /first/). Taban adres astro.config.mjs
// içindeki `base` değerinden gelir. Sitedeki bütün iç bağlantılar bu işlevlerden geçer.
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

/** "/sozluk/" gibi kök göreli bir yolu taban adresle birleştirir. */
export function withBase(path: string): string {
  if (!path.startsWith('/') || path.startsWith('//')) return path;
  return BASE + path;
}

/** Sitenin taban adresli tam kökü, sonunda eğik çizgi olmadan: https://alan.adi/first */
export function siteRoot(site: URL): string {
  return new URL(import.meta.env.BASE_URL, site).href.replace(/\/$/, '');
}
