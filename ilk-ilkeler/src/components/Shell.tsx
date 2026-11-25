import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AppShell, Burger, MantineProvider, useComputedColorScheme, useMantineColorScheme } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { theme } from '../lib/theme';
import { useMotionTokens } from '../lib/motion';

export interface NavPart { slug: string; title: string; label: string; href: string }
export interface NavItem { part: string; href: string; title: string; number: string }

interface Props {
  parts: NavPart[];
  items: NavItem[];
  current?: string;
  children?: ReactNode;
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}
function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  );
}
function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function SchemeToggle() {
  const { setColorScheme } = useMantineColorScheme();
  // 'auto' iken sistem temasına çözülmüş gerçek değer; ilk boyamada hidrasyon uyuşmazlığı olmasın diye efektte okunur.
  const computed = useComputedColorScheme('light', { getInitialValueInEffect: true });
  const next = computed === 'dark' ? 'light' : 'dark';
  return (
    <button
      type="button"
      className="iconbtn"
      onClick={() => setColorScheme(next)}
      aria-label={next === 'dark' ? 'Koyu temaya geç' : 'Açık temaya geç'}
      title={next === 'dark' ? 'Koyu tema' : 'Açık tema'}
    >
      {computed === 'dark' ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

function Inner({ parts, items, current, children }: Props) {
  const [opened, setOpened] = useState(false);
  const desktop = useMediaQuery('(min-width: 62em)', false, { getInitialValueInEffect: true });
  const motion = useMotionTokens();
  const burgerRef = useRef<HTMLButtonElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const hidden = !opened && !desktop;

  function close(returnFocus: boolean) {
    setOpened(false);
    if (returnFocus) requestAnimationFrame(() => burgerRef.current?.focus());
  }

  useEffect(() => {
    if (!opened || desktop) return;
    // Açılınca odak menüye girer: geçerli bölüm, yoksa ilk bağlantı.
    const nav = navRef.current;
    const target = nav?.querySelector<HTMLElement>('a[aria-current="page"]') ?? nav?.querySelector<HTMLElement>('a');
    requestAnimationFrame(() => target?.focus());
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(true); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [opened, desktop]);

  useEffect(() => { if (desktop) setOpened(false); }, [desktop]);

  return (
    <>
      <a className="skip" href="#icerik">İçeriğe geç</a>
      <AppShell
        header={{ height: 'var(--header-h)' }}
        navbar={{ width: 'var(--nav-w)', breakpoint: 'md', collapsed: { mobile: !opened } }}
        padding={0}
        transitionDuration={motion.base}
        transitionTimingFunction={motion.ease}
      >
        <AppShell.Header>
          <div className="hdr">
            <Burger
              ref={burgerRef}
              className="iconbtn"
              opened={opened}
              onClick={() => (opened ? close(false) : setOpened(true))}
              hiddenFrom="md"
              size="sm"
              aria-label={opened ? 'İçindekileri kapat' : 'İçindekileri aç'}
              aria-expanded={opened}
              aria-controls="icindekiler"
              transitionDuration={motion.fast}
              transitionTimingFunction={motion.ease}
            />
            <a className="brand" href="/">İlk İlkeler <small>Herbert Spencer</small></a>
            <div className="hdr-tools">
              <a className="iconbtn" href="/arama/" aria-label="Kitapta ara" title="Ara"><SearchIcon /></a>
              <SchemeToggle />
            </div>
          </div>
        </AppShell.Header>

        <AppShell.Navbar
          id="icindekiler"
          ref={navRef}
          className="navpane"
          inert={hidden}
          aria-hidden={hidden || undefined}
          style={{ transitionDuration: `${motion.base}ms` }}
        >
          <nav aria-label="İçindekiler">
            <ul className="navlist">
              {parts.map((p) => (
                <li key={p.slug}>
                  <div className="part"><a href={p.href}>{p.label}{p.label !== p.title ? ` · ${p.title}` : ''}</a></div>
                  <ul className="navlist">
                    {items.filter((i) => i.part === p.slug).map((i) => (
                      <li key={i.href}>
                        <a className="ch" href={i.href} aria-current={i.href === current ? 'page' : undefined}>
                          {i.number ? <span className="n">{i.number}</span> : null}
                          <span>{i.title}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
              <li><div className="part"><a href="/sozluk/">Terimler Sözlüğü</a></div></li>
              <li><div className="part"><a href="/hakkinda/">Bu Çeviri Hakkında</a></div></li>
            </ul>
          </nav>
        </AppShell.Navbar>

        <AppShell.Main id="icerik" tabIndex={-1}>{children}</AppShell.Main>
      </AppShell>
    </>
  );
}

export default function Shell(props: Props) {
  return (
    <MantineProvider theme={theme} defaultColorScheme="auto">
      <Inner {...props} />
    </MantineProvider>
  );
}
