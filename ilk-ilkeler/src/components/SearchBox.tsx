import { useEffect, useRef, useState } from 'react';

interface Hit { url: string; title: string; excerpt: string; part?: string; subs: { url: string; title: string; excerpt: string }[] }
type Status = 'idle' | 'loading' | 'ready' | 'unavailable';

interface PagefindApi {
  options: (o: Record<string, unknown>) => Promise<void>;
  search: (q: string, o?: Record<string, unknown>) => Promise<{ results: { data: () => Promise<any> }[] }>;
}

const MAX = 20;
const MAX_TERMS = 6;

function toHit(d: any): Hit {
  return {
    url: d.url,
    title: d.meta?.title ?? d.url,
    excerpt: d.excerpt,
    part: d.meta?.kisim,
    subs: (d.sub_results ?? []).filter((s: any) => s.url !== d.url).slice(0, 3).map((s: any) => ({ url: s.url, title: s.title, excerpt: s.excerpt })),
  };
}

export default function SearchBox() {
  const [q, setQ] = useState('');
  const [hits, setHits] = useState<Hit[]>([]);
  const [terms, setTerms] = useState<Hit[]>([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState<Status>('idle');
  const [ready, setReady] = useState(false);
  const pf = useRef<PagefindApi | null>(null);

  useEffect(() => {
    const initial = new URLSearchParams(location.search).get('q') ?? '';
    if (initial) setQ(initial);
    (async () => {
      try {
        const path = '/pagefind/pagefind.js';
        const mod = (await import(/* @vite-ignore */ path)) as PagefindApi;
        await mod.options({ excerptLength: 24 });
        pf.current = mod;
        setReady(true);
        setStatus('ready');
      } catch {
        setStatus('unavailable');
      }
    })();
  }, []);

  useEffect(() => {
    const url = new URL(location.href);
    if (q.trim()) url.searchParams.set('q', q.trim()); else url.searchParams.delete('q');
    history.replaceState(null, '', url);
    if (!pf.current || !q.trim()) { setHits([]); setTerms([]); setTotal(0); return; }
    let cancelled = false;
    setStatus('loading');
    const term = q.trim();
    const timer = setTimeout(async () => {
      const [ch, gl] = await Promise.all([
        pf.current!.search(term, { filters: { tur: 'Bölüm' } }),
        pf.current!.search(term, { filters: { tur: 'Sözlük' } }),
      ]);
      const [chData, glData] = await Promise.all([
        Promise.all(ch.results.slice(0, MAX).map((r) => r.data())),
        Promise.all(gl.results.slice(0, MAX_TERMS).map((r) => r.data())),
      ]);
      if (cancelled) return;
      setTotal(ch.results.length + gl.results.length);
      setHits(chData.map(toHit));
      setTerms(glData.map((d) => ({ ...toHit(d), subs: [] })));
      setStatus('ready');
    }, 200);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [q, ready]);

  const message =
    status === 'unavailable' ? 'Arama dizini bulunamadı. Dizin yalnızca üretim derlemesinde oluşturulur.'
    : !q.trim() ? 'Bir sözcük ya da terim yazın; örneğin “evrim”, “Bilinemez” ya da “kuvvetin kalıcılığı”.'
    : status === 'loading' && hits.length + terms.length === 0 ? 'Aranıyor…'
    : total === 0 ? `“${q.trim()}” için sonuç yok.`
    : `“${q.trim()}” için ${total} sonuç.`;

  return (
    <div className="search">
      <form role="search" onSubmit={(e) => e.preventDefault()}>
        <label className="sr" htmlFor="arama-girdi">Kitapta ara</label>
        <input
          id="arama-girdi"
          className="search-input"
          type="search"
          inputMode="search"
          autoComplete="off"
          spellCheck={false}
          placeholder="Kitapta ara…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </form>
      <p className="search-status" role="status" aria-live="polite">{message}</p>
      {terms.length > 0 && (
        <section aria-labelledby="sonuc-sozluk" className="search-group">
          <h2 id="sonuc-sozluk" className="search-group-title">Sözlükte</h2>
          <ul className="search-terms">
            {terms.map((h) => (
              <li key={h.url}><a href={h.url}>{h.title}</a></li>
            ))}
          </ul>
        </section>
      )}
      {hits.length > 0 && (
        <section aria-labelledby="sonuc-bolum" className="search-group">
          <h2 id="sonuc-bolum" className="search-group-title">Bölümlerde</h2>
          <ol className="search-results">
            {hits.map((h) => (
              <li key={h.url}>
                <a className="search-title" href={h.url}>{h.title}</a>
                {h.part ? <span className="search-part">{h.part}</span> : null}
                <p className="search-excerpt" dangerouslySetInnerHTML={{ __html: h.excerpt }} />
                {h.subs.length > 0 && (
                  <ul className="search-subs">
                    {h.subs.map((s) => (
                      <li key={s.url}><a href={s.url}>{s.title}</a></li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}
