import { useEffect, useRef, useState } from 'react';
import { Drawer, MantineProvider, Popover } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { theme } from '../lib/theme';
import { useMotionTokens } from '../lib/motion';

export interface TermInfo { key: string; tr: string; explanation: string; slug: string }
interface Props { terms: Record<string, TermInfo> }

interface Active { el: HTMLButtonElement; info: TermInfo; rect: { top: number; left: number; width: number; height: number } }

function Card({ info, withTitle }: { info: TermInfo; withTitle: boolean }) {
  return (
    <div className="termcard">
      {withTitle ? <p className="tr">{info.tr}</p> : null}
      <p className="en" lang="en">{info.key}</p>
      <p>{info.explanation}</p>
      <a href={`/sozluk/${info.slug}/`}>Sözlükte gör</a>
    </div>
  );
}

function Layer({ terms }: Props) {
  const [active, setActive] = useState<Active | null>(null);
  const wide = useMediaQuery('(min-width: 48em)', false, { getInitialValueInEffect: true });
  const motion = useMotionTokens();
  const lastEl = useRef<HTMLButtonElement | null>(null);
  // Dışarı tıklama mousedown'da kapatır; aynı terime yapılan tıklamanın onu hemen yeniden açmasını önler.
  const justClosed = useRef<{ el: HTMLButtonElement | null; at: number }>({ el: null, at: 0 });

  function close(returnFocus = true) {
    setActive((cur) => {
      if (cur) {
        cur.el.setAttribute('aria-expanded', 'false');
        justClosed.current = { el: cur.el, at: performance.now() };
      }
      return null;
    });
    const el = lastEl.current;
    if (returnFocus && el) requestAnimationFrame(() => el.focus({ preventScroll: true }));
  }

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest?.('button.term') as HTMLButtonElement | null;
      if (!target) return;
      const info = terms[target.dataset.term ?? ''];
      if (!info) return;
      e.preventDefault();
      const jc = justClosed.current;
      if (jc.el === target && performance.now() - jc.at < 400) return;
      if (active?.el === target) { close(); return; }
      if (active) active.el.setAttribute('aria-expanded', 'false');
      const r = target.getBoundingClientRect();
      setActive({ el: target, info, rect: { top: r.top + window.scrollY, left: r.left + window.scrollX, width: r.width, height: r.height } });
      target.setAttribute('aria-expanded', 'true');
      lastEl.current = target;
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  });

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); close(); } };
    // Yerleşim değişince çapa konumu eskir: paneli kapat.
    const onResize = () => close(false);
    document.addEventListener('keydown', onKey, true);
    window.addEventListener('resize', onResize);
    return () => { document.removeEventListener('keydown', onKey, true); window.removeEventListener('resize', onResize); };
  });

  if (!active) return null;
  const transitionProps = { duration: motion.base, exitDuration: motion.base, timingFunction: motion.ease, transition: 'fade' as const };

  if (!wide) {
    return (
      <Drawer
        opened
        onClose={() => close()}
        position="bottom"
        size="auto"
        title={active.info.tr}
        withCloseButton
        closeButtonProps={{ 'aria-label': 'Kapat', className: 'iconbtn' }}
        transitionProps={{ ...transitionProps, transition: 'slide-up' }}
        trapFocus
        returnFocus={false}
        classNames={{ inner: 'sheet-inner', content: 'sheet', header: 'sheet-header', title: 'sheet-title', body: 'sheet-body', overlay: 'sheet-overlay' }}
      >
        <Card info={active.info} withTitle={false} />
      </Drawer>
    );
  }

  return (
    <Popover
      opened
      onClose={() => close()}
      position="bottom"
      withArrow
      withRoles={false}
      width="var(--popover-w)"
      withinPortal
      trapFocus
      returnFocus={false}
      closeOnEscape
      closeOnClickOutside
      transitionProps={transitionProps}
      classNames={{ dropdown: 'pop', arrow: 'pop-arrow' }}
    >
      <Popover.Target>
        <span aria-hidden="true" className="pop-anchor" style={{ top: active.rect.top, left: active.rect.left, width: active.rect.width, height: active.rect.height }} />
      </Popover.Target>
      <Popover.Dropdown role="dialog" aria-label={`Terim: ${active.info.tr}`}>
        <Card info={active.info} withTitle />
      </Popover.Dropdown>
    </Popover>
  );
}

export default function TermLayer(props: Props) {
  return (
    <MantineProvider theme={theme} defaultColorScheme="auto">
      <Layer {...props} />
    </MantineProvider>
  );
}
