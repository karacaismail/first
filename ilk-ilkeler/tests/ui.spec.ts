import { test, expect, type Page } from '@playwright/test';

// Site GitHub Pages'te /first/ alt adresinde yayınlanır. Testler aynı taban adresle koşar.
const BASE = (process.env.BASE_PATH ?? '/first').replace(/\/$/, '');
const u = (p: string) => BASE + p;
const CHAPTER = u('/bilinemez/din-ve-bilim/');
const PAGES = [u('/'), CHAPTER, u('/bilinemez/'), u('/sozluk/'), u('/hakkinda/')];

async function hydrated(page: Page) {
  await page.waitForFunction(() => ![...document.querySelectorAll('astro-island')].some((i) => i.hasAttribute('ssr')));
}

async function noHorizontalOverflow(page: Page) {
  const r = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth }));
  expect(r.sw, 'sayfa yatay taşmamalı').toBeLessThanOrEqual(r.iw);
}

async function minFontSize(page: Page) {
  const min = await page.evaluate(() => {
    let m = 999;
    for (const el of document.querySelectorAll('body *')) {
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden') continue;
      const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent!.trim());
      if (!own) continue;
      m = Math.min(m, parseFloat(cs.fontSize));
    }
    return m;
  });
  expect(min, 'okunabilir metin 14 CSS px altına inmemeli').toBeGreaterThanOrEqual(14);
}

for (const path of PAGES) {
  test(`yerleşim: ${path} yatay taşma yok ve metin ≥ 14px`, async ({ page }) => {
    await page.goto(path);
    await noHorizontalOverflow(page);
    await minFontSize(page);
    await expect(page.locator('html')).toHaveAttribute('lang', 'tr');
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
  });
}

test('bölüm sayfası: § çapaları, sayfa işaretleri, JSON-LD ve önceki/sonraki', async ({ page }) => {
  await page.goto(CHAPTER);
  await expect(page.locator('a.sec#paragraf-1')).toHaveCount(1);
  expect(await page.locator('a.pg').count()).toBeGreaterThan(3);
  expect(await page.locator('script[type="application/ld+json"]').count()).toBeGreaterThanOrEqual(2);
  await expect(page.locator('nav.pager a[rel="next"]')).toHaveCount(1);
  await page.goto(`${CHAPTER}#paragraf-3`);
  await expect.poll(async () => page.locator('a.sec#paragraf-3').evaluate((el) => {
    const r = el.getBoundingClientRect();
    return r.top >= 0 && r.top < window.innerHeight;
  }), { message: '#paragraf-3 çapası görünür alana kaydırmalı', timeout: 5000 }).toBeTruthy();
});

test('terim açıklaması: tıklama ile açılır, Escape ile kapanır, odak terime döner', async ({ page }) => {
  await page.goto(CHAPTER);
  await hydrated(page);
  const term = page.locator('button.term').first();
  await term.scrollIntoViewIfNeeded();
  const key = await term.getAttribute('data-term');
  await term.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('.termcard .en')).toHaveText(key!);
  await expect(dialog.locator('.termcard p:not(.en):not(.tr)')).not.toBeEmpty();
  expect((await dialog.locator('.termcard a').getAttribute('href'))!.startsWith(BASE + '/sozluk/')).toBe(true);
  await expect(term).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(term).toHaveAttribute('aria-expanded', 'false');
  await expect(term).toBeFocused();
});

test('terim açıklaması: klavye ile (Tab + Enter) açılır', async ({ page }) => {
  await page.goto(CHAPTER);
  await hydrated(page);
  const term = page.locator('button.term').first();
  await term.scrollIntoViewIfNeeded();
  await term.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog')).toBeVisible();
});

test('odak: fare ile halka yok; Tab ile çevrelemeyen gösterge var', async ({ page }) => {
  await page.goto(CHAPTER);
  const first = page.locator('nav.pager a').first();
  await first.scrollIntoViewIfNeeded();
  // Fare: tıklama sonrası klavye modu kapalı, hiçbir halka yok.
  await page.mouse.click(5, 5);
  expect(await page.evaluate(() => document.documentElement.hasAttribute('data-kb-focus'))).toBe(false);
  await first.click({ trial: true });
  // Klavye: Tab modu açar; WebKit'te Tab bağlantıları varsayılan olarak atladığından odak klavye olayından sonra programatik verilir.
  await page.keyboard.press('Tab');
  await first.focus();
  const st = await page.evaluate(() => {
    const a = document.activeElement as HTMLElement;
    const cs = getComputedStyle(a);
    return { kb: document.documentElement.hasAttribute('data-kb-focus'), fv: a.matches(':focus-visible'), outline: cs.outlineStyle, deco: cs.textDecorationLine, shadow: cs.boxShadow, tag: a.tagName };
  });
  expect(st.kb).toBe(true);
  expect(st.tag).toBe('A');
  expect(st.outline, 'çevreleyen outline yasak').toBe('none');
  expect(st.fv, 'klavye modunda odak :focus-visible olmalı').toBe(true);
  expect(st.deco.includes('underline') || st.shadow.includes('inset'), 'görünür ama çevrelemeyen gösterge').toBeTruthy();
  // Tekrar işaretçi: mod kapanır.
  await page.mouse.click(5, 5);
  expect(await page.evaluate(() => document.documentElement.hasAttribute('data-kb-focus'))).toBe(false);
});

test('hareket tokenları: easeInOut cubic ve reduced-motion sıfırlama', async ({ page }) => {
  await page.goto(CHAPTER);
  const ease = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--motion-ease').trim());
  expect(ease.replace(/\s/g, '').replace(/\(\./g, '(0.').replace(/,\./g, ',0.')).toBe('cubic-bezier(0.65,0,0.35,1)');
  const termEase = await page.locator('button.term').first().evaluate((el) => getComputedStyle(el).transitionTimingFunction.replace(/\s/g, ''));
  expect(termEase.replace(/\(\./g, '(0.').replace(/,\./g, ',0.')).toContain('cubic-bezier(0.65,0,0.35,1)');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const base = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--motion-base').trim());
  expect(['0ms', '0s']).toContain(base);
});

test('gezinme: dar ekranda içindekiler menüsü açılır ve kapanır', async ({ page, viewport }) => {
  test.skip(!viewport || viewport.width >= 992, 'yalnız dar ekran');
  await page.goto(CHAPTER);
  await hydrated(page);
  const burger = page.getByRole('button', { name: 'İçindekileri aç' });
  await burger.click();
  await expect(page.locator('#icindekiler')).toBeVisible();
  await expect(page.locator('#icindekiler a.ch[aria-current="page"]')).toHaveCount(1);
  await page.keyboard.press('Escape');
  await expect(burger).toHaveAttribute('aria-expanded', 'false');
});

test('gezinme: geniş ekranda içindekiler sürekli görünür', async ({ page, viewport }) => {
  test.skip(!viewport || viewport.width < 992, 'yalnız geniş ekran');
  await page.goto(CHAPTER);
  await expect(page.locator('#icindekiler')).toBeVisible();
  await expect(page.locator('#icindekiler a.ch[aria-current="page"]')).toHaveText(/Din ve Bilim/);
});

test('sözlük: terim sayfası ve geçtiği bölüm bağlantıları', async ({ page }) => {
  await page.goto(u('/sozluk/'));
  const link = page.locator('.gloss article h3 a').first();
  const href = await link.getAttribute('href');
  await page.goto(href!);
  await expect(page.locator('h1.title')).not.toBeEmpty();
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(1);
});

test('bütünlük: içindekilerdeki 37 bölümün hepsi açılır ve zincir kesintisizdir', async ({ page, request }, info) => {
  test.skip(info.project.name !== 'chromium-desktop', 'tek projede yeterli');
  await page.goto(u('/'));
  const hrefs = await page.locator('.parts .toc a').evaluateAll((as) => as.map((a) => (a as HTMLAnchorElement).getAttribute('href')!));
  expect(hrefs.length).toBe(37);
  for (const h of hrefs) {
    const r = await request.get(h);
    expect(r.status(), h).toBe(200);
    const html = await r.text();
    expect(html, h + ' gövde').toContain('class="prose"');
    expect(html, h + ' terim').toContain('class="term"');
  }
  // önceki/sonraki zinciri baştan sona
  await page.goto(hrefs[0]);
  for (let i = 1; i < hrefs.length; i++) {
    await page.locator('nav.pager a[rel="next"]').click();
    await expect(page).toHaveURL(new RegExp(hrefs[i].replace(/[/.]/g, '\\$&') + '$'));
  }
  await expect(page.locator('nav.pager a[rel="next"]')).toHaveCount(0);
});

// ---- Bağımsız inceleme bulguları için regresyon testleri ----
const narrow = (vp: { width: number } | null) => !!vp && vp.width < 992;

test('arama: kendi arayüzü, sonuç verir, metin ≥ 14px, Outfit, çevreleyen halka yok', async ({ page }) => {
  await page.goto(u('/arama/'));
  await hydrated(page);
  const input = page.getByRole('searchbox', { name: 'Kitapta ara' });
  await input.click();
  const st = await input.evaluate((el) => { const cs = getComputedStyle(el); return { outline: cs.outlineStyle, shadow: cs.boxShadow, font: cs.fontFamily }; });
  expect(st.outline).toBe('none');
  expect(st.shadow === 'none' || !/0px 0px 0px \d+px/.test(st.shadow), 'fareyle odakta çevreleyen gölge halkası yok').toBeTruthy();
  expect(st.font.toLowerCase()).toContain('outfit');
  await input.fill('evrim');
  await expect(page.locator('.search-results li').first()).toBeVisible({ timeout: 10_000 });
  const resultHref = await page.locator('.search-results a.search-title').first().getAttribute('href');
  expect(resultHref!.startsWith(BASE + '/'), `arama sonucu taban adresle başlamalı: ${resultHref}`).toBe(true);
  await noHorizontalOverflow(page);
  await minFontSize(page);
});

test('gezinme: dar ekranda kapalı menü klavye odağı almaz', async ({ page, viewport }) => {
  test.skip(!narrow(viewport), 'yalnız dar ekran');
  await page.goto(CHAPTER);
  await hydrated(page);
  for (let i = 0; i < 8; i++) {
    await page.keyboard.press('Tab');
    const inNav = await page.evaluate(() => !!document.activeElement?.closest('#icindekiler'));
    expect(inNav, `Tab #${i + 1} gizli menüye düşmemeli`).toBe(false);
  }
});

test('gezinme: menü açılınca odak içeri girer, Escape ile odak menü düğmesine döner', async ({ page, viewport }) => {
  test.skip(!narrow(viewport), 'yalnız dar ekran');
  await page.goto(CHAPTER);
  await hydrated(page);
  const burger = page.getByRole('button', { name: 'İçindekileri aç' });
  await burger.click();
  await expect.poll(() => page.evaluate(() => !!document.activeElement?.closest('#icindekiler'))).toBe(true);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'İçindekileri aç' })).toBeFocused();
});

test('gezinme: azaltılmış harekette menü kayması anında', async ({ page, viewport }) => {
  test.skip(!narrow(viewport), 'yalnız dar ekran');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(CHAPTER);
  await hydrated(page);
  const d = await page.locator('#icindekiler').evaluate((el) => getComputedStyle(el).transitionDuration);
  expect(d.split(',').every((x) => parseFloat(x) === 0), `transition-duration ${d}`).toBe(true);
});

test('dokunma hedefleri: başlıktaki düğmeler en az 44×44', async ({ page }) => {
  await page.goto(CHAPTER);
  await hydrated(page);
  for (const el of await page.locator('header button:visible, header a.iconbtn:visible, header a.brand').all()) {
    const b = (await el.boundingBox())!;
    expect(Math.round(b.height), await el.evaluate((e) => e.outerHTML.slice(0, 60))).toBeGreaterThanOrEqual(44);
    if (!(await el.evaluate((e) => e.classList.contains('brand')))) expect(Math.round(b.width)).toBeGreaterThanOrEqual(44);
  }
});

test('terim penceresinin erişilebilir adı var', async ({ page }) => {
  await page.goto(CHAPTER);
  await hydrated(page);
  const term = page.locator('button.term').first();
  await term.scrollIntoViewIfNeeded();
  await term.click();
  await expect(page.getByRole('dialog', { name: /tanrısal hak/ })).toBeVisible();
});

test('tema düğmesi koyu sistem temasında doğru etiketi gösterir', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto(CHAPTER);
  await hydrated(page);
  await expect(page.getByRole('button', { name: 'Açık temaya geç' })).toBeVisible();
  await page.getByRole('button', { name: 'Açık temaya geç' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-mantine-color-scheme', 'light');
  await expect(page.getByRole('button', { name: 'Koyu temaya geç' })).toBeVisible();
});

test('§ şeridindeki her bağlantının hedefi var', async ({ page }) => {
  await page.goto(u('/bilinebilir/kuvvetlerin-donusumu-ve-esdegerligi/'));
  const missing = await page.evaluate(() => [...document.querySelectorAll<HTMLAnchorElement>('.secstrip a')].map((a) => a.hash.slice(1)).filter((id) => !document.getElementById(id)));
  expect(missing).toEqual([]);
});

test('SEO: site haritası arama sayfasını içermez, robots onu engellemez', async ({ request }, info) => {
  test.skip(info.project.name !== 'chromium-desktop', 'tek projede yeterli');
  const sm = await (await request.get(u('/sitemap-0.xml'))).text();
  expect(sm).toContain('/bilinemez/din-ve-bilim/');
  expect(sm).not.toContain('/arama/');
  const robots = await (await request.get(u('/robots.txt'))).text();
  expect(robots).not.toContain('Disallow: /arama/');
  expect(robots).toMatch(/Sitemap: https?:\/\/.+\/sitemap-index\.xml/);
});

test('alt adres: bütün iç bağlantılar ve dosyalar taban adresle başlar', async ({ page, request }, info) => {
  test.skip(info.project.name !== 'chromium-desktop', 'tek projede yeterli');
  await page.goto(u('/sozluk/'));
  const termHref = await page.locator('.gloss article h3 a').first().getAttribute('href');
  const pages = [u('/'), CHAPTER, u('/bilinemez/'), u('/sozluk/'), termHref!, u('/hakkinda/'), u('/arama/'), u('/olmayan-sayfa/')];
  for (const p of pages) {
    const html = await (await request.get(p)).text();
    const refs = [...html.matchAll(/(?:href|src)="(\/[^"/][^"]*|\/)"/g)].map((m) => m[1]);
    const wrong = refs.filter((r) => !r.startsWith(BASE + '/'));
    expect(wrong, `${p} sayfasında taban adressiz bağlantı`).toEqual([]);
  }
  const robots = await (await request.get(u('/robots.txt'))).text();
  expect(robots).toContain(`${BASE}/sitemap-index.xml`);
});

test('alt adres: kanonik adres ve JSON-LD taban adresi içerir', async ({ page }, info) => {
  test.skip(info.project.name !== 'chromium-desktop', 'tek projede yeterli');
  await page.goto(CHAPTER);
  const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
  expect(new URL(canonical!).pathname).toBe(CHAPTER);
  const ld = await page.locator('script[type="application/ld+json"]').first().textContent();
  expect(JSON.parse(ld!).url).toContain(CHAPTER);
});
