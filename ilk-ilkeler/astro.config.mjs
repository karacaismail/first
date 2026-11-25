import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import pagefind from 'astro-pagefind';
import { unified } from '@astrojs/markdown-remark';
import { remarkSpencer } from './src/lib/remark-spencer.mjs';

// Yayın adresi: GitHub Pages, https://karacaismail.github.io/first/
// Başka bir yerde yayınlamak için SITE_URL ve BASE_PATH ortam değişkenlerini verin.
const site = process.env.SITE_URL ?? 'https://karacaismail.github.io';
const base = process.env.BASE_PATH ?? '/first';

export default defineConfig({
  site,
  base,
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [react(), sitemap({ filter: (page) => !/\/(arama|404)\/?$/.test(new URL(page).pathname) }), pagefind()],
  markdown: {
    processor: unified({
      remarkPlugins: [remarkSpencer],
      remarkRehype: {
        footnoteLabel: 'Notlar',
        footnoteLabelTagName: 'h2',
        footnoteBackLabel: (ref, rereference) => `Metne dön (${ref + 1}${rereference > 1 ? '-' + rereference : ''})`,
      },
      gfm: true,
      smartypants: false,
    }),
  },
});
