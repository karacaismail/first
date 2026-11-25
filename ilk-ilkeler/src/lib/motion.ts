import { useEffect, useState } from 'react';

// Hareket tokenlarının tek kaynağı src/styles/tokens.css'tir. JS tarafı (Mantine geçişleri)
// değerleri çalışma anında oradan okur; prefers-reduced-motion orada 0ms'e çekildiği için
// buraya da kendiliğinden yansır.
export interface MotionTokens { ease: string; fast: number; base: number; slow: number }

const ZERO: MotionTokens = { ease: 'linear', fast: 0, base: 0, slow: 0 };

function ms(v: string): number {
  const t = v.trim();
  if (!t) return 0;
  return t.endsWith('ms') ? parseFloat(t) : parseFloat(t) * 1000;
}

function read(): MotionTokens {
  const cs = getComputedStyle(document.documentElement);
  return {
    ease: cs.getPropertyValue('--motion-ease').trim() || 'linear',
    fast: ms(cs.getPropertyValue('--motion-fast')),
    base: ms(cs.getPropertyValue('--motion-base')),
    slow: ms(cs.getPropertyValue('--motion-slow')),
  };
}

export function useMotionTokens(): MotionTokens {
  const [m, setM] = useState<MotionTokens>(ZERO);
  useEffect(() => {
    setM(read());
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const on = () => setM(read());
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return m;
}
