// translations/<unit>/{body.md,meta.json} → src/content/bolumler/*.md, src/data/glossary.json,
// src/data/term-usage.json, src/data/notes.json. Ayrıca kalite raporu basar.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CHAPTERS, PARTS, chapterPath, chapterLabel, slugifyTr } from '../src/data/book.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const trDir = path.resolve(root, '..', 'translations');
const outDir = path.join(root, 'src/content/bolumler');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'scripts/manifest.json'), 'utf8'));
const seed = JSON.parse(fs.readFileSync(path.join(root, 'scripts/glossary-seed.json'), 'utf8'));

// Girdi denetlenmeden mevcut içerik silinmez.
if (!fs.existsSync(trDir) || !CHAPTERS.some((c) => fs.existsSync(path.join(trDir, c.unit, 'body.md')))) {
  console.error(`Çeviri klasörü bulunamadı ya da boş: ${trDir}`);
  process.exit(1);
}
const allowPartial = process.argv.includes('--allow-partial');
const strict = process.argv.includes('--strict');
fs.mkdirSync(outDir, { recursive: true });
for (const f of fs.readdirSync(outDir)) fs.unlinkSync(path.join(outDir, f));

const glossary = new Map(seed.map((t) => [t.key, { ...t }]));
// Anahtarlar büyük/küçük harf ve boşluk farkı gözetmeksizin tek kanonik anahtara bağlanır.
const canon = new Map([...glossary.keys()].map((k) => [norm(k), k]));
function norm(k) { return k.trim().toLowerCase().replace(/\b(the|a|an)\b/g, ' ').replace(/[-‐]/g, ' ').replace(/\s+/g, ' ').trim(); }
function canonical(k) { const c = canon.get(norm(k)); if (c) return c; canon.set(norm(k), k.trim()); return k.trim(); }
const usage = {};
const notes = [];
const report = [];
let order = 0;
let built = 0;

for (const ch of CHAPTERS) {
  order += 1;
  const dir = path.join(trDir, ch.unit);
  const bodyPath = path.join(dir, 'body.md');
  const metaPath = path.join(dir, 'meta.json');
  if (!fs.existsSync(bodyPath)) continue;
  let body = fs.readFileSync(bodyPath, 'utf8').replace(/\r\n/g, '\n').trim() + '\n';
  let meta = {};
  if (fs.existsSync(metaPath)) {
    try { meta = JSON.parse(fs.readFileSync(metaPath, 'utf8')); } catch (e) { report.push(`${ch.unit}: meta.json okunamadı: ${e.message}`); }
  }
  const src = manifest.find((m) => m.id === ch.unit) ?? {};

  // yeni terimler
  const termOverrides = {};
  for (const t of meta.terms ?? []) {
    if (!t?.key || !t?.tr || !t?.explanation) continue;
    const ck = canonical(t.key);
    if (!glossary.has(ck)) glossary.set(ck, { key: ck, tr: t.tr, explanation: t.explanation });
    const g = glossary.get(ck);
    const trv = t.tr.trim();
    if (trv.toLocaleLowerCase('tr') !== g.tr.trim().toLocaleLowerCase('tr')) {
      // Bu bölümün çevirmeni başka bir karşılık kullandı: açıklama kutusu o karşılığı göstersin.
      termOverrides[ck] = { tr: trv, explanation: t.explanation.trim() };
      g.variants = [...new Set([...(g.variants ?? []), trv])];
    }
  }
  // gövdedeki terim anahtarları (kanonik biçime çevrilir)
  body = body.replace(/\{\{([^{}|]+)\|([^{}|]+)\}\}/g, (_, surf, key) => `{{${surf}|${canonical(key)}}}`);
  const used = new Set();
  for (const m of body.matchAll(/\{\{([^{}|]+)\|([^{}|]+)\}\}/g)) used.add(m[2].trim());
  const missing = [...used].filter((k) => !glossary.has(k));
  if (missing.length) report.push(`${ch.unit}: sözlükte olmayan ${missing.length} terim anahtarı: ${missing.slice(0, 8).join(', ')}${missing.length > 8 ? '…' : ''}`);
  for (const k of used) {
    if (!glossary.has(k)) continue;
    (usage[k] ||= []).push({ unit: ch.unit, href: chapterPath(ch), title: `${chapterLabel(ch) ? chapterLabel(ch) + ' · ' : ''}${ch.title}` });
  }
  // kesimler ve sayfalar
  const sections = [...body.matchAll(/^§\s*(\d+[a-z]?)\.\s/gm)].map((m) => m[1]);
  const pages = [...body.matchAll(/⟦\s*(\d+)\s*⟧/g)].map((m) => Number(m[1]));
  for (let i = 1; i < pages.length; i++) if (pages[i] <= pages[i - 1]) { report.push(`${ch.unit}: sayfa işaretleri sıralı değil (${pages[i - 1]} → ${pages[i]})`); break; }
  const nums = sections.map((s) => parseInt(s, 10));
  for (let i = 1; i < nums.length; i++) if (nums[i] < nums[i - 1] || nums[i] > nums[i - 1] + 1) { report.push(`${ch.unit}: § sırası şüpheli (${sections[i - 1]} → ${sections[i]})`); break; }
  const words = (body.match(/[A-Za-zÇĞİÖŞÜçğıöşü']+/g) || []).length;
  const ratio = src.words ? words / src.words : 0;
  if (src.words && (ratio < 0.68 || ratio > 1.3)) report.push(`${ch.unit}: sözcük oranı ${ratio.toFixed(2)} (kaynak ${src.words}, çeviri ${words})`);
  const en = (body.replace(/\{\{[^}]*\}\}/g, '').replace(/\([A-Za-z][^)]*\)/g, '').match(/\b(the|and|of|which|that|with)\b/gi) || []).length;
  if (en > Math.max(25, words * 0.01)) report.push(`${ch.unit}: İngilizce kalıntı şüphesi (${en} İngilizce işlev sözcüğü)`);
  if (/\{\{[^}]*$/m.test(body) || (body.match(/\{\{/g) || []).length !== (body.match(/\}\}/g) || []).length) report.push(`${ch.unit}: dengesiz {{ }} işareti`);
  if (/<[a-z][^>]*>/i.test(body)) report.push(`${ch.unit}: gövdede HTML var`);

  const issues = (meta.ocr_issues ?? []).filter((x) => typeof x === 'string' && x.trim());
  if (issues.length) notes.push({ unit: ch.unit, title: `${chapterLabel(ch) ? chapterLabel(ch) + ' · ' : ''}${ch.title}`, href: chapterPath(ch), issues });

  const fm = {
    unit: ch.unit,
    part: ch.part,
    order,
    number: ch.number,
    slug: ch.slug,
    title: ch.title,
    titleEn: ch.titleEn,
    description: (meta.description || `${ch.title} — Herbert Spencer, İlk İlkeler.`).trim(),
    summary: (meta.summary || '').trim(),
    pages: [src.printed_pages?.[0] ?? null, src.printed_pages?.[1] ?? null],
    sections,
    words,
    terms: [...used].filter((k) => glossary.has(k)),
    termOverrides: Object.fromEntries(Object.entries(termOverrides).filter(([k]) => used.has(k))),
  };
  const yaml = Object.entries(fm).map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join('\n');
  fs.writeFileSync(path.join(outDir, `${String(order).padStart(2, '0')}-${ch.unit}.md`), `---\n${yaml}\n---\n\n${body}`);
  built += 1;
}

// Kararlı ve çakışmasız sözlük adresleri: aynı girdi her derlemede aynı adresi alır.
const glossaryOut = [...glossary.values()]
  .sort((a, b) => a.key.localeCompare(b.key, 'en'))
  .map((t) => ({ ...t, slug: slugifyTr(`${t.tr}-${t.key}`) }));
const slugs = new Set();
for (const t of glossaryOut) {
  let s = t.slug, n = 2;
  while (slugs.has(s)) s = `${t.slug}-${n++}`;
  t.slug = s;
  slugs.add(s);
}
fs.mkdirSync(path.join(root, 'src/data'), { recursive: true });
fs.writeFileSync(path.join(root, 'src/data/glossary.json'), JSON.stringify(glossaryOut, null, 1));
fs.writeFileSync(path.join(root, 'src/data/term-usage.json'), JSON.stringify(usage, null, 1));
fs.writeFileSync(path.join(root, 'src/data/notes.json'), JSON.stringify(notes, null, 1));
console.log(`bölüm: ${built}/${CHAPTERS.length}, sözlük: ${glossaryOut.length} terim, not: ${notes.length} bölüm`);
if (report.length) { console.log('\nUYARILAR:'); for (const r of report) console.log(' - ' + r); } else console.log('uyarı yok');
if (built < CHAPTERS.length && !allowPartial) { console.error(`Eksik birim: ${CHAPTERS.length - built}. Kısmi derleme için --allow-partial verin.`); process.exit(1); }
if (strict && report.length) process.exit(1);
