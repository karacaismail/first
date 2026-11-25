import { createTheme, type MantineColorsTuple } from '@mantine/core';

const deniz: MantineColorsTuple = [
  '#e8f2f4', '#cfe2e7', '#a9cbd4', '#7fb1be', '#5c9aa9', '#3f8696', '#2c7383', '#1d5b6b', '#164b58', '#0f3a45',
];

// Renk, boşluk ve hareket değerlerinin kaynağı src/styles/tokens.css'tir; burada yalnız Mantine'in
// kendi ölçek anahtarları o tokenlara bağlanır.
export const theme = createTheme({
  fontFamily: 'var(--font)',
  headings: { fontFamily: 'var(--font)', fontWeight: '600' },
  primaryColor: 'deniz',
  colors: { deniz },
  focusRing: 'never',
  respectReducedMotion: true,
  defaultRadius: 'md',
  radius: { xs: 'var(--r-sm)', sm: 'var(--r-sm)', md: 'var(--r-md)', lg: 'var(--r-lg)', xl: 'var(--r-lg)' },
  // Hiçbir metin 14 CSS px altına inmez.
  fontSizes: { xs: 'var(--fs-min)', sm: 'var(--fs-small)', md: 'var(--fs-body)', lg: 'var(--fs-lead)', xl: 'var(--fs-h3)' },
  breakpoints: { xs: '36em', sm: '48em', md: '62em', lg: '75em', xl: '88em' },
});
